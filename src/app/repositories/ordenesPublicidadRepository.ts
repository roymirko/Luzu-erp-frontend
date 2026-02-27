import { supabase } from '../services/supabase';
import type {
  OrdenPublicidadRow,
  OrdenPublicidadWithItems,
  ItemOrdenPublicidadRow,
  OrdenPublicidadInsert,
  OrdenPublicidadUpdate,
  ItemOrdenPublicidadInsert,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const TABLE_NAME = 'ordenes_publicidad';
const ITEMS_TABLE_NAME = 'items_orden_publicidad';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

export async function findAll(): Promise<RepositoryListResult<OrdenPublicidadWithItems>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`*, ${ITEMS_TABLE_NAME}(*)`)
    .order('fecha_creacion', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as OrdenPublicidadWithItems[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<OrdenPublicidadWithItems>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`*, ${ITEMS_TABLE_NAME}(*)`)
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as OrdenPublicidadWithItems, error: null };
}

export async function findByOrdenPublicidad(ordenPublicidad: string): Promise<RepositoryResult<OrdenPublicidadWithItems>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`*, ${ITEMS_TABLE_NAME}(*)`)
    .eq('orden_publicidad', ordenPublicidad)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as OrdenPublicidadWithItems, error: null };
}

export async function create(orden: OrdenPublicidadInsert): Promise<RepositoryResult<OrdenPublicidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(orden)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as OrdenPublicidadRow, error: null };
}

export async function update(id: string, orden: OrdenPublicidadUpdate): Promise<RepositoryResult<OrdenPublicidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ ...orden, fecha_actualizacion: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as OrdenPublicidadRow, error: null };
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

export async function createItems(items: ItemOrdenPublicidadInsert[]): Promise<RepositoryListResult<ItemOrdenPublicidadRow>> {
  if (items.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from(ITEMS_TABLE_NAME)
    .insert(items)
    .select();

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ItemOrdenPublicidadRow[], error: null };
}

export async function deleteItemsByOrdenId(ordenId: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase
    .from(ITEMS_TABLE_NAME)
    .delete()
    .eq('orden_publicidad_id', ordenId);

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: null, error: null };
}

export async function getItemsByOrdenId(ordenId: string): Promise<RepositoryListResult<ItemOrdenPublicidadRow>> {
  const { data, error } = await supabase
    .from(ITEMS_TABLE_NAME)
    .select('*')
    .eq('orden_publicidad_id', ordenId);

  return { data: (data || []) as ItemOrdenPublicidadRow[], error: error ? mapSupabaseError(error) : null };
}

export async function updateItem(id: string, data: Partial<ItemOrdenPublicidadRow>): Promise<RepositoryResult<null>> {
  const { error } = await supabase
    .from(ITEMS_TABLE_NAME)
    .update(data)
    .eq('id', id);

  return { data: null, error: error ? mapSupabaseError(error) : null };
}

export async function deleteItemById(id: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase
    .from(ITEMS_TABLE_NAME)
    .delete()
    .eq('id', id);

  return { data: null, error: error ? mapSupabaseError(error) : null };
}

export async function updateEstadoOp(id: string, estadoOp: string): Promise<RepositoryResult<OrdenPublicidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ estado_op: estadoOp, fecha_actualizacion: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as OrdenPublicidadRow, error: null };
}

export async function findItemById(itemId: string): Promise<RepositoryResult<ItemOrdenPublicidadRow>> {
  const { data, error } = await supabase
    .from(ITEMS_TABLE_NAME)
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ItemOrdenPublicidadRow, error: null };
}
