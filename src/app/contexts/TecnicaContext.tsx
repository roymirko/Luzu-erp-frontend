import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as tecnicaService from '../services/tecnicaService';
import type {
  GastoTecnica,
  CreateGastoTecnicaInput,
  UpdateGastoTecnicaInput,
  EstadoGasto,
  EstadoPago,
} from '../types/tecnica';

export type { GastoTecnica, CreateGastoTecnicaInput, EstadoGasto, EstadoPago };

interface TecnicaContextType {
  gastos: GastoTecnica[];
  loading: boolean;
  addGasto: (input: CreateGastoTecnicaInput) => Promise<GastoTecnica | null>;
  addMultipleGastos: (inputs: CreateGastoTecnicaInput[]) => Promise<GastoTecnica[]>;
  updateGasto: (input: UpdateGastoTecnicaInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => GastoTecnica | undefined;
  getGastosByOrdenId: (ordenId: string) => GastoTecnica[];
  getGastosByItemOrdenId: (itemId: string) => GastoTecnica[];
  approveGasto: (id: string) => Promise<boolean>;
  rejectGasto: (id: string) => Promise<boolean>;
  markGastoAsPaid: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  getTotalEjecutadoByOrden: (ordenId: string) => number;
  getTotalEjecutadoByItem: (itemId: string) => number;
}

const TecnicaContext = createContext<TecnicaContextType | undefined>(undefined);

export function TecnicaProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<GastoTecnica[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[TecnicaContext] Cargando todos los gastos...');
      const result = await tecnicaService.getAll();
      if (result.error) {
        console.error('[TecnicaContext] Error fetching gastos:', result.error);
        return;
      }
      console.log('[TecnicaContext] Gastos cargados:', result.data.length);
      setGastos(result.data);
    } catch (err) {
      console.error('[TecnicaContext] Error in fetchGastos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const addGasto = async (input: CreateGastoTecnicaInput): Promise<GastoTecnica | null> => {
    const result = await tecnicaService.create(input);
    if (result.error || !result.data) {
      console.error('Error adding gasto tecnica:', result.error);
      return null;
    }
    setGastos(prev => [...prev, result.data!]);
    return result.data;
  };

  const addMultipleGastos = async (inputs: CreateGastoTecnicaInput[]): Promise<GastoTecnica[]> => {
    if (inputs.length === 0) return [];
    console.log('[TecnicaContext] Creando gastos, inputs:', inputs);
    const result = await tecnicaService.createMultiple(inputs);
    console.log('[TecnicaContext] Resultado createMultiple:', result);
    if (result.error) {
      console.error('[TecnicaContext] Error adding multiple gastos:', result.error);
    }
    // Always update state with successfully created gastos (even on partial failure)
    if (result.data.length > 0) {
      console.log('[TecnicaContext] Gastos creados:', result.data.length);
      setGastos(prev => [...prev, ...result.data]);
    }
    return result.data;
  };

  const updateGasto = async (input: UpdateGastoTecnicaInput): Promise<boolean> => {
    const result = await tecnicaService.update(input);
    if (result.error || !result.data) {
      console.error('Error updating gasto tecnica:', result.error);
      return false;
    }
    setGastos(prev => prev.map(g => g.id === input.id ? result.data! : g));
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await tecnicaService.remove(id);
    if (!result.success) {
      console.error('Error deleting gasto tecnica:', result.error);
      return false;
    }
    setGastos(prev => prev.filter(g => g.id !== id));
    return true;
  };

  const getGastoById = useCallback((id: string): GastoTecnica | undefined => {
    return gastos.find((g) => g.id === id);
  }, [gastos]);

  const getGastosByOrdenId = useCallback((ordenId: string): GastoTecnica[] => {
    return gastos.filter((g) => g.ordenPublicidadId === ordenId);
  }, [gastos]);

  const getGastosByItemOrdenId = useCallback((itemId: string): GastoTecnica[] => {
    return gastos.filter((g) => g.itemOrdenPublicidadId === itemId);
  }, [gastos]);

  const approveGastoFn = async (id: string): Promise<boolean> => {
    const result = await tecnicaService.approveGasto(id);
    if (!result.success) {
      console.error('Error approving gasto tecnica:', result.error);
      return false;
    }
    await fetchGastos();
    return true;
  };

  const rejectGastoFn = async (id: string): Promise<boolean> => {
    const result = await tecnicaService.rejectGasto(id);
    if (!result.success) {
      console.error('Error rejecting gasto tecnica:', result.error);
      return false;
    }
    await fetchGastos();
    return true;
  };

  const markGastoAsPaidFn = async (id: string): Promise<boolean> => {
    const result = await tecnicaService.markGastoAsPaid(id);
    if (!result.success) {
      console.error('Error marking gasto tecnica as paid:', result.error);
      return false;
    }
    await fetchGastos();
    return true;
  };

  const getTotalEjecutadoByOrden = (ordenId: string): number => {
    const ordenGastos = getGastosByOrdenId(ordenId);
    return tecnicaService.calculateTotalEjecutado(ordenGastos);
  };

  const getTotalEjecutadoByItem = (itemId: string): number => {
    const itemGastos = getGastosByItemOrdenId(itemId);
    return tecnicaService.calculateTotalEjecutado(itemGastos);
  };

  return (
    <TecnicaContext.Provider
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
    </TecnicaContext.Provider>
  );
}

export function useTecnica() {
  const context = useContext(TecnicaContext);
  if (context === undefined) {
    throw new Error('useTecnica must be used within a TecnicaProvider');
  }
  return context;
}
