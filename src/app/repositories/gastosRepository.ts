import { supabase } from '../services/supabase';
import type {
  GastoRow,
  GastoInsert,
  GastoUpdate,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const TABLE_NAME = 'gastos';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

/**
 * Obtiene todos los gastos ordenados por fecha de creación
 */
export async function findAll(): Promise<RepositoryListResult<GastoRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as GastoRow[], error: null };
}

/**
 * Obtiene un gasto por ID
 */
export async function findById(id: string): Promise<RepositoryResult<GastoRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as GastoRow, error: null };
}

/**
 * Crea un nuevo gasto
 */
export async function create(gasto: GastoInsert): Promise<RepositoryResult<GastoRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(gasto)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as GastoRow, error: null };
}

/**
 * Actualiza un gasto existente
 */
export async function update(id: string, gasto: GastoUpdate): Promise<RepositoryResult<GastoRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ ...gasto, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as GastoRow, error: null };
}

/**
 * Elimina un gasto por ID
 * Nota: La eliminación cascadeará a las tablas de contexto (implementacion_gastos, programacion_gastos)
 */
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

/**
 * Busca gastos por estado
 */
export async function findByEstado(estado: string): Promise<RepositoryListResult<GastoRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('estado', estado)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as GastoRow[], error: null };
}

/**
 * Busca gastos por proveedor
 */
export async function findByProveedor(proveedor: string): Promise<RepositoryListResult<GastoRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .ilike('proveedor', `%${proveedor}%`)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as GastoRow[], error: null };
}
