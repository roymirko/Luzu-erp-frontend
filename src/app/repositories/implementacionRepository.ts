import { supabase } from '../services/supabase';
import type {
  GastoInsert,
  GastoUpdate,
  ImplementacionGastoInsert,
  ImplementacionGastoUpdate,
  ImplementacionGastoFullRow,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
  ComprobanteInsert,
  ComprobanteUpdate,
  ImplementacionComprobanteInsert,
  ImplementacionComprobanteUpdate,
} from './types';

// Use actual tables, not views
const COMPROBANTES_TABLE = 'comprobantes';
const CONTEXT_TABLE = 'implementacion_comprobantes';
const VIEW_NAME = 'implementacion_gastos_full'; // Legacy view for reading

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

/**
 * Maps old GastoInsert to new ComprobanteInsert
 */
function mapGastoToComprobante(gasto: GastoInsert): ComprobanteInsert {
  return {
    tipo_movimiento: 'egreso',
    entidad_id: null,
    entidad_nombre: gasto.proveedor,
    entidad_cuit: null,
    tipo_comprobante: gasto.tipo_factura || null,
    punto_venta: null,
    numero_comprobante: gasto.numero_factura || null,
    fecha_comprobante: gasto.fecha_factura || null,
    cae: null,
    fecha_vencimiento_cae: null,
    moneda: gasto.moneda || 'ARS',
    neto: gasto.neto,
    iva_alicuota: gasto.iva ?? 21,
    iva_monto: gasto.neto * ((gasto.iva ?? 21) / 100),
    percepciones: 0,
    total: gasto.importe_total,
    empresa: gasto.empresa || null,
    concepto: gasto.concepto_gasto || null,
    observaciones: gasto.observaciones || null,
    estado: gasto.estado || 'activo',
    estado_pago: (gasto.estado_pago === 'pendiente-pago' ? 'pendiente' : gasto.estado_pago) as 'pendiente' | 'pagado' | 'anulado',
    created_by: gasto.created_by || null,
  };
}

/**
 * Maps old GastoUpdate to new ComprobanteUpdate
 */
function mapGastoUpdateToComprobante(update: GastoUpdate): ComprobanteUpdate {
  const result: ComprobanteUpdate = {};
  if (update.proveedor !== undefined) result.entidad_nombre = update.proveedor;
  if (update.tipo_factura !== undefined) result.tipo_comprobante = update.tipo_factura;
  if (update.numero_factura !== undefined) result.numero_comprobante = update.numero_factura;
  if (update.fecha_factura !== undefined) result.fecha_comprobante = update.fecha_factura;
  if (update.moneda !== undefined) result.moneda = update.moneda;
  if (update.neto !== undefined) result.neto = update.neto;
  if (update.iva !== undefined) {
    result.iva_alicuota = update.iva;
    if (update.neto !== undefined) {
      result.iva_monto = update.neto * (update.iva / 100);
    }
  }
  if (update.importe_total !== undefined) result.total = update.importe_total;
  if (update.empresa !== undefined) result.empresa = update.empresa;
  if (update.concepto_gasto !== undefined) result.concepto = update.concepto_gasto;
  if (update.observaciones !== undefined) result.observaciones = update.observaciones;
  if (update.estado !== undefined) result.estado = update.estado;
  if (update.estado_pago !== undefined) {
    result.estado_pago = (update.estado_pago === 'pendiente-pago' ? 'pendiente' : update.estado_pago) as 'pendiente' | 'pagado' | 'anulado';
  }
  return result;
}

/**
 * Maps old ImplementacionGastoInsert to new ImplementacionComprobanteInsert
 */
function mapContextInsert(context: Omit<ImplementacionGastoInsert, 'gasto_id'>, comprobanteId: string): ImplementacionComprobanteInsert {
  return {
    comprobante_id: comprobanteId,
    orden_publicidad_id: context.orden_publicidad_id || null,
    item_orden_publicidad_id: context.item_orden_publicidad_id || null,
    factura_emitida_a: context.factura_emitida_a || null,
    sector: context.sector || null,
    rubro_gasto: context.rubro_gasto || null,
    sub_rubro: context.sub_rubro || null,
    condicion_pago: context.condicion_pago || null,
    forma_pago: context.forma_pago || null,
    fecha_pago: context.fecha_pago || null,
    adjuntos: context.adjuntos || null,
  };
}

