import { supabase } from '../services/supabase';
import type {
  EntidadRow,
  EntidadInsert,
  EntidadUpdate,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const TABLE_NAME = 'entidades';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

export async function findAll(): Promise<RepositoryListResult<EntidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('razon_social');

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow[], error: null };
}

export async function findActive(): Promise<RepositoryListResult<EntidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('activo', true)
    .order('razon_social');

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow[], error: null };
}

export async function findProveedores(): Promise<RepositoryListResult<EntidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('activo', true)
    .in('tipo_entidad', ['proveedor', 'ambos'])
    .order('razon_social');

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow[], error: null };
}

export async function findClientes(): Promise<RepositoryListResult<EntidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('activo', true)
    .in('tipo_entidad', ['cliente', 'ambos'])
    .order('razon_social');

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<EntidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow, error: null };
}

export async function findByCuit(cuit: string): Promise<RepositoryResult<EntidadRow>> {
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

  return { data: data as EntidadRow, error: null };
}

export async function create(entidad: EntidadInsert): Promise<RepositoryResult<EntidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(entidad)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow, error: null };
}

export async function update(id: string, entidad: EntidadUpdate): Promise<RepositoryResult<EntidadRow>> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(entidad)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow, error: null };
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

export async function search(term: string, tipoEntidad?: 'proveedor' | 'cliente'): Promise<RepositoryListResult<EntidadRow>> {
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('activo', true)
    .or(`empresa.ilike.%${term}%,razon_social.ilike.%${term}%,nombre_fantasia.ilike.%${term}%`)
    .order('razon_social')
    .limit(20);

  if (tipoEntidad === 'proveedor') {
    query = query.in('tipo_entidad', ['proveedor', 'ambos']);
  } else if (tipoEntidad === 'cliente') {
    query = query.in('tipo_entidad', ['cliente', 'ambos']);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as EntidadRow[], error: null };
}
