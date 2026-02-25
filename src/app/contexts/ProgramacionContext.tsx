import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import * as gastosService from '../services/gastosService';
import * as ctxRepo from '../repositories/contextoComprobanteRepository';
import type { Gasto, CreateGastoInput, UpdateGastoInput, ContextoComprobante, CreateContextoComprobanteInput } from '../types/gastos';

// Backward compat types
export type GastoProgramacion = Gasto;
export type CreateGastoProgramacionInput = CreateGastoInput;
export type UpdateGastoProgramacionInput = UpdateGastoInput;

const AREA = 'programacion' as const;

export interface FormularioAgrupado {
  id: string;
  estado: string;
  createdAt: Date;
  ejecutivo: string;
  programa?: string;
  facturaEmitidaA?: string;
  empresa?: string;
  unidadNegocio: string;
  subRubroEmpresa?: string;
  detalleCampana?: string;
  proveedor?: string;
  razonSocial?: string;
  netoTotal: number;
  gastosCount: number;
}

export interface CreateMultipleGastosInput {
  formulario: CreateContextoComprobanteInput;
  gastos: Omit<CreateGastoInput, 'areaOrigen' | 'contextoComprobanteId'>[];
}

interface ProgramacionContextType {
  gastos: Gasto[];
  formulariosAgrupados: FormularioAgrupado[];
  loading: boolean;
  addGasto: (input: CreateGastoInput) => Promise<boolean>;
  addMultipleGastos: (input: CreateMultipleGastosInput) => Promise<{ success: boolean; error?: string }>;
  addGastoToFormulario: (formularioId: string, input: Partial<CreateGastoInput>) => Promise<Gasto | null>;
  updateGasto: (input: UpdateGastoInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => Gasto | undefined;
  getGastosByFormularioId: (formularioId: string) => Gasto[];
  refetch: () => Promise<void>;
}

const ProgramacionContext = createContext<ProgramacionContextType | undefined>(undefined);

export function ProgramacionProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await gastosService.getByArea(AREA);
      if (result.error) { console.error('[ProgramacionContext] Error:', result.error); return; }
      setGastos(result.data);
    } catch (err) { console.error('[ProgramacionContext] Error:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGastos(); }, [fetchGastos]);

  const addGasto = async (input: CreateGastoInput): Promise<boolean> => {
    const result = await gastosService.create({ ...input, areaOrigen: AREA });
    if (result.error || !result.data) return false;
    setGastos(prev => [...prev, result.data!]);
    return true;
  };

  const addMultipleGastos = async (input: CreateMultipleGastosInput): Promise<{ success: boolean; error?: string }> => {
    // 1. Create contexto_comprobante (header)
    const ctxResult = await ctxRepo.create({
      area_origen: AREA,
      mes_gestion: input.formulario.mesGestion || null,
      detalle_campana: input.formulario.detalleCampana || null,
      nombre_campana: input.formulario.nombreCampana || null,
      unidad_negocio: input.formulario.unidadNegocio || null,
      categoria_negocio: input.formulario.categoriaNegocio || null,
      mes_venta: input.formulario.mesVenta || null,
      mes_inicio: input.formulario.mesInicio || null,
      programa: input.formulario.programa || null,
      ejecutivo: input.formulario.ejecutivo || null,
      rubro: null,
      sub_rubro: null,
      estado: 'activo',
      created_by: input.formulario.createdBy || null,
    });

    if (ctxResult.error || !ctxResult.data) {
      return { success: false, error: ctxResult.error?.message || 'Error al crear formulario' };
    }

    // 2. Create gastos linked to the contexto
    const tagged = input.gastos.map(g => ({
      ...g,
      areaOrigen: AREA as const,
      contextoComprobanteId: ctxResult.data!.id,
    }));

    const result = await gastosService.createMultiple(tagged);
    if (result.error) return { success: false, error: result.error };

    setGastos(prev => [...prev, ...result.data]);
    return { success: true };
  };

  const addGastoToFormulario = async (formularioId: string, input: Partial<CreateGastoInput>): Promise<Gasto | null> => {
    const result = await gastosService.create({
      proveedor: input.proveedor || '',
      neto: input.neto || 0,
      empresa: input.empresa || '',
      conceptoGasto: input.conceptoGasto || '',
      ...input,
      areaOrigen: AREA,
      contextoComprobanteId: formularioId,
    });
    if (result.error || !result.data) return null;
    setGastos(prev => [...prev, result.data!]);
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

  const getGastoById = (id: string) => gastos.find(g => g.id === id);
  const getGastosByFormularioId = (formularioId: string) => gastos.filter(g => g.contextoComprobanteId === formularioId);

  const formulariosAgrupados = useMemo((): FormularioAgrupado[] => {
    const groupedMap = new Map<string, Gasto[]>();
    for (const gasto of gastos) {
      if (!gasto.contextoComprobanteId) continue;
      const existing = groupedMap.get(gasto.contextoComprobanteId) || [];
      existing.push(gasto);
      groupedMap.set(gasto.contextoComprobanteId, existing);
    }

    const result: FormularioAgrupado[] = [];
    for (const [formularioId, formularioGastos] of groupedMap) {
      const first = formularioGastos[0];
      const netoTotal = formularioGastos.reduce((sum, g) => sum + (g.neto || 0), 0);
      result.push({
        id: formularioId,
        estado: first.ctxEstado || 'activo',
        createdAt: first.createdAt,
        ejecutivo: first.ctxEjecutivo || '',
        programa: first.ctxPrograma,
        facturaEmitidaA: first.facturaEmitidaA,
        empresa: first.empresa,
        unidadNegocio: first.ctxUnidadNegocio || '',
        subRubroEmpresa: first.subRubro,
        detalleCampana: first.ctxDetalleCampana,
        proveedor: first.proveedor,
        razonSocial: first.razonSocial,
        netoTotal,
        gastosCount: formularioGastos.length,
      });
    }
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return result;
  }, [gastos]);

  return (
    <ProgramacionContext.Provider value={{
      gastos, formulariosAgrupados, loading,
      addGasto, addMultipleGastos, addGastoToFormulario,
      updateGasto, deleteGasto, getGastoById, getGastosByFormularioId,
      refetch: fetchGastos,
    }}>
      {children}
    </ProgramacionContext.Provider>
  );
}

export function useProgramacion() {
  const context = useContext(ProgramacionContext);
  if (context === undefined) throw new Error('useProgramacion must be used within a ProgramacionProvider');
  return context;
}
