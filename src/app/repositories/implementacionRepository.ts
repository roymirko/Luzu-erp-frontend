import { supabase } from '../services/supabase';
import type {
  GastoImplementacionRow,
  GastoImplementacionFullRow,
  GastoImplementacionWithItems,
  ItemGastoImplementacionRow,
  GastoImplementacionInsert,
  GastoImplementacionUpdate,
  ItemGastoImplementacionInsert,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const TABLE_NAME = 'gastos_implementacion';
const VIEW_NAME = 'gastos_implementacion_full';
const ITEMS_TABLE_NAME = 'items_gasto_implementacion';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

export async function findAll(): Promise<RepositoryListResult<GastoImplementacionWithItems>> {
  const { data: gastos, error: gastosError } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (gastosError) {
    return { data: [], error: mapSupabaseError(gastosError) };
  }

  const gastoIds = gastos.map(g => g.id);
  if (gastoIds.length === 0) {
    return { data: [], error: null };
  }

  const { data: items, error: itemsError } = await supabase
    .from(ITEMS_TABLE_NAME)
    .select('*')
    .in('gasto_id', gastoIds);

  if (itemsError) {
    return { data: [], error: mapSupabaseError(itemsError) };
  }

  const itemsByGastoId = new Map<string, ItemGastoImplementacionRow[]>();
  for (const item of items) {
    const existing = itemsByGastoId.get(item.gasto_id) || [];
    existing.push(item as ItemGastoImplementacionRow);
    itemsByGastoId.set(item.gasto_id, existing);
  }

  const result: GastoImplementacionWithItems[] = gastos.map(g => ({
    ...g as GastoImplementacionFullRow,
    items_gasto_implementacion: itemsByGastoId.get(g.id) || [],
  }));

  return { data: result, error: null };
}

export async function findById(id: string): Promise<RepositoryResult<GastoImplementacionWithItems>> {
  const { data: gasto, error: gastoError } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (gastoError) {
    return { data: null, error: mapSupabaseError(gastoError) };
  }

  const { data: items, error: itemsError } = await supabase
    .from(ITEMS_TABLE_NAME)
    .select('*')
    .eq('gasto_id', id);

  if (itemsError) {
    return { data: null, error: mapSupabaseError(itemsError) };
  }

  return {
    data: {
      ...gasto as GastoImplementacionFullRow,
      items_gasto_implementacion: items as ItemGastoImplementacionRow[],
    },
    error: null,
  };
}

export async function findByFormItemId(
  formId: string,
  itemId: string
): Promise<RepositoryResult<GastoImplementacionWithItems>> {
  const { data: gasto, error: gastoError } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('id_formulario_comercial', formId)
    .eq('item_orden_publicidad_id', itemId)
    .single();

  if (gastoError) {
    if (gastoError.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: mapSupabaseError(gastoError) };
  }

  const { data: items, error: itemsError } = await supabase
    .from(ITEMS_TABLE_NAME)
    .select('*')
    .eq('gasto_id', gasto.id);

  if (itemsError) {
    return { data: null, error: mapSupabaseError(itemsError) };
  }

  return {
    data: {
      ...gasto as GastoImplementacionFullRow,
      items_gasto_implementacion: items as ItemGastoImplementacionRow[],
    },
    error: null,
  };
}

export async function create(gasto: GastoImplementacionInsert): Promise<RepositoryResult<GastoImplementacionRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(gasto)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as GastoImplementacionRow, error: null };
}

export async function update(id: string, gasto: GastoImplementacionUpdate): Promise<RepositoryResult<GastoImplementacionRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ ...gasto, fecha_actualizacion: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as GastoImplementacionRow, error: null };
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

export async function createItems(items: ItemGastoImplementacionInsert[]): Promise<RepositoryListResult<ItemGastoImplementacionRow>> {
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

  return { data: data as ItemGastoImplementacionRow[], error: null };
}

export async function deleteItemsByGastoId(gastoId: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase
    .from(ITEMS_TABLE_NAME)
    .delete()
    .eq('gasto_id', gastoId);

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: null, error: null };
}