/**
 * Obtiene todos los gastos de implementación (desde la vista)
 */
export async function findAll(): Promise<RepositoryListResult<ImplementacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ImplementacionGastoFullRow[], error: null };
}

/**
 * Obtiene un gasto por ID (desde la vista)
 */
export async function findById(id: string): Promise<RepositoryResult<ImplementacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ImplementacionGastoFullRow, error: null };
}

/**
 * Obtiene todos los gastos de una orden de publicidad
 */
export async function findByOrdenId(ordenId: string): Promise<RepositoryListResult<ImplementacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('orden_publicidad_id', ordenId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ImplementacionGastoFullRow[], error: null };
}

/**
 * Obtiene todos los gastos de un item de orden de publicidad
 */
export async function findByItemOrdenId(itemId: string): Promise<RepositoryListResult<ImplementacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('item_orden_publicidad_id', itemId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ImplementacionGastoFullRow[], error: null };
}

/**
 * Crea un nuevo gasto de implementación
 * Inserta en comprobantes (core) y luego en implementacion_comprobantes (contexto)
 */
export async function create(
  gasto: GastoInsert,
  context: Omit<ImplementacionGastoInsert, 'gasto_id'>
): Promise<RepositoryResult<ImplementacionGastoFullRow>> {
  // 1. Map and insert into comprobantes (core)
  const comprobanteData = mapGastoToComprobante(gasto);
  const { data: comprobante, error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .insert(comprobanteData)
    .select()
    .single();

  if (comprobanteError || !comprobante) {
    return { data: null, error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
  }

  // 2. Insert into implementacion_comprobantes (context)
  const contextInsert = mapContextInsert(context, comprobante.id);
  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    // Rollback: delete the comprobante we just created
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  // 3. Return full record from view
  return findById(comprobante.id);
}

/**
 * Crea múltiples gastos de implementación
 */
export async function createMultiple(
  items: Array<{ gasto: GastoInsert; context: Omit<ImplementacionGastoInsert, 'gasto_id'> }>
): Promise<RepositoryListResult<ImplementacionGastoFullRow>> {
  const results: ImplementacionGastoFullRow[] = [];
  const errors: RepositoryError[] = [];

  for (const item of items) {
    const result = await create(item.gasto, item.context);
    if (result.error) {
      errors.push(result.error);
    } else if (result.data) {
      results.push(result.data);
    }
  }

  if (errors.length > 0) {
    return { data: results, error: errors[0] };
  }

  return { data: results, error: null };
}

/**
 * Actualiza un gasto de implementación
 */
export async function update(
  id: string,
  gastoUpdate?: GastoUpdate,
  contextUpdate?: ImplementacionGastoUpdate
): Promise<RepositoryResult<ImplementacionGastoFullRow>> {
  // 1. Update comprobantes (core) if provided
  if (gastoUpdate && Object.keys(gastoUpdate).length > 0) {
    const comprobanteUpdate = mapGastoUpdateToComprobante(gastoUpdate);
    const { error: comprobanteError } = await supabase
      .from(COMPROBANTES_TABLE)
      .update(comprobanteUpdate)
      .eq('id', id);

    if (comprobanteError) {
      return { data: null, error: mapSupabaseError(comprobanteError) };
    }
  }

  // 2. Update implementacion_comprobantes (context) if provided
  if (contextUpdate && Object.keys(contextUpdate).length > 0) {
    const { error: contextError } = await supabase
      .from(CONTEXT_TABLE)
      .update(contextUpdate)
      .eq('comprobante_id', id);

    if (contextError) {
      return { data: null, error: mapSupabaseError(contextError) };
    }
  }

  // 3. Return updated record from view
  return findById(id);
}

/**
 * Elimina un gasto de implementación
 * El CASCADE en implementacion_comprobantes eliminará automáticamente el contexto
 */
export async function remove(id: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase
    .from(COMPROBANTES_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: null, error: null };
}

/**
 * Actualiza el estado de un gasto (pendiente, activo, cerrado, anulado)
 */
export async function updateEstado(id: string, estado: string): Promise<RepositoryResult<ImplementacionGastoFullRow>> {
  return update(id, { estado });
}

/**
 * Actualiza el estado de pago de un gasto
 */
export async function updateEstadoPago(id: string, estadoPago: string): Promise<RepositoryResult<ImplementacionGastoFullRow>> {
  return update(id, { estado_pago: estadoPago });
}
