import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as ordenesService from '../services/ordenesPublicidadService';
import type { OrdenPublicidad, ItemOrdenPublicidad, CreateOrdenPublicidadInput } from '../types/comercial';
import { useData } from './DataContext';

export type { OrdenPublicidad, ItemOrdenPublicidad };

export interface FormularioData extends OrdenPublicidad {
  importeRows: ItemOrdenPublicidad[];
}

export interface FormularioNotification {
  id: string;
  formularioId: string;
  ordenPublicidad: string;
  responsable: string;
  timestamp: Date;
  read: boolean;
}

interface FormulariosContextType {
  formularios: FormularioData[];
  notifications: FormularioNotification[];
  loading: boolean;
  addFormulario: (formulario: Partial<FormularioData>) => Promise<{ success: boolean; error?: string }>;
  deleteFormulario: (id: string) => Promise<{ success: boolean }>;
  updateFormulario: (id: string, formulario: FormularioData) => Promise<{ success: boolean }>;
  getFormularioById: (id: string) => FormularioData | undefined;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  refetch: () => Promise<void>;
}

const FormulariosContext = createContext<FormulariosContextType | undefined>(undefined);

function toFormularioData(orden: OrdenPublicidad): FormularioData {
  return {
    ...orden,
    importeRows: orden.items,
  };
}

export function FormulariosProvider({ children }: { children: ReactNode }) {
  const [formularios, setFormularios] = useState<FormularioData[]>([]);
  const [notifications, setNotifications] = useState<FormularioNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useData();

  const fetchFormularios = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ordenesService.getAll();
      if (result.error) {
        console.error('Error fetching formularios:', result.error);
        return;
      }
      setFormularios(result.data.map(toFormularioData));
    } catch (err) {
      console.error('Error in fetchFormularios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormularios();
  }, [fetchFormularios]);

  const addFormulario = async (formulario: Partial<FormularioData>): Promise<{ success: boolean; error?: string }> => {
    const input: CreateOrdenPublicidadInput = {
      mesServicio: formulario.mesServicio || '',
      responsable: formulario.responsable || currentUser?.firstName + ' ' + currentUser?.lastName || '',
      ordenPublicidad: formulario.ordenPublicidad || '',
      totalVenta: formulario.totalVenta || '',
      unidadNegocio: formulario.unidadNegocio || '',
      categoriaNegocio: formulario.categoriaNegocio || '',
      proyecto: formulario.proyecto,
      razonSocial: formulario.razonSocial || '',
      categoria: formulario.categoria || '',
      empresaAgencia: formulario.empresaAgencia || '',
      marca: formulario.marca || '',
      nombreCampana: formulario.nombreCampana || '',
      acuerdoPago: formulario.acuerdoPago || '',
      tipoImporte: formulario.tipoImporte || 'factura',
      observaciones: formulario.observaciones,
      items: (formulario.importeRows || []).map(item => ({
        programa: item.programa,
        monto: item.monto,
        ncPrograma: item.ncPrograma,
        ncPorcentaje: item.ncPorcentaje,
        proveedorFee: item.proveedorFee,
        feePrograma: item.feePrograma,
        feePorcentaje: item.feePorcentaje,
        implementacion: item.implementacion,
        talentos: item.talentos,
        tecnica: item.tecnica,
      })),
      createdBy: currentUser?.id,
    };

    const result = await ordenesService.create(input);

    if (result.error || !result.data) {
      return { success: false, error: result.error || 'Error al crear el formulario' };
    }

    const newFormulario = toFormularioData(result.data);
    setFormularios(prev => [newFormulario, ...prev]);

    const newNotification: FormularioNotification = {
      id: Date.now().toString(),
      formularioId: newFormulario.id,
      ordenPublicidad: newFormulario.ordenPublicidad,
      responsable: newFormulario.responsable,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [...prev, newNotification]);

    return { success: true };
  };

  const deleteFormulario = async (id: string): Promise<{ success: boolean }> => {
    const result = await ordenesService.remove(id);

    if (!result.success) {
      return { success: false };
    }

    setFormularios(prev => prev.filter(f => f.id !== id));
    setNotifications(prev => prev.filter(n => n.formularioId !== id));
    return { success: true };
  };

  const updateFormulario = async (id: string, formulario: FormularioData): Promise<{ success: boolean }> => {
    const result = await ordenesService.update({
      id,
      mesServicio: formulario.mesServicio,
      responsable: formulario.responsable,
      ordenPublicidad: formulario.ordenPublicidad,
      totalVenta: formulario.totalVenta,
      unidadNegocio: formulario.unidadNegocio,
      categoriaNegocio: formulario.categoriaNegocio,
      proyecto: formulario.proyecto,
      razonSocial: formulario.razonSocial,
      categoria: formulario.categoria,
      empresaAgencia: formulario.empresaAgencia,
      marca: formulario.marca,
      nombreCampana: formulario.nombreCampana,
      acuerdoPago: formulario.acuerdoPago,
      tipoImporte: formulario.tipoImporte,
      observaciones: formulario.observaciones,
      items: formulario.importeRows.map(item => ({
        id: item.id,
        programa: item.programa,
        monto: item.monto,
        ncPrograma: item.ncPrograma,
        ncPorcentaje: item.ncPorcentaje,
        proveedorFee: item.proveedorFee,
        feePrograma: item.feePrograma,
        feePorcentaje: item.feePorcentaje,
        implementacion: item.implementacion,
        talentos: item.talentos,
        tecnica: item.tecnica,
      })),
    });

    if (result.error || !result.data) {
      return { success: false };
    }

    const updatedFormulario = toFormularioData(result.data);
    setFormularios(prev => prev.map(f => f.id === id ? updatedFormulario : f));
    return { success: true };
  };

  const getFormularioById = (id: string): FormularioData | undefined => {
    return formularios.find(f => f.id === id);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <FormulariosContext.Provider value={{
      formularios,
      notifications,
      loading,
      addFormulario,
      deleteFormulario,
      updateFormulario,
      getFormularioById,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      removeNotification,
      refetch: fetchFormularios,
    }}>
      {children}
    </FormulariosContext.Provider>
  );
}

export function useFormularios() {
  const context = useContext(FormulariosContext);
  if (context === undefined) {
    throw new Error('useFormularios must be used within a FormulariosProvider');
  }
  return context;
}
