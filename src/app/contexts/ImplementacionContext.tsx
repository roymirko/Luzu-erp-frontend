import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as implementacionService from '../services/implementacionService';
import type {
  GastoImplementacion,
  CreateGastoImplementacionInput,
  UpdateGastoImplementacionInput,
  EstadoGasto,
  EstadoPago,
} from '../types/implementacion';

// Re-export types for components
export type { GastoImplementacion, CreateGastoImplementacionInput, EstadoGasto, EstadoPago };

interface ImplementacionContextType {
  gastos: GastoImplementacion[];
  loading: boolean;
  // CRUD operations
  addGasto: (input: CreateGastoImplementacionInput) => Promise<GastoImplementacion | null>;
  addMultipleGastos: (inputs: CreateGastoImplementacionInput[]) => Promise<GastoImplementacion[]>;
  updateGasto: (input: UpdateGastoImplementacionInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  // Query operations
  getGastoById: (id: string) => GastoImplementacion | undefined;
  getGastosByOrdenId: (ordenId: string) => GastoImplementacion[];
  getGastosByItemOrdenId: (itemId: string) => GastoImplementacion[];
  // Workflow operations
  approveGasto: (id: string) => Promise<boolean>;
  rejectGasto: (id: string) => Promise<boolean>;
  markGastoAsPaid: (id: string) => Promise<boolean>;
  // Refresh
  refetch: () => Promise<void>;
  // Calculations
  getTotalEjecutadoByOrden: (ordenId: string) => number;
  getTotalEjecutadoByItem: (itemId: string) => number;
}

const ImplementacionContext = createContext<ImplementacionContextType | undefined>(undefined);

export function ImplementacionProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<GastoImplementacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[ImplementacionContext] Cargando todos los gastos...');
      const result = await implementacionService.getAll();
      if (result.error) {
        console.error('[ImplementacionContext] Error fetching gastos:', result.error);
        return;
      }
      console.log('[ImplementacionContext] Gastos cargados:', result.data.length, result.data);
      setGastos(result.data);
    } catch (err) {
      console.error('[ImplementacionContext] Error in fetchGastos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const addGasto = async (input: CreateGastoImplementacionInput): Promise<GastoImplementacion | null> => {
    const result = await implementacionService.create(input);

    if (result.error || !result.data) {
      console.error('Error adding gasto:', result.error);
      return null;
    }

    setGastos(prev => [...prev, result.data!]);
    return result.data;
  };

  const addMultipleGastos = async (inputs: CreateGastoImplementacionInput[]): Promise<GastoImplementacion[]> => {
    if (inputs.length === 0) return [];

    console.log('[ImplementacionContext] Creando gastos, inputs:', inputs);
    const result = await implementacionService.createMultiple(inputs);
    console.log('[ImplementacionContext] Resultado createMultiple:', result);

    if (result.error) {
      console.error('[ImplementacionContext] Error adding multiple gastos:', result.error);
      return result.data;
    }

    console.log('[ImplementacionContext] Gastos creados exitosamente:', result.data);
    setGastos(prev => [...prev, ...result.data]);
    return result.data;
  };

  const updateGasto = async (input: UpdateGastoImplementacionInput): Promise<boolean> => {
    const result = await implementacionService.update(input);

    if (result.error || !result.data) {
      console.error('Error updating gasto:', result.error);
      return false;
    }

    setGastos(prev => prev.map(g => g.id === input.id ? result.data! : g));
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await implementacionService.remove(id);

    if (!result.success) {
      console.error('Error deleting gasto:', result.error);
      return false;
    }

    setGastos(prev => prev.filter(g => g.id !== id));
    return true;
  };

  const getGastoById = useCallback((id: string): GastoImplementacion | undefined => {
    return gastos.find((g) => g.id === id);
  }, [gastos]);

  const getGastosByOrdenId = useCallback((ordenId: string): GastoImplementacion[] => {
    return gastos.filter((g) => g.ordenPublicidadId === ordenId);
  }, [gastos]);

  const getGastosByItemOrdenId = useCallback((itemId: string): GastoImplementacion[] => {
    return gastos.filter((g) => g.itemOrdenPublicidadId === itemId);
  }, [gastos]);

  const approveGastoFn = async (id: string): Promise<boolean> => {
    const result = await implementacionService.approveGasto(id);

    if (!result.success || !result.data) {
      console.error('Error approving gasto:', result.error);
      return false;
    }

    setGastos(prev => prev.map(g => g.id === id ? result.data! : g));
    return true;
  };

  const rejectGastoFn = async (id: string): Promise<boolean> => {
    const result = await implementacionService.rejectGasto(id);

    if (!result.success || !result.data) {
      console.error('Error rejecting gasto:', result.error);
      return false;
    }

    setGastos(prev => prev.map(g => g.id === id ? result.data! : g));
    return true;
  };

  const markGastoAsPaidFn = async (id: string): Promise<boolean> => {
    const result = await implementacionService.markGastoAsPaid(id);

    if (!result.success || !result.data) {
      console.error('Error marking gasto as paid:', result.error);
      return false;
    }

    setGastos(prev => prev.map(g => g.id === id ? result.data! : g));
    return true;
  };

  const getTotalEjecutadoByOrden = (ordenId: string): number => {
    const ordenGastos = getGastosByOrdenId(ordenId);
    return implementacionService.calculateTotalEjecutado(ordenGastos);
  };

  const getTotalEjecutadoByItem = (itemId: string): number => {
    const itemGastos = getGastosByItemOrdenId(itemId);
    return implementacionService.calculateTotalEjecutado(itemGastos);
  };

  return (
    <ImplementacionContext.Provider
      value={{
        gastos,
        loading,
        addGasto,
        addMultipleGastos,
        updateGasto,
        deleteGasto,
        getGastoById,
        getGastosByOrdenId,
        getGastosByItemOrdenId,
        approveGasto: approveGastoFn,
        rejectGasto: rejectGastoFn,
        markGastoAsPaid: markGastoAsPaidFn,
        refetch: fetchGastos,
        getTotalEjecutadoByOrden,
        getTotalEjecutadoByItem,
      }}
    >
      {children}
    </ImplementacionContext.Provider>
  );
}

export function useImplementacion() {
  const context = useContext(ImplementacionContext);
  if (context === undefined) {
    throw new Error('useImplementacion must be used within an ImplementacionProvider');
  }
  return context;
}
