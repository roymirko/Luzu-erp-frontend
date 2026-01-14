import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as implementacionService from '../services/implementacionService';
import type {
  GastoImplementacion as ServiceGasto,
  ItemGastoImplementacion as ServiceItem,
  CreateGastoImplementacionInput,
  CreateItemGastoInput,
} from '../types/implementacion';

export type EstadoOP = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPGM = 'pendiente-pago' | 'pagado' | 'anulado';

export interface BloqueImporte {
  id: string;
  programa: string;
  empresaPgm: string;
  fechaComprobante: string;
  proveedor: string;
  razonSocial: string;
  condicionPago: string;
  neto: string;
  documentoAdjunto?: string;
  estadoPgm: EstadoPGM;
}

export interface GastoImplementacion {
  id: string;
  estadoOP: EstadoOP;
  fechaRegistro: string;
  responsable: string;
  unidadNegocio: string;
  categoriaNegocio?: string;
  ordenPublicidad: string;
  presupuesto: string;
  cantidadProgramas: number;
  programasDisponibles: string[];
  sector: string;
  rubroGasto: string;
  subRubro: string;
  nombreCampana: string;
  acuerdoPago: string;
  facturaEmitidaA: string;
  empresa: string;
  conceptoGasto: string;
  observaciones: string;
  importes: BloqueImporte[];
  idFormularioComercial?: string;
  formItemId?: string;
}

interface ImplementacionContextType {
  gastos: GastoImplementacion[];
  loading: boolean;
  addGasto: (gasto: GastoImplementacion) => Promise<boolean>;
  updateGasto: (id: string, updates: Partial<GastoImplementacion>) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  getGastoById: (id: string) => GastoImplementacion | undefined;
  getGastoByFormItemId: (formId: string, itemId: string) => GastoImplementacion | undefined;
  refetch: () => Promise<void>;
}

const ImplementacionContext = createContext<ImplementacionContextType | undefined>(undefined);

function serviceItemToBloque(item: ServiceItem): BloqueImporte {
  return {
    id: item.id,
    programa: '',
    empresaPgm: item.empresaPgm,
    fechaComprobante: item.fechaComprobante,
    proveedor: item.proveedor,
    razonSocial: item.razonSocial,
    condicionPago: item.condicionPago,
    neto: String(item.neto),
    documentoAdjunto: item.adjuntos?.[0],
    estadoPgm: item.estadoPago as EstadoPGM,
  };
}

function serviceGastoToContext(gasto: ServiceGasto): GastoImplementacion {
  return {
    id: gasto.id,
    estadoOP: gasto.estadoGasto as EstadoOP,
    fechaRegistro: gasto.fechaRegistro,
    responsable: '',
    unidadNegocio: '',
    categoriaNegocio: '',
    ordenPublicidad: '',
    presupuesto: '0',
    cantidadProgramas: 0,
    programasDisponibles: [],
    sector: 'Implementación',
    rubroGasto: 'Gasto de venta',
    subRubro: '',
    nombreCampana: '',
    acuerdoPago: '',
    facturaEmitidaA: gasto.facturaEmitidaA,
    empresa: gasto.empresa,
    conceptoGasto: gasto.conceptoGasto,
    observaciones: gasto.observaciones,
    importes: gasto.items.map(serviceItemToBloque),
    idFormularioComercial: gasto.idFormularioComercial,
    formItemId: gasto.itemOrdenPublicidadId,
  };
}

function contextGastoToCreateInput(gasto: GastoImplementacion): CreateGastoImplementacionInput {
  return {
    fechaRegistro: gasto.fechaRegistro || new Date().toISOString().split('T')[0],
    idFormularioComercial: gasto.idFormularioComercial,
    itemOrdenPublicidadId: gasto.formItemId,
    facturaEmitidaA: gasto.facturaEmitidaA,
    empresa: gasto.empresa,
    conceptoGasto: gasto.conceptoGasto,
    observaciones: gasto.observaciones,
    items: gasto.importes.map(bloqueToCreateItemInput),
  };
}

function bloqueToCreateItemInput(bloque: BloqueImporte): CreateItemGastoInput {
  return {
    empresaPgm: bloque.empresaPgm,
    fechaComprobante: bloque.fechaComprobante,
    proveedor: bloque.proveedor,
    razonSocial: bloque.razonSocial,
    condicionPago: bloque.condicionPago,
    neto: parseFloat(bloque.neto) || 0,
  };
}

export function ImplementacionProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<GastoImplementacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await implementacionService.getAll();
      if (result.error) {
        console.error('Error fetching gastos:', result.error);
        return;
      }
      setGastos(result.data.map(serviceGastoToContext));
    } catch (err) {
      console.error('Error in fetchGastos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const addGasto = async (gasto: GastoImplementacion): Promise<boolean> => {
    const input = contextGastoToCreateInput(gasto);
    const result = await implementacionService.create(input);

    if (result.error || !result.data) {
      console.error('Error adding gasto:', result.error);
      return false;
    }

    await fetchGastos();
    return true;
  };

  const updateGasto = async (id: string, updates: Partial<GastoImplementacion>): Promise<boolean> => {
    const result = await implementacionService.update({
      id,
      facturaEmitidaA: updates.facturaEmitidaA,
      empresa: updates.empresa,
      conceptoGasto: updates.conceptoGasto,
      observaciones: updates.observaciones,
      estadoGasto: updates.estadoOP,
      items: updates.importes?.map(bloqueToCreateItemInput),
    });

    if (result.error) {
      console.error('Error updating gasto:', result.error);
      return false;
    }

    await fetchGastos();
    return true;
  };

  const deleteGasto = async (id: string): Promise<boolean> => {
    const result = await implementacionService.remove(id);

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

  const getGastoByFormItemId = (formId: string, itemId: string) => {
    return gastos.find((g) => g.idFormularioComercial === formId && g.formItemId === itemId);
  };

  return (
    <ImplementacionContext.Provider
      value={{
        gastos,
        loading,
        addGasto,
        updateGasto,
        deleteGasto,
        getGastoById,
        getGastoByFormItemId,
        refetch: fetchGastos,
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
