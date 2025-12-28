import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuditLog, LogAction, LogEntity, LogResult, RoleType } from '../types/business';

interface LogContextType {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByEntity: (entity: LogEntity) => AuditLog[];
  getLogsByAction: (action: LogAction) => AuditLog[];
  getLogsByDateRange: (startDate: Date, endDate: Date) => AuditLog[];
  getRecentLogs: (hours?: number) => AuditLog[];
  searchLogs: (query: string) => AuditLog[];
  getLogStats: () => {
    totalLogs: number;
    successCount: number;
    errorCount: number;
    warningCount: number;
    recentLogsCount: number;
    logsByAction: Record<LogAction, number>;
    logsByEntity: Record<string, number>;
  };
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('erp_audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convertir strings de fecha a objetos Date
        return parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      } catch (error) {
        console.error('Error al cargar logs:', error);
        return [];
      }
    }
    return [];
  });

  // Persistencia automática
  useEffect(() => {
    localStorage.setItem('erp_audit_logs', JSON.stringify(logs));
  }, [logs]);

  // Agregar nuevo log
  const addLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setLogs(prev => [newLog, ...prev]); // Más recientes primero
  };

  // Limpiar todos los logs
  const clearLogs = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todos los logs? Esta acción no se puede deshacer.')) {
      setLogs([]);
      localStorage.removeItem('erp_audit_logs');
    }
  };

  // Filtrar logs por usuario
  const getLogsByUser = (userId: string): AuditLog[] => {
    return logs.filter(log => log.userId === userId);
  };

  // Filtrar logs por entidad
  const getLogsByEntity = (entity: LogEntity): AuditLog[] => {
    return logs.filter(log => log.entity === entity);
  };

  // Filtrar logs por acción
  const getLogsByAction = (action: LogAction): AuditLog[] => {
    return logs.filter(log => log.action === action);
  };

  // Filtrar logs por rango de fechas
  const getLogsByDateRange = (startDate: Date, endDate: Date): AuditLog[] => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  };

  // Obtener logs recientes (por defecto últimas 24 horas)
  const getRecentLogs = (hours: number = 24): AuditLog[] => {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return logs.filter(log => new Date(log.timestamp) >= cutoffTime);
  };

  // Buscar logs por texto
  const searchLogs = (query: string): AuditLog[] => {
    const lowerQuery = query.toLowerCase();
    return logs.filter(log => 
      log.userEmail.toLowerCase().includes(lowerQuery) ||
      log.entityName.toLowerCase().includes(lowerQuery) ||
      log.details.toLowerCase().includes(lowerQuery) ||
      log.action.toLowerCase().includes(lowerQuery)
    );
  };

  // Obtener estadísticas de logs
  const getLogStats = () => {
    const totalLogs = logs.length;
    const successCount = logs.filter(l => l.result === 'success').length;
    const errorCount = logs.filter(l => l.result === 'error').length;
    const warningCount = logs.filter(l => l.result === 'warning').length;
    const recentLogsCount = getRecentLogs(24).length;

    // Contar por acción
    const logsByAction = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<LogAction, number>);

    // Contar por entidad
    const logsByEntity = logs.reduce((acc, log) => {
      acc[log.entity] = (acc[log.entity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs,
      successCount,
      errorCount,
      warningCount,
      recentLogsCount,
      logsByAction,
      logsByEntity
    };
  };

  return (
    <LogContext.Provider
      value={{
        logs,
        addLog,
        clearLogs,
        getLogsByUser,
        getLogsByEntity,
        getLogsByAction,
        getLogsByDateRange,
        getRecentLogs,
        searchLogs,
        getLogStats
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLog debe usarse dentro de un LogProvider');
  }
  return context;
}
