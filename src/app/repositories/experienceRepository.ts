import { supabase } from '../services/supabase';
import type {
  GastoInsert,
  GastoUpdate,
  ExperienceFormularioInsert,
  ExperienceFormularioUpdate,
  ExperienceGastoInsert,
  ExperienceGastoUpdate,
  ExperienceGastoFullRow,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const VIEW_NAME = 'experience_gastos_full';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

/**
 * Obtiene todos los gastos de Experience usando la vista unificada
 */
export async function findAll(): Promise<RepositoryListResult<ExperienceGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ExperienceGastoFullRow[], error: null };
}

/**
 * Obtiene un gasto de Experience por ID (ID del gasto base)
 */
export async function findById(id: string): Promise<RepositoryResult<ExperienceGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ExperienceGastoFullRow, error: null };
}

/**
 * Crea un gasto de Experience completo (transacción: gastos + formulario + contexto)
 */
export async function create(input: {
  gasto: GastoInsert;
  formulario: ExperienceFormularioInsert;
  context: Omit<ExperienceGastoInsert, 'gasto_id' | 'formulario_id'>;
}): Promise<RepositoryResult<ExperienceGastoFullRow>> {
  // 1. Crear gasto base
  const { data: gastoData, error: gastoError } = await supabase
    .from('gastos')
    .insert(input.gasto)
    .select()
    .single();

  if (gastoError || !gastoData) {
    return { data: null, error: mapSupabaseError(gastoError || { message: 'Error al crear gasto' }) };
  }

  // 2. Crear formulario (header)
  const { data: formularioData, error: formularioError } = await supabase
    .from('experience_formularios')
    .insert(input.formulario)
    .select()
    .single();

  if (formularioError || !formularioData) {
    // Rollback: eliminar gasto creado
    await supabase.from('gastos').delete().eq('id', gastoData.id);
    return { data: null, error: mapSupabaseError(formularioError || { message: 'Error al crear formulario' }) };
  }

  // 3. Crear contexto (relación)
  const { error: contextError } = await supabase
    .from('experience_gastos')
    .insert({
      gasto_id: gastoData.id,
      formulario_id: formularioData.id,
      ...input.context,
    });

  if (contextError) {
    // Rollback: eliminar gasto y formulario
    await supabase.from('gastos').delete().eq('id', gastoData.id);
    await supabase.from('experience_formularios').delete().eq('id', formularioData.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  // 4. Obtener registro completo desde la vista
  return findById(gastoData.id);
}

/**
 * Crea múltiples gastos de Experience bajo un mismo formulario
 */
export async function createWithMultipleGastos(input: {
  formulario: ExperienceFormularioInsert;
  gastos: Array<{
    gasto: GastoInsert;
    context: Omit<ExperienceGastoInsert, 'gasto_id' | 'formulario_id'>;
  }>;
}): Promise<RepositoryListResult<ExperienceGastoFullRow>> {
  console.log('[Experience:createWithMultipleGastos] Input gastos count:', input.gastos.length);

  if (input.gastos.length === 0) {
    return { data: [], error: { code: 'INVALID_INPUT', message: 'Debe proporcionar al menos un gasto' } };
  }

  // 1. Crear formulario (header) - one per group
  const { data: formularioData, error: formularioError } = await supabase
    .from('experience_formularios')
    .insert(input.formulario)
    .select()
    .single();

  if (formularioError || !formularioData) {
    return { data: [], error: mapSupabaseError(formularioError || { message: 'Error al crear formulario' }) };
  }

  const createdGastoIds: string[] = [];

  // 2. Create each gasto + context
  for (let i = 0; i < input.gastos.length; i++) {
    const item = input.gastos[i];
    console.log(`[Experience:createWithMultipleGastos] Creating gasto ${i + 1}/${input.gastos.length}:`, item.gasto.neto);

    // Create gasto base
    const { data: gastoData, error: gastoError } = await supabase
      .from('gastos')
      .insert(item.gasto)
      .select()
      .single();

    if (gastoError || !gastoData) {
      console.error(`[Experience:createWithMultipleGastos] Error creating gasto ${i + 1}:`, gastoError);
      // Rollback: delete all created gastos and the formulario
      for (const gastoId of createdGastoIds) {
        await supabase.from('gastos').delete().eq('id', gastoId);
      }
      await supabase.from('experience_formularios').delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(gastoError || { message: 'Error al crear gasto' }) };
    }

    console.log(`[Experience:createWithMultipleGastos] Gasto ${i + 1} created with id:`, gastoData.id);
    createdGastoIds.push(gastoData.id);

    // Create context linking gasto to formulario
    const { error: contextError } = await supabase
      .from('experience_gastos')
      .insert({
        gasto_id: gastoData.id,
        formulario_id: formularioData.id,
        ...item.context,
      });

    if (contextError) {
      console.error(`[Experience:createWithMultipleGastos] Error creating context for gasto ${i + 1}:`, contextError);
      // Rollback
      for (const gastoId of createdGastoIds) {
        await supabase.from('gastos').delete().eq('id', gastoId);
      }
      await supabase.from('experience_formularios').delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(contextError) };
    }
    console.log(`[Experience:createWithMultipleGastos] Context for gasto ${i + 1} created`);
  }

  // 3. Fetch all created records from the view
  console.log(`[Experience:createWithMultipleGastos] Fetching ${createdGastoIds.length} created gastos from view`);
  const results: ExperienceGastoFullRow[] = [];
  for (const gastoId of createdGastoIds) {
    const result = await findById(gastoId);
    if (result.error) {
      console.error(`[Experience:createWithMultipleGastos] Error fetching gasto ${gastoId} from view:`, result.error);
      // Return the error instead of silently ignoring it
      return { data: results, error: result.error };
    }
    if (result.data) {
      results.push(result.data);
    }
  }

  console.log(`[Experience:createWithMultipleGastos] Returning ${results.length} gastos`);
  return { data: results, error: null };
}

