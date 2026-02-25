import { supabase } from '../services/supabase';
import type {
  ComprobanteRow,
  ComprobanteFullRow,
  ComprobanteInsert,
  ComprobanteUpdate,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const TABLE_NAME = 'comprobantes';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

export async function findAll(): Promise<RepositoryListResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow[], error: null };
}

export async function findEgresos(): Promise<RepositoryListResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('tipo_movimiento', 'egreso')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow[], error: null };
}

export async function findIngresos(): Promise<RepositoryListResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('tipo_movimiento', 'ingreso')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow, error: null };
}

export async function findByEntidad(entidadId: string): Promise<RepositoryListResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('entidad_id', entidadId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow[], error: null };
}

export async function create(comprobante: ComprobanteInsert): Promise<RepositoryResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(comprobante)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow, error: null };
}

export async function update(id: string, comprobante: ComprobanteUpdate): Promise<RepositoryResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(comprobante)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: null, error: null };
}

export async function findByEstadoPago(estadoPago: 'creado' | 'aprobado' | 'requiere_info' | 'rechazado' | 'pagado'): Promise<RepositoryListResult<ComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('estado_pago', estadoPago)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow[], error: null };
}

export async function search(term: string, tipoMovimiento?: 'ingreso' | 'egreso'): Promise<RepositoryListResult<ComprobanteRow>> {
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .or(`entidad_nombre.ilike.%${term}%,concepto.ilike.%${term}%,numero_comprobante.ilike.%${term}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (tipoMovimiento) {
    query = query.eq('tipo_movimiento', tipoMovimiento);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteRow[], error: null };
}

const VIEW_NAME = 'comprobantes_full';

export async function findAllWithContext(): Promise<RepositoryListResult<ComprobanteFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteFullRow[], error: null };
}

export async function findWithContextByTipo(tipoMovimiento: 'ingreso' | 'egreso'): Promise<RepositoryListResult<ComprobanteFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('tipo_movimiento', tipoMovimiento)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteFullRow[], error: null };
}

export async function searchWithContext(term: string, tipoMovimiento?: 'ingreso' | 'egreso'): Promise<RepositoryListResult<ComprobanteFullRow>> {
  let query = supabase
    .from(VIEW_NAME)
    .select('*')
    .or(`entidad_nombre.ilike.%${term}%,concepto.ilike.%${term}%,numero_comprobante.ilike.%${term}%,nombre_campana.ilike.%${term}%,ctx_programa.ilike.%${term}%,op_nombre_campana.ilike.%${term}%`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (tipoMovimiento) {
    query = query.eq('tipo_movimiento', tipoMovimiento);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ComprobanteFullRow[], error: null };
}
