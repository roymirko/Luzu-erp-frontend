import { supabase } from '../services/supabase';
import type {
  GastoInsert,
  GastoUpdate,
  ComprobanteInsert,
  ComprobanteUpdate,
  ExperienceFormularioInsert,
  ExperienceFormularioUpdate,
  ExperienceGastoInsert,
  ExperienceGastoUpdate,
  ExperienceComprobanteInsert,
  ExperienceGastoFullRow,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

// Use actual tables, not views
const COMPROBANTES_TABLE = 'comprobantes';
const CONTEXT_TABLE = 'experience_comprobantes';
const VIEW_NAME = 'experience_gastos_full'; // Legacy view for reading

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

/**
 * Maps old GastoInsert to new ComprobanteInsert
 */
function mapGastoToComprobante(gasto: GastoInsert): ComprobanteInsert {
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
  };
}

/**
 * Maps old GastoUpdate to new ComprobanteUpdate
 */
function mapGastoUpdateToComprobante(update: GastoUpdate): ComprobanteUpdate {
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
  return result;
}

/**
 * Maps old ExperienceGastoInsert context to new ExperienceComprobanteInsert
 */
function mapContextInsert(context: Omit<ExperienceGastoInsert, 'gasto_id' | 'formulario_id'>, comprobanteId: string, formularioId: string): ExperienceComprobanteInsert {
  return {
    comprobante_id: comprobanteId,
    formulario_id: formularioId,
    factura_emitida_a: context.factura_emitida_a || null,
    empresa: context.empresa || null,
    empresa_programa: context.empresa_programa || null,
    fecha_comprobante: context.fecha_comprobante || null,
    acuerdo_pago: context.acuerdo_pago || null,
    forma_pago: context.forma_pago || null,
    pais: context.pais || 'argentina',
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
 * Crea un gasto de Experience completo (transacción: comprobantes + formulario + contexto)
 */
export async function create(input: {
  gasto: GastoInsert;
  formulario: ExperienceFormularioInsert;
  context: Omit<ExperienceGastoInsert, 'gasto_id' | 'formulario_id'>;
}): Promise<RepositoryResult<ExperienceGastoFullRow>> {
  // 1. Map and insert into comprobantes (core)
  const comprobanteData = mapGastoToComprobante(input.gasto);
  const { data: comprobante, error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .insert(comprobanteData)
    .select()
    .single();

  if (comprobanteError || !comprobante) {
    return { data: null, error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
  }

  // 2. Crear formulario (header)
  const { data: formularioData, error: formularioError } = await supabase
    .from('experience_formularios')
    .insert(input.formulario)
    .select()
    .single();

  if (formularioError || !formularioData) {
    // Rollback: eliminar comprobante creado
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    return { data: null, error: mapSupabaseError(formularioError || { message: 'Error al crear formulario' }) };
  }

  // 3. Insert into experience_comprobantes (context)
  const contextInsert = mapContextInsert(input.context, comprobante.id, formularioData.id);
  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    // Rollback: eliminar comprobante y formulario
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    await supabase.from('experience_formularios').delete().eq('id', formularioData.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  // 4. Obtener registro completo desde la vista
  return findById(comprobante.id);
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

  const createdComprobanteIds: string[] = [];

  // 2. Create each comprobante + context
  for (let i = 0; i < input.gastos.length; i++) {
    const item = input.gastos[i];
    console.log(`[Experience:createWithMultipleGastos] Creating gasto ${i + 1}/${input.gastos.length}:`, item.gasto.neto);

    // Map and insert into comprobantes
    const comprobanteData = mapGastoToComprobante(item.gasto);
    const { data: comprobante, error: comprobanteError } = await supabase
      .from(COMPROBANTES_TABLE)
      .insert(comprobanteData)
      .select()
      .single();

    if (comprobanteError || !comprobante) {
      console.error(`[Experience:createWithMultipleGastos] Error creating comprobante ${i + 1}:`, comprobanteError);
      // Rollback: delete all created comprobantes and the formulario
      for (const comprobanteId of createdComprobanteIds) {
        await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobanteId);
      }
      await supabase.from('experience_formularios').delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
    }

    console.log(`[Experience:createWithMultipleGastos] Comprobante ${i + 1} created with id:`, comprobante.id);
    createdComprobanteIds.push(comprobante.id);

    // Create context linking comprobante to formulario
    const contextInsert = mapContextInsert(item.context, comprobante.id, formularioData.id);
    const { error: contextError } = await supabase
      .from(CONTEXT_TABLE)
      .insert(contextInsert);

    if (contextError) {
      console.error(`[Experience:createWithMultipleGastos] Error creating context for comprobante ${i + 1}:`, contextError);
      // Rollback
      for (const comprobanteId of createdComprobanteIds) {
        await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobanteId);
      }
      await supabase.from('experience_formularios').delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(contextError) };
    }
    console.log(`[Experience:createWithMultipleGastos] Context for comprobante ${i + 1} created`);
  }

  // 3. Fetch all created records from the view
  console.log(`[Experience:createWithMultipleGastos] Fetching ${createdComprobanteIds.length} created comprobantes from view`);
  const results: ExperienceGastoFullRow[] = [];
  for (const comprobanteId of createdComprobanteIds) {
    const result = await findById(comprobanteId);
    if (result.error) {
      console.error(`[Experience:createWithMultipleGastos] Error fetching comprobante ${comprobanteId} from view:`, result.error);
      // Return the error instead of silently ignoring it
      return { data: results, error: result.error };
    }
    if (result.data) {
      results.push(result.data);
    }
  }

  console.log(`[Experience:createWithMultipleGastos] Returning ${results.length} comprobantes`);
  return { data: results, error: null };
}

/**
 * Agrega un gasto a un formulario existente
 */
export async function addGastoToFormulario(
  formularioId: string,
  input: {
    gasto: GastoInsert;
    context: Omit<ExperienceGastoInsert, 'gasto_id' | 'formulario_id'>;
  }
): Promise<RepositoryResult<ExperienceGastoFullRow>> {
  // 1. Map and insert into comprobantes
  const comprobanteData = mapGastoToComprobante(input.gasto);
  const { data: comprobante, error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .insert(comprobanteData)
    .select()
    .single();

  if (comprobanteError || !comprobante) {
    return { data: null, error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
  }

  // 2. Create context linking comprobante to existing formulario
  const contextInsert = mapContextInsert(input.context, comprobante.id, formularioId);
  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    // Rollback: delete comprobante
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  // 3. Return complete record
  return findById(comprobante.id);
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

  // 1. Actualizar comprobante base si hay cambios
  if (input.gasto && Object.keys(input.gasto).length > 0) {
    const comprobanteUpdate = mapGastoUpdateToComprobante(input.gasto);
    const { error: comprobanteError } = await supabase
      .from(COMPROBANTES_TABLE)
      .update({ ...comprobanteUpdate, updated_at: new Date().toISOString() })
      .eq('id', gastoId);

    if (comprobanteError) {
      return { data: null, error: mapSupabaseError(comprobanteError) };
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
      .from(CONTEXT_TABLE)
      .update(input.context)
      .eq('comprobante_id', gastoId);

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

  // Eliminar comprobante (cascadea a experience_comprobantes por ON DELETE CASCADE)
  const { error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .delete()
    .eq('id', gastoId);

  if (comprobanteError) {
    return { data: null, error: mapSupabaseError(comprobanteError) };
  }

  // Verificar si hay otros comprobantes en el formulario
  const { data: remainingComprobantes } = await supabase
    .from(CONTEXT_TABLE)
    .select('id')
    .eq('formulario_id', formularioId);

  // Si no quedan comprobantes, eliminar el formulario
  if (!remainingComprobantes || remainingComprobantes.length === 0) {
    const { error: formularioError } = await supabase
      .from('experience_formularios')
      .delete()
      .eq('id', formularioId);

    if (formularioError) {
      // Log pero no fallar - el comprobante principal ya fue eliminado
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
