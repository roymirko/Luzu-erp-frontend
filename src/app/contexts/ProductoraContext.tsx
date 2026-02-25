import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import * as gastosService from '../services/gastosService';
import * as ctxRepo from '../repositories/contextoComprobanteRepository';
import type { Gasto, CreateGastoInput, UpdateGastoInput, CreateContextoComprobanteInput } from '../types/gastos';

export type GastoProductora = Gasto;
export type CreateGastoProductoraInput = CreateGastoInput;
export type UpdateGastoProductoraInput = UpdateGastoInput;

const AREA = 'productora' as const;

export interface FormularioProductoraAgrupado {
  id: string;
  estado: string;
  createdAt: Date;
  createdBy?: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  rubro: string;
  subRubro: string;
  nombreCampana: string;
  detalleCampana?: string;
  proveedor?: string;
  razonSocial?: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  netoTotal: number;
  gastosCount: number;
}

export interface CreateMultipleGastosProductoraInput {
  formulario: CreateContextoComprobanteInput;
  gastos: Omit<CreateGastoInput, 'areaOrigen' | 'contextoComprobanteId'>[];
}

interface ProductoraContextType {
  gastos: Gasto[];
  formulariosAgrupados: FormularioProductoraAgrupado[];
  loading: boolean;
  addMultipleGastos: (input: CreateMultipleGastosProductoraInput) => Promise<{ success: boolean; error?: string }>;
  addGastoToFormulario: (formularioId: string, input: Partial<CreateGastoInput>) => Promise<Gasto | null>;
  updateGasto: (input: UpdateGastoInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => Gasto | undefined;
  getGastosByFormularioId: (formularioId: string) => Gasto[];
  refetch: () => Promise<void>;
}

const ProductoraContext = createContext<ProductoraContextType | undefined>(undefined);

export function ProductoraProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await gastosService.getByArea(AREA);
      if (result.error) { console.error('[ProductoraContext] Error:', result.error); return; }
      setGastos(result.data);
    } catch (err) { console.error('[ProductoraContext] Error:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGastos(); }, [fetchGastos]);

  const addMultipleGastos = async (input: CreateMultipleGastosProductoraInput): Promise<{ success: boolean; error?: string }> => {
    const ctxResult = await ctxRepo.create({
      area_origen: AREA,
      mes_gestion: input.formulario.mesGestion || null,
      detalle_campana: input.formulario.detalleCampana || null,
      nombre_campana: input.formulario.nombreCampana || null,
      unidad_negocio: input.formulario.unidadNegocio || null,
      categoria_negocio: input.formulario.categoriaNegocio || null,
      mes_venta: null,
      mes_inicio: null,
      programa: null,
      ejecutivo: null,
      rubro: input.formulario.rubro || null,
      sub_rubro: input.formulario.subRubro || null,
      estado: 'activo',
      created_by: input.formulario.createdBy || null,
    });
    if (ctxResult.error || !ctxResult.data) {
      return { success: false, error: ctxResult.error?.message || 'Error al crear formulario' };
    }
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

  const formulariosAgrupados = useMemo((): FormularioProductoraAgrupado[] => {
    const groupedMap = new Map<string, Gasto[]>();
    for (const gasto of gastos) {
      if (!gasto.contextoComprobanteId) continue;
      const existing = groupedMap.get(gasto.contextoComprobanteId) || [];
      existing.push(gasto);
      groupedMap.set(gasto.contextoComprobanteId, existing);
    }
    const result: FormularioProductoraAgrupado[] = [];
    for (const [formularioId, formularioGastos] of groupedMap) {
      const first = formularioGastos[0];
      const netoTotal = formularioGastos.reduce((sum, g) => sum + (g.neto || 0), 0);
      result.push({
        id: formularioId,
        estado: first.ctxEstado || 'activo',
        createdAt: first.createdAt,
        createdBy: first.createdBy,
        unidadNegocio: first.ctxUnidadNegocio || '',
        categoriaNegocio: first.ctxCategoriaNegocio || '',
        rubro: first.ctxRubro || '',
        subRubro: first.ctxSubRubro || '',
        nombreCampana: first.ctxNombreCampana || '',
        detalleCampana: first.ctxDetalleCampana,
        proveedor: first.proveedor,
        razonSocial: first.razonSocial,
        facturaEmitidaA: first.facturaEmitidaA,
        empresaContext: first.empresaPrograma,
        netoTotal,
        gastosCount: formularioGastos.length,
      });
    }
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return result;
  }, [gastos]);

  return (
    <ProductoraContext.Provider value={{
      gastos, formulariosAgrupados, loading,
      addMultipleGastos, addGastoToFormulario,
      updateGasto, deleteGasto, getGastoById, getGastosByFormularioId,
      refetch: fetchGastos,
    }}>
      {children}
    </ProductoraContext.Provider>
  );
}

export function useProductora() {
  const context = useContext(ProductoraContext);
  if (context === undefined) throw new Error('useProductora must be used within a ProductoraProvider');
  return context;
}
