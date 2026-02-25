/**
 * Unified gastos repository — all areas, single table.
 * Queries comprobantes (direct) + comprobantes_full (view) filtered by area_origen.
 */
import { supabase } from '../services/supabase';
import type { RepositoryResult, RepositoryListResult, RepositoryError } from './types';

const TABLE = 'comprobantes';
const VIEW = 'comprobantes_full';

/** Row from comprobantes_full view (simplified — all context is flattened) */
export interface GastoFullRow {
  // Core comprobante
  id: string;
  tipo_movimiento: string;
  entidad_id: string | null;
  entidad_nombre: string;
  entidad_cuit: string | null;
  tipo_comprobante: string | null;
  punto_venta: string | null;
  numero_comprobante: string | null;
  fecha_comprobante: string | null;
  cae: string | null;
  fecha_vencimiento_cae: string | null;
  moneda: string;
  neto: number;
  iva_alicuota: number;
  iva_monto: number;
  percepciones: number;
  total: number;
  empresa: string | null;
  concepto: string | null;
  observaciones: string | null;
  estado: string;
  estado_pago: string;
  forma_pago: string | null;
  cotizacion: number | null;
  banco: string | null;
  numero_operacion: string | null;
  fecha_pago: string | null;
  factura_emitida_a: string | null;
  acuerdo_pago: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Flattened context (on comprobantes)
  area_origen: string | null;
  contexto_comprobante_id: string | null;
  orden_publicidad_id: string | null;
  item_orden_publicidad_id: string | null;
  sector: string | null;
  rubro_contexto: string | null;
  sub_rubro_contexto: string | null;
  condicion_pago: string | null;
  adjuntos: unknown | null;
  nombre_campana: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  categoria: string | null;
  cliente: string | null;
  monto_prog: number | null;
  valor_imponible: number | null;
  bonificacion: number | null;
  empresa_programa: string | null;
  pais: string | null;
  // From view JOINs
  ctx_mes_gestion: string | null;
  ctx_detalle_campana: string | null;
  ctx_programa: string | null;
  ctx_ejecutivo: string | null;
  ctx_mes_venta: string | null;
  ctx_mes_inicio: string | null;
  ctx_nombre_campana: string | null;
  ctx_unidad_negocio: string | null;
  ctx_categoria_negocio: string | null;
  ctx_rubro: string | null;
  ctx_sub_rubro: string | null;
  ctx_estado: string | null;
  ctx_created_at: string | null;
  ctx_created_by: string | null;
  op_numero_orden: string | null;
  op_responsable: string | null;
  op_unidad_negocio: string | null;
  op_categoria_negocio: string | null;
  op_nombre_campana: string | null;
  op_razon_social: string | null;
  op_marca: string | null;
  op_mes_servicio: string | null;
  op_acuerdo_pago: string | null;
  // Ingreso OP
  ingreso_op_id: string | null;
  ingreso_op_numero: string | null;
  ingreso_op_responsable: string | null;
  ingreso_op_unidad_negocio: string | null;
  ingreso_op_nombre_campana: string | null;
  ingreso_op_marca: string | null;
  ingreso_op_razon_social: string | null;
  ingreso_op_importe: string | null;
  ingreso_op_acuerdo_pago: string | null;
  ingreso_op_mes_servicio: string | null;
  // Entidad resolved
  entidad_cuit_efectivo: string | null;
  entidad_condicion_iva: string | null;
}

