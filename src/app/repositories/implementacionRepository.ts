import { supabase } from '../services/supabase';
import type {
  GastoRow,
  GastoInsert,
  GastoUpdate,
  ImplementacionGastoRow,
  ImplementacionGastoInsert,
  ImplementacionGastoUpdate,
  ImplementacionGastoFullRow,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const GASTOS_TABLE = 'gastos';
const CONTEXT_TABLE = 'implementacion_gastos';
const VIEW_NAME = 'implementacion_gastos_full';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
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
 * Inserta en gastos (core) y luego en implementacion_gastos (contexto)
 */
export async function create(
  gasto: GastoInsert,
  context: Omit<ImplementacionGastoInsert, 'gasto_id'>
): Promise<RepositoryResult<ImplementacionGastoFullRow>> {
  // 1. Insert into gastos (core)
  const { data: gastoData, error: gastoError } = await supabase
    .from(GASTOS_TABLE)
    .insert(gasto)
    .select()
    .single();

  if (gastoError || !gastoData) {
    return { data: null, error: mapSupabaseError(gastoError || { message: 'Error al crear gasto' }) };
  }

  // 2. Insert into implementacion_gastos (context)
  const contextInsert: ImplementacionGastoInsert = {
    ...context,
    gasto_id: gastoData.id,
  };

  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    // Rollback: delete the gasto we just created
    await supabase.from(GASTOS_TABLE).delete().eq('id', gastoData.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  // 3. Return full record from view
  return findById(gastoData.id);
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
  // 1. Update gastos (core) if provided
  if (gastoUpdate && Object.keys(gastoUpdate).length > 0) {
    const { error: gastoError } = await supabase
      .from(GASTOS_TABLE)
      .update({ ...gastoUpdate, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (gastoError) {
      return { data: null, error: mapSupabaseError(gastoError) };
    }
  }

  // 2. Update implementacion_gastos (context) if provided
  if (contextUpdate && Object.keys(contextUpdate).length > 0) {
    const { error: contextError } = await supabase
      .from(CONTEXT_TABLE)
      .update(contextUpdate)
      .eq('gasto_id', id);

    if (contextError) {
      return { data: null, error: mapSupabaseError(contextError) };
    }
  }

  // 3. Return updated record from view
  return findById(id);
}

/**
 * Elimina un gasto de implementación
 * El CASCADE en implementacion_gastos eliminará automáticamente el contexto
 */
export async function remove(id: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase
    .from(GASTOS_TABLE)
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
