import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as gastosService from '../services/gastosService';
import type { Gasto, CreateGastoInput, UpdateGastoInput, EstadoGasto, EstadoPago } from '../types/gastos';

// Re-export types for components (backward compat)
export type GastoImplementacion = Gasto;
export type CreateGastoImplementacionInput = CreateGastoInput;
export type { EstadoGasto, EstadoPago };

const AREA = 'implementacion' as const;

interface ImplementacionContextType {
  gastos: Gasto[];
  loading: boolean;
  addGasto: (input: CreateGastoInput) => Promise<Gasto | null>;
  addMultipleGastos: (inputs: CreateGastoInput[]) => Promise<Gasto[]>;
  updateGasto: (input: UpdateGastoInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => Gasto | undefined;
  getGastosByOrdenId: (ordenId: string) => Gasto[];
  getGastosByItemOrdenId: (itemId: string) => Gasto[];
  approveGasto: (id: string) => Promise<boolean>;
  rejectGasto: (id: string) => Promise<boolean>;
  markGastoAsPaid: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  getTotalEjecutadoByOrden: (ordenId: string) => number;
  getTotalEjecutadoByItem: (itemId: string) => number;
}

const ImplementacionContext = createContext<ImplementacionContextType | undefined>(undefined);

export function ImplementacionProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await gastosService.getByArea(AREA);
      if (result.error) {
        console.error('[ImplementacionContext] Error:', result.error);
        return;
      }
      setGastos(result.data);
    } catch (err) {
      console.error('[ImplementacionContext] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGastos(); }, [fetchGastos]);

  const addGasto = async (input: CreateGastoInput): Promise<Gasto | null> => {
    const result = await gastosService.create({ ...input, areaOrigen: AREA });
    if (result.error || !result.data) return null;
    setGastos(prev => [...prev, result.data!]);
    return result.data;
  };

  const addMultipleGastos = async (inputs: CreateGastoInput[]): Promise<Gasto[]> => {
    if (inputs.length === 0) return [];
    const tagged = inputs.map(i => ({ ...i, areaOrigen: AREA as const }));
    const result = await gastosService.createMultiple(tagged);
    if (result.data.length > 0) setGastos(prev => [...prev, ...result.data]);
    return result.data;
  };

  const updateGasto = async (input: UpdateGastoInput): Promise<boolean> => {
    const result = await gastosService.update(input);
    if (result.error || !result.data) return false;
    setGastos(prev => prev.map(g => g.id === input.id ? result.data! : g));
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await gastosService.remove(id);
    if (!result.success) return false;
    setGastos(prev => prev.filter(g => g.id !== id));
    return true;
  };

  const getGastoById = useCallback((id: string) => gastos.find(g => g.id === id), [gastos]);
  const getGastosByOrdenId = useCallback((ordenId: string) => gastos.filter(g => g.ordenPublicidadId === ordenId), [gastos]);
  const getGastosByItemOrdenId = useCallback((itemId: string) => gastos.filter(g => g.itemOrdenPublicidadId === itemId), [gastos]);

  const approveGasto = async (id: string): Promise<boolean> => {
    const result = await gastosService.update({ id, estado: 'activo' });
    if (result.error) return false;
    await fetchGastos();
    return true;
  };

  const rejectGasto = async (id: string): Promise<boolean> => {
    const result = await gastosService.update({ id, estado: 'anulado' });
    if (result.error) return false;
    await fetchGastos();
    return true;
  };

  const markGastoAsPaid = async (id: string): Promise<boolean> => {
    const result = await gastosService.update({ id, estadoPago: 'pagado' });
    if (result.error) return false;
    await fetchGastos();
    return true;
  };

  const getTotalEjecutadoByOrden = (ordenId: string) => gastosService.calculateTotalEjecutado(getGastosByOrdenId(ordenId));
  const getTotalEjecutadoByItem = (itemId: string) => gastosService.calculateTotalEjecutado(getGastosByItemOrdenId(itemId));

  return (
    <ImplementacionContext.Provider value={{
      gastos, loading,
      addGasto, addMultipleGastos, updateGasto, deleteGasto,
      getGastoById, getGastosByOrdenId, getGastosByItemOrdenId,
      approveGasto, rejectGasto, markGastoAsPaid,
      refetch: fetchGastos,
      getTotalEjecutadoByOrden, getTotalEjecutadoByItem,
    }}>
      {children}
    </ImplementacionContext.Provider>
  );
}

export function useImplementacion() {
  const context = useContext(ImplementacionContext);
  if (context === undefined) throw new Error('useImplementacion must be used within an ImplementacionProvider');
  return context;
}
