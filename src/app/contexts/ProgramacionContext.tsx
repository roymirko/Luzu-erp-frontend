import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import * as programacionService from '../services/programacionService';
import type { GastoProgramacion, CreateGastoProgramacionInput, UpdateGastoProgramacionInput, FormularioAgrupado } from '../types/programacion';
import type { CreateMultipleGastosInput } from '../services/programacionService';

interface AddGastoToFormularioInput {
  proveedor: string;
  razonSocial: string;
  neto: number;
  iva?: number;
  empresa?: string;
  observaciones?: string;
  facturaEmitidaA?: string;
  categoria?: string;
  acuerdoPago?: string;
  formaPago?: string;
  fechaFactura?: Date;
  createdBy?: string;
}

interface ProgramacionContextType {
  gastos: GastoProgramacion[];
  formulariosAgrupados: FormularioAgrupado[];
  loading: boolean;
  addGasto: (input: CreateGastoProgramacionInput) => Promise<boolean>;
  addMultipleGastos: (input: CreateMultipleGastosInput) => Promise<{ success: boolean; error?: string }>;
  addGastoToFormulario: (formularioId: string, input: AddGastoToFormularioInput) => Promise<GastoProgramacion | null>;
  updateGasto: (input: UpdateGastoProgramacionInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => GastoProgramacion | undefined;
  getGastosByFormularioId: (formularioId: string) => GastoProgramacion[];
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

    setGastos(prev => [...prev, result.data!]);
    return true;
  };

  const addMultipleGastos = async (input: CreateMultipleGastosInput): Promise<{ success: boolean; error?: string }> => {
    const result = await programacionService.createMultiple(input);

    if (result.error || result.data.length === 0) {
      console.error('Error adding multiple gastos:', result.error);
      return { success: false, error: result.error || 'Error desconocido al crear gastos' };
    }

    setGastos(prev => [...prev, ...result.data]);
    return { success: true };
  };

  const addGastoToFormulario = async (formularioId: string, input: AddGastoToFormularioInput): Promise<GastoProgramacion | null> => {
    const result = await programacionService.addGastoToFormulario(formularioId, input);

    if (result.error || !result.data) {
      console.error('Error adding gasto to formulario:', result.error);
      return null;
    }

    setGastos(prev => [...prev, result.data!]);
    return result.data;
  };

  const updateGasto = async (input: UpdateGastoProgramacionInput): Promise<boolean> => {
    const result = await programacionService.update(input);

    if (result.error || !result.data) {
      console.error('Error updating gasto:', result.error);
      return false;
    }

    setGastos(prev => prev.map(g => g.id === input.id ? result.data! : g));
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await programacionService.remove(id);

    if (!result.success) {
      console.error('Error deleting gasto:', result.error);
      return false;
    }

    setGastos(prev => prev.filter(g => g.id !== id));
    return true;
  };

  const getGastoById = (id: string) => {
    return gastos.find((g) => g.id === id);
  };

  const getGastosByFormularioId = (formularioId: string) => {
    return gastos.filter((g) => g.formularioId === formularioId);
  };

  // Compute grouped formularios with aggregated data
  const formulariosAgrupados = useMemo((): FormularioAgrupado[] => {
    const groupedMap = new Map<string, GastoProgramacion[]>();

    // Group gastos by formularioId
    for (const gasto of gastos) {
      const existing = groupedMap.get(gasto.formularioId) || [];
      existing.push(gasto);
      groupedMap.set(gasto.formularioId, existing);
    }

    // Convert to FormularioAgrupado array
    const result: FormularioAgrupado[] = [];
    for (const [formularioId, formularioGastos] of groupedMap) {
      const firstGasto = formularioGastos[0];
      const netoTotal = formularioGastos.reduce((sum, g) => sum + (g.neto || 0), 0);

      result.push({
        id: formularioId,
        estado: (firstGasto.formularioEstado || 'activo') as FormularioAgrupado['estado'],
        createdAt: firstGasto.formularioCreatedAt || firstGasto.createdAt,
        ejecutivo: firstGasto.ejecutivo || '',
        programa: firstGasto.programa,
        facturaEmitidaA: firstGasto.facturaEmitidaA,
        empresa: firstGasto.empresa,
        unidadNegocio: firstGasto.unidadNegocio || '',
        subRubroEmpresa: firstGasto.subRubroEmpresa,
        detalleCampana: firstGasto.detalleCampana,
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
    <ProgramacionContext.Provider
      value={{
        gastos,
        formulariosAgrupados,
        loading,
        addGasto,
        addMultipleGastos,
        addGastoToFormulario,
        updateGasto,
        deleteGasto,
        getGastoById,
        getGastosByFormularioId,
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