/**
 * Actualiza un gasto de Experience (actualiza las 3 tablas según corresponda)
 */
export async function update(
  gastoId: string,
  input: {
    gasto?: GastoUpdate;
    formulario?: ExperienceFormularioUpdate;
    context?: ExperienceGastoUpdate;
  }
): Promise<RepositoryResult<ExperienceGastoFullRow>> {
  // Obtener el registro actual para conocer los IDs relacionados
  const current = await findById(gastoId);
  if (current.error || !current.data) {
    return { data: null, error: current.error || { code: 'NOT_FOUND', message: 'Gasto no encontrado' } };
  }

  // 1. Actualizar gasto base si hay cambios
  if (input.gasto && Object.keys(input.gasto).length > 0) {
    const { error: gastoError } = await supabase
      .from('gastos')
      .update({ ...input.gasto, updated_at: new Date().toISOString() })
      .eq('id', gastoId);

    if (gastoError) {
      return { data: null, error: mapSupabaseError(gastoError) };
    }
  }

  // 2. Actualizar formulario si hay cambios
  if (input.formulario && Object.keys(input.formulario).length > 0) {
    const { error: formularioError } = await supabase
      .from('experience_formularios')
      .update({ ...input.formulario, updated_at: new Date().toISOString() })
      .eq('id', current.data.formulario_id);

    if (formularioError) {
      return { data: null, error: mapSupabaseError(formularioError) };
    }
  }

  // 3. Actualizar contexto si hay cambios
  if (input.context && Object.keys(input.context).length > 0) {
    const { error: contextError } = await supabase
      .from('experience_gastos')
      .update(input.context)
      .eq('gasto_id', gastoId);

    if (contextError) {
      return { data: null, error: mapSupabaseError(contextError) };
    }
  }

  // 4. Retornar registro actualizado
  return findById(gastoId);
}

/**
 * Elimina un gasto de Experience (cascadea automáticamente)
 */
export async function remove(gastoId: string): Promise<RepositoryResult<null>> {
  // Obtener el formulario_id antes de eliminar
  const current = await findById(gastoId);
  if (current.error || !current.data) {
    return { data: null, error: current.error || { code: 'NOT_FOUND', message: 'Gasto no encontrado' } };
  }

  const formularioId = current.data.formulario_id;

  // Eliminar gasto (cascadea a experience_gastos por ON DELETE CASCADE)
  const { error: gastoError } = await supabase
    .from('gastos')
    .delete()
    .eq('id', gastoId);

  if (gastoError) {
    return { data: null, error: mapSupabaseError(gastoError) };
  }

  // Verificar si hay otros gastos en el formulario
  const { data: remainingGastos } = await supabase
    .from('experience_gastos')
    .select('id')
    .eq('formulario_id', formularioId);

  // Si no quedan gastos, eliminar el formulario
  if (!remainingGastos || remainingGastos.length === 0) {
    const { error: formularioError } = await supabase
      .from('experience_formularios')
      .delete()
      .eq('id', formularioId);

    if (formularioError) {
      // Log pero no fallar - el gasto principal ya fue eliminado
      console.warn('Error eliminando formulario huérfano:', formularioError);
    }
  }

  return { data: null, error: null };
}

/**
 * Busca gastos por nombre de campaña
 */
export async function findByNombreCampana(nombreCampana: string): Promise<RepositoryListResult<ExperienceGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .ilike('nombre_campana', `%${nombreCampana}%`)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ExperienceGastoFullRow[], error: null };
}

/**
 * Busca gastos por estado del formulario
 */
export async function findByFormularioEstado(estado: string): Promise<RepositoryListResult<ExperienceGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('formulario_estado', estado)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ExperienceGastoFullRow[], error: null };
}

/**
 * Busca gastos por formulario ID
 */
export async function findByFormularioId(formularioId: string): Promise<RepositoryListResult<ExperienceGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('formulario_id', formularioId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ExperienceGastoFullRow[], error: null };
}
