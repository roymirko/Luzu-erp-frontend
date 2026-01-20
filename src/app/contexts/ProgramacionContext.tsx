import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as programacionService from '../services/programacionService';
import type { GastoProgramacion, CreateGastoProgramacionInput, UpdateGastoProgramacionInput } from '../types/programacion';

interface ProgramacionContextType {
  gastos: GastoProgramacion[];
  loading: boolean;
  addGasto: (input: CreateGastoProgramacionInput) => Promise<boolean>;
  updateGasto: (input: UpdateGastoProgramacionInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => GastoProgramacion | undefined;
  refetch: () => Promise<void>;
}

const ProgramacionContext = createContext<ProgramacionContextType | undefined>(undefined);

export function ProgramacionProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<GastoProgramacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await programacionService.getAll();
      if (result.error) {
        console.error('Error fetching gastos programacion:', result.error);
        return;
      }
      setGastos(result.data);
    } catch (err) {
      console.error('Error in fetchGastos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const addGasto = async (input: CreateGastoProgramacionInput): Promise<boolean> => {
    const result = await programacionService.create(input);

    if (result.error || !result.data) {
      console.error('Error adding gasto:', result.error);
      return false;
    }

    await fetchGastos();
    return true;
  };

  const updateGasto = async (input: UpdateGastoProgramacionInput): Promise<boolean> => {
    const result = await programacionService.update(input);

    if (result.error) {
      console.error('Error updating gasto:', result.error);
      return false;
    }

    await fetchGastos();
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await programacionService.remove(id);

    if (!result.success) {
      console.error('Error deleting gasto:', result.error);
      return false;
    }

    await fetchGastos();
    return true;
  };

  const getGastoById = (id: string) => {
    return gastos.find((g) => g.id === id);
  };

  return (
    <ProgramacionContext.Provider
      value={{
        gastos,
        loading,
        addGasto,
        updateGasto,
        deleteGasto,
        getGastoById,
        refetch: fetchGastos,
      }}
    >
      {children}
    </ProgramacionContext.Provider>
  );
}

export function useProgramacion() {
  const context = useContext(ProgramacionContext);
  if (context === undefined) {
    throw new Error('useProgramacion must be used within a ProgramacionProvider');
  }
  return context;
}
