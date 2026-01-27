import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import * as experienceService from '../services/experienceService';
import type {
  GastoExperience,
  CreateGastoExperienceInput,
  UpdateGastoExperienceInput,
  FormularioExperienceAgrupado,
  CreateMultipleGastosExperienceInput,
} from '../types/experience';

interface ExperienceContextType {
  gastos: GastoExperience[];
  formulariosAgrupados: FormularioExperienceAgrupado[];
  loading: boolean;
  addGasto: (input: CreateGastoExperienceInput) => Promise<boolean>;
  addMultipleGastos: (input: CreateMultipleGastosExperienceInput) => Promise<{ success: boolean; error?: string }>;
  updateGasto: (input: UpdateGastoExperienceInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => GastoExperience | undefined;
  getGastosByFormularioId: (formularioId: string) => GastoExperience[];
  refetch: () => Promise<void>;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<GastoExperience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await experienceService.getAll();
      if (result.error) {
        console.error('Error fetching gastos experience:', result.error);
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

  const addGasto = async (input: CreateGastoExperienceInput): Promise<boolean> => {
    const result = await experienceService.create(input);

    if (result.error || !result.data) {
      console.error('Error adding gasto:', result.error);
      return false;
    }

    await fetchGastos();
    return true;
  };

  const addMultipleGastos = async (input: CreateMultipleGastosExperienceInput): Promise<{ success: boolean; error?: string }> => {
    const result = await experienceService.createMultiple(input);

    if (result.error || result.data.length === 0) {
      console.error('Error adding multiple gastos:', result.error);
      return { success: false, error: result.error || 'Error desconocido al crear gastos' };
    }

    await fetchGastos();
    return { success: true };
  };

  const updateGasto = async (input: UpdateGastoExperienceInput): Promise<boolean> => {
    const result = await experienceService.update(input);

    if (result.error) {
      console.error('Error updating gasto:', result.error);
      return false;
    }

    await fetchGastos();
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await experienceService.remove(id);

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

  const getGastosByFormularioId = (formularioId: string) => {
    return gastos.filter((g) => g.formularioId === formularioId);
  };

  // Compute grouped formularios with aggregated data
  const formulariosAgrupados = useMemo((): FormularioExperienceAgrupado[] => {
    const groupedMap = new Map<string, GastoExperience[]>();

    // Group gastos by formularioId
    for (const gasto of gastos) {
      const existing = groupedMap.get(gasto.formularioId) || [];
      existing.push(gasto);
      groupedMap.set(gasto.formularioId, existing);
    }

    // Convert to FormularioExperienceAgrupado array
    const result: FormularioExperienceAgrupado[] = [];
    for (const [formularioId, formularioGastos] of groupedMap) {
      const firstGasto = formularioGastos[0];
      const netoTotal = formularioGastos.reduce((sum, g) => sum + (g.neto || 0), 0);

      result.push({
        id: formularioId,
        estado: firstGasto.formularioEstado || 'activo',
        createdAt: firstGasto.formularioCreatedAt || firstGasto.createdAt,
        createdBy: firstGasto.formularioCreatedBy,
        nombreCampana: firstGasto.nombreCampana || '',
        detalleCampana: firstGasto.detalleCampana,
        subrubro: firstGasto.subrubro || '',
        proveedor: firstGasto.proveedor,
        razonSocial: firstGasto.razonSocial,
        netoTotal,
        gastosCount: formularioGastos.length,
      });
    }

    // Sort by createdAt descending
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return result;
  }, [gastos]);

  return (
    <ExperienceContext.Provider
      value={{
        gastos,
        formulariosAgrupados,
        loading,
        addGasto,
        addMultipleGastos,
        updateGasto,
        deleteGasto,
        getGastoById,
        getGastosByFormularioId,
        refetch: fetchGastos,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (context === undefined) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
}
