import { supabase } from '../services/supabase';
import type {
  GastoInsert,
  GastoUpdate,
  TecnicaComprobanteInsert,
  TecnicaComprobanteUpdate,
  TecnicaGastoFullRow,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
  ComprobanteInsert,
  ComprobanteUpdate,
} from './types';

const COMPROBANTES_TABLE = 'comprobantes';
const CONTEXT_TABLE = 'tecnica_comprobantes';
const VIEW_NAME = 'tecnica_gastos_full';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

function mapGastoToComprobante(gasto: GastoInsert, context?: Partial<{ factura_emitida_a: string | null; forma_pago: string | null; fecha_pago: string | null }>): ComprobanteInsert {
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
    estado_pago: (gasto.estado_pago === 'pendiente-pago' ? 'creado' : gasto.estado_pago) as 'creado' | 'aprobado' | 'requiere_info' | 'rechazado' | 'pagado',
    created_by: gasto.created_by || null,
    factura_emitida_a: context?.factura_emitida_a || null,
    forma_pago: context?.forma_pago || null,
    fecha_pago: context?.fecha_pago || null,
  };
}

function mapGastoUpdateToComprobante(update: GastoUpdate, extras?: Partial<ComprobanteUpdate>): ComprobanteUpdate {
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
    result.estado_pago = (update.estado_pago === 'pendiente-pago' ? 'creado' : update.estado_pago) as 'creado' | 'aprobado' | 'requiere_info' | 'rechazado' | 'pagado';
  }
  // Consolidated fields from extras
  if (extras) Object.assign(result, extras);
  return result;
}

function mapContextInsert(context: Omit<TecnicaGastoInsert, 'gasto_id'>, comprobanteId: string): TecnicaComprobanteInsert {
  return {
    comprobante_id: comprobanteId,
    orden_publicidad_id: context.orden_publicidad_id || null,
    item_orden_publicidad_id: context.item_orden_publicidad_id || null,
    sector: context.sector || null,
    rubro: context.rubro || null,
    sub_rubro: context.sub_rubro || null,
    condicion_pago: context.condicion_pago || null,
    adjuntos: context.adjuntos || null,
    unidad_negocio: context.unidad_negocio || null,
    categoria_negocio: context.categoria_negocio || null,
    nombre_campana: context.nombre_campana || null,
  };
}

// Re-use the same shape as ImplementacionGastoInsert for the context insert
type TecnicaGastoInsert = {
  gasto_id: string;
  orden_publicidad_id: string | null;
  item_orden_publicidad_id: string | null;
  factura_emitida_a: string | null;
  sector: string | null;
  rubro: string | null;
  sub_rubro: string | null;
  condicion_pago: string | null;
  forma_pago: string | null;
  fecha_pago: string | null;
  adjuntos: unknown | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  nombre_campana: string | null;
};

export async function findAll(): Promise<RepositoryListResult<TecnicaGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as TecnicaGastoFullRow[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<TecnicaGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as TecnicaGastoFullRow, error: null };
}

export async function findByOrdenId(ordenId: string): Promise<RepositoryListResult<TecnicaGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('orden_publicidad_id', ordenId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as TecnicaGastoFullRow[], error: null };
}

export async function findByItemOrdenId(itemId: string): Promise<RepositoryListResult<TecnicaGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('item_orden_publicidad_id', itemId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as TecnicaGastoFullRow[], error: null };
}

export async function create(
  gasto: GastoInsert,
  context: Omit<TecnicaGastoInsert, 'gasto_id'>
): Promise<RepositoryResult<TecnicaGastoFullRow>> {
  // Validate FK: ensure orden_publicidad_id exists before insert
  if (context.orden_publicidad_id) {
    const { data: opExists } = await supabase
      .from('ordenes_publicidad')
      .select('id')
      .eq('id', context.orden_publicidad_id)
      .single();
    if (!opExists) {
      console.error('[TecnicaRepo] orden_publicidad_id not found:', context.orden_publicidad_id);
      return { data: null, error: { code: 'FK_VIOLATION', message: `La orden de publicidad no existe. Verifique que el formulario sea válido.` } };
    }
  }

  const comprobanteData = mapGastoToComprobante(gasto, {
    factura_emitida_a: context.factura_emitida_a || null,
    forma_pago: context.forma_pago || null,
    fecha_pago: context.fecha_pago || null,
  });

  const { data: comprobante, error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .insert(comprobanteData)
    .select()
    .single();

  if (comprobanteError || !comprobante) {
    console.error('[TecnicaRepo] Error insertando comprobante:', comprobanteError);
    return { data: null, error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
  }

  const contextInsert = mapContextInsert(context, comprobante.id);

  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    console.error('[TecnicaRepo] Error insertando contexto:', contextError);
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  return findById(comprobante.id);
}

export async function createMultiple(
  items: Array<{ gasto: GastoInsert; context: Omit<TecnicaGastoInsert, 'gasto_id'> }>
): Promise<RepositoryListResult<TecnicaGastoFullRow>> {
  const results: TecnicaGastoFullRow[] = [];
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

export async function update(
  id: string,
  gastoUpdate?: GastoUpdate,
  contextUpdate?: TecnicaComprobanteUpdate,
  comprobanteExtras?: Partial<ComprobanteUpdate>
): Promise<RepositoryResult<TecnicaGastoFullRow>> {
  if ((gastoUpdate && Object.keys(gastoUpdate).length > 0) || (comprobanteExtras && Object.keys(comprobanteExtras).length > 0)) {
    const comprobanteUpdate = mapGastoUpdateToComprobante(gastoUpdate || {}, comprobanteExtras);
    const { error: comprobanteError } = await supabase
      .from(COMPROBANTES_TABLE)
      .update(comprobanteUpdate)
      .eq('id', id);

    if (comprobanteError) {
      return { data: null, error: mapSupabaseError(comprobanteError) };
    }
  }

  if (contextUpdate && Object.keys(contextUpdate).length > 0) {
    const { error: contextError } = await supabase
      .from(CONTEXT_TABLE)
      .update(contextUpdate)
      .eq('comprobante_id', id);

    if (contextError) {
      return { data: null, error: mapSupabaseError(contextError) };
    }
  }

  return findById(id);
}

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

export async function updateEstado(id: string, estado: string): Promise<RepositoryResult<TecnicaGastoFullRow>> {
  return update(id, { estado });
}

export async function updateEstadoPago(id: string, estadoPago: string): Promise<RepositoryResult<TecnicaGastoFullRow>> {
  return update(id, { estado_pago: estadoPago });
}
