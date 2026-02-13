import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import * as productoraService from '../services/productoraService';
import type {
  GastoProductora,
  CreateGastoProductoraInput,
  UpdateGastoProductoraInput,
  FormularioProductoraAgrupado,
  CreateMultipleGastosProductoraInput,
} from '../types/productora';

interface AddGastoToFormularioInput {
  proveedor: string;
  razonSocial: string;
  neto: number;
  iva?: number;
  empresa?: string;
  observaciones?: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  acuerdoPago?: string;
  formaPago?: string;
  pais?: string;
  createdBy?: string;
  numeroFactura?: string;
}

interface ProductoraContextType {
  gastos: GastoProductora[];
  formulariosAgrupados: FormularioProductoraAgrupado[];
  loading: boolean;
  addMultipleGastos: (input: CreateMultipleGastosProductoraInput) => Promise<{ success: boolean; error?: string }>;
  addGastoToFormulario: (formularioId: string, input: AddGastoToFormularioInput) => Promise<GastoProductora | null>;
  updateGasto: (input: UpdateGastoProductoraInput) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => GastoProductora | undefined;
  getGastosByFormularioId: (formularioId: string) => GastoProductora[];
  refetch: () => Promise<void>;
}

const ProductoraContext = createContext<ProductoraContextType | undefined>(undefined);

export function ProductoraProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<GastoProductora[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productoraService.getAll();
      if (result.error) {
        console.error('Error fetching gastos productora:', result.error);
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

  const addMultipleGastos = async (input: CreateMultipleGastosProductoraInput): Promise<{ success: boolean; error?: string }> => {
    const result = await productoraService.createMultiple(input);

    if (result.error || result.data.length === 0) {
      console.error('Error adding multiple gastos:', result.error);
      return { success: false, error: result.error || 'Error desconocido al crear gastos' };
    }

    setGastos(prev => [...prev, ...result.data]);
    return { success: true };
  };

  const addGastoToFormulario = async (formularioId: string, input: AddGastoToFormularioInput): Promise<GastoProductora | null> => {
    const result = await productoraService.addGastoToFormulario(formularioId, input);

    if (result.error || !result.data) {
      console.error('Error adding gasto to formulario:', result.error);
      return null;
    }

    setGastos(prev => [...prev, result.data!]);
    return result.data;
  };

  const updateGasto = async (input: UpdateGastoProductoraInput): Promise<boolean> => {
    const result = await productoraService.update(input);

    if (result.error || !result.data) {
      console.error('Error updating gasto:', result.error);
      return false;
    }

    setGastos(prev => prev.map(g => g.id === input.id ? result.data! : g));
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await productoraService.remove(id);

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

  const formulariosAgrupados = useMemo((): FormularioProductoraAgrupado[] => {
    const groupedMap = new Map<string, GastoProductora[]>();

    for (const gasto of gastos) {
      const existing = groupedMap.get(gasto.formularioId) || [];
      existing.push(gasto);
      groupedMap.set(gasto.formularioId, existing);
    }

    const result: FormularioProductoraAgrupado[] = [];
    for (const [formularioId, formularioGastos] of groupedMap) {
      const firstGasto = formularioGastos[0];
      const netoTotal = formularioGastos.reduce((sum, g) => sum + (g.neto || 0), 0);

      result.push({
        id: formularioId,
        estado: firstGasto.formularioEstado || 'activo',
        createdAt: firstGasto.formularioCreatedAt || firstGasto.createdAt,
        createdBy: firstGasto.formularioCreatedBy,
        unidadNegocio: firstGasto.unidadNegocio || '',
        categoriaNegocio: firstGasto.categoriaNegocio || '',
        rubro: firstGasto.formularioRubro || '',
        subRubro: firstGasto.formularioSubRubro || '',
        nombreCampana: firstGasto.nombreCampana || '',
        detalleCampana: firstGasto.detalleCampana,
        proveedor: firstGasto.proveedor,
        razonSocial: firstGasto.razonSocial,
        facturaEmitidaA: firstGasto.facturaEmitidaA,
        empresaContext: firstGasto.empresaContext,
        netoTotal,
        gastosCount: formularioGastos.length,
      });
    }

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return result;
  }, [gastos]);

  return (
    <ProductoraContext.Provider
      value={{
        gastos,
        formulariosAgrupados,
        loading,
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
    </ProductoraContext.Provider>
  );
}

export function useProductora() {
  const context = useContext(ProductoraContext);
  if (context === undefined) {
    throw new Error('useProductora must be used within a ProductoraProvider');
  }
  return context;
}