/** Insert row — matches comprobantes table columns */
export interface GastoInsertRow {
  tipo_movimiento: string;
  entidad_id?: string | null;
  entidad_nombre: string;
  entidad_cuit?: string | null;
  tipo_comprobante?: string | null;
  punto_venta?: string | null;
  numero_comprobante?: string | null;
  fecha_comprobante?: string | null;
  moneda?: string;
  neto: number;
  iva_alicuota?: number;
  iva_monto?: number;
  percepciones?: number;
  total: number;
  empresa?: string | null;
  concepto?: string | null;
  observaciones?: string | null;
  estado?: string;
  estado_pago?: string;
  forma_pago?: string | null;
  fecha_pago?: string | null;
  factura_emitida_a?: string | null;
  acuerdo_pago?: string | null;
  created_by?: string | null;
  // Context columns
  area_origen: string;
  contexto_comprobante_id?: string | null;
  orden_publicidad_id?: string | null;
  item_orden_publicidad_id?: string | null;
  sector?: string | null;
  rubro_contexto?: string | null;
  sub_rubro_contexto?: string | null;
  condicion_pago?: string | null;
  adjuntos?: unknown | null;
  nombre_campana?: string | null;
  unidad_negocio?: string | null;
  categoria_negocio?: string | null;
  categoria?: string | null;
  cliente?: string | null;
  monto_prog?: number | null;
  valor_imponible?: number | null;
  bonificacion?: number | null;
  empresa_programa?: string | null;
  pais?: string | null;
}

function mapErr(error: { code?: string; message: string; details?: string }): RepositoryError {
  return { code: error.code || 'UNKNOWN', message: error.message, details: error.details };
}

// ============================================
// Queries (from view, filtered by area_origen)
// ============================================

export async function findByArea(area: string): Promise<RepositoryListResult<GastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW).select('*')
    .eq('area_origen', area)
    .eq('tipo_movimiento', 'egreso')
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: mapErr(error) };
  return { data: data as GastoFullRow[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<GastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW).select('*').eq('id', id).single();
  if (error) return { data: null, error: mapErr(error) };
  return { data: data as GastoFullRow, error: null };
}

export async function findByOrdenId(ordenId: string, area?: string): Promise<RepositoryListResult<GastoFullRow>> {
  let query = supabase
    .from(VIEW).select('*')
    .eq('orden_publicidad_id', ordenId)
    .eq('tipo_movimiento', 'egreso')
    .order('created_at', { ascending: false });
  if (area) query = query.eq('area_origen', area);
  const { data, error } = await query;
  if (error) return { data: [], error: mapErr(error) };
  return { data: data as GastoFullRow[], error: null };
}

export async function findByItemOrdenId(itemId: string, area?: string): Promise<RepositoryListResult<GastoFullRow>> {
  let query = supabase
    .from(VIEW).select('*')
    .eq('item_orden_publicidad_id', itemId)
    .eq('tipo_movimiento', 'egreso')
    .order('created_at', { ascending: false });
  if (area) query = query.eq('area_origen', area);
  const { data, error } = await query;
  if (error) return { data: [], error: mapErr(error) };
  return { data: data as GastoFullRow[], error: null };
}

export async function findByContextoId(contextoId: string): Promise<RepositoryListResult<GastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW).select('*')
    .eq('contexto_comprobante_id', contextoId)
    .eq('tipo_movimiento', 'egreso')
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: mapErr(error) };
  return { data: data as GastoFullRow[], error: null };
}

// ============================================
// Mutations (single table — comprobantes)
// ============================================

export async function create(row: GastoInsertRow): Promise<RepositoryResult<GastoFullRow>> {
  const { data, error } = await supabase
    .from(TABLE).insert(row).select().single();
  if (error) return { data: null, error: mapErr(error) };
  // Re-fetch from view to get joined fields
  return findById((data as { id: string }).id);
}

export async function createMultiple(rows: GastoInsertRow[]): Promise<RepositoryListResult<GastoFullRow>> {
  const results: GastoFullRow[] = [];
  const errors: RepositoryError[] = [];
  for (const row of rows) {
    const result = await create(row);
    if (result.error) errors.push(result.error);
    else if (result.data) results.push(result.data);
  }
  if (errors.length > 0) return { data: results, error: errors[0] };
  return { data: results, error: null };
}

export async function update(id: string, fields: Record<string, unknown>): Promise<RepositoryResult<GastoFullRow>> {
  const { error } = await supabase
    .from(TABLE).update(fields).eq('id', id);
  if (error) return { data: null, error: mapErr(error) };
  return findById(id);
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return { data: null, error: mapErr(error) };
  return { data: null, error: null };
}
