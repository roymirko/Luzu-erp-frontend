import { supabase } from '../services/supabase';
import type {
  ProveedorRow,
  ProveedorInsert,
  ProveedorUpdate,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const TABLE_NAME = 'proveedores';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

export async function findAll(): Promise<RepositoryListResult<ProveedorRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('razon_social');

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProveedorRow[], error: null };
}

export async function findActive(): Promise<RepositoryListResult<ProveedorRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('activo', true)
    .order('razon_social');

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProveedorRow[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<ProveedorRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ProveedorRow, error: null };
}

export async function findByCuit(cuit: string): Promise<RepositoryResult<ProveedorRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('cuit', cuit)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ProveedorRow, error: null };
}

export async function create(proveedor: ProveedorInsert): Promise<RepositoryResult<ProveedorRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(proveedor)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ProveedorRow, error: null };
}

export async function update(id: string, proveedor: ProveedorUpdate): Promise<RepositoryResult<ProveedorRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(proveedor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ProveedorRow, error: null };
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

export async function search(term: string): Promise<RepositoryListResult<ProveedorRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('activo', true)
    .or(`empresa.ilike.%${term}%,razon_social.ilike.%${term}%`)
    .order('razon_social')
    .limit(20);

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProveedorRow[], error: null };
}
