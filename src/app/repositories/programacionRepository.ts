import { supabase } from '../services/supabase';
import type {
  GastoInsert,
  GastoUpdate,
  ComprobanteInsert,
  ComprobanteUpdate,
  ProgramacionFormularioInsert,
  ProgramacionFormularioUpdate,
  ProgramacionGastoInsert,
  ProgramacionGastoUpdate,
  ProgramacionComprobanteInsert,
  ProgramacionGastoFullRow,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

// Use actual tables, not views
const COMPROBANTES_TABLE = 'comprobantes';
const CONTEXT_TABLE = 'programacion_comprobantes';
const VIEW_NAME = 'programacion_gastos_full'; // Legacy view for reading

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
    estado_pago: (gasto.estado_pago === 'pendiente-pago' ? 'pendiente' : gasto.estado_pago) as 'pendiente' | 'pagado' | 'anulado',
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
    result.estado_pago = (update.estado_pago === 'pendiente-pago' ? 'pendiente' : update.estado_pago) as 'pendiente' | 'pagado' | 'anulado';
  }
  return result;
}

/**
 * Maps old ProgramacionGastoInsert context to new ProgramacionComprobanteInsert
 */
function mapContextInsert(context: Omit<ProgramacionGastoInsert, 'gasto_id' | 'formulario_id'>, comprobanteId: string, formularioId: string): ProgramacionComprobanteInsert {
  return {
    comprobante_id: comprobanteId,
    formulario_id: formularioId,
    categoria: context.categoria || null,
    acuerdo_pago: context.acuerdo_pago || null,
    cliente: context.cliente || null,
    monto: context.monto || null,
    valor_imponible: context.valor_imponible || null,
    bonificacion: context.bonificacion || 0,
    factura_emitida_a: context.factura_emitida_a || null,
    forma_pago: context.forma_pago || null,
  };
}

/**
 * Obtiene todos los gastos de programación usando la vista unificada
 */
export async function findAll(): Promise<RepositoryListResult<ProgramacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProgramacionGastoFullRow[], error: null };
}

/**
 * Obtiene un gasto de programación por ID (ID del gasto base)
 */
export async function findById(id: string): Promise<RepositoryResult<ProgramacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ProgramacionGastoFullRow, error: null };
}

/**
 * Crea un gasto de programación completo (transacción: comprobantes + formulario + contexto)
 */
export async function create(input: {
  gasto: GastoInsert;
  formulario: ProgramacionFormularioInsert;
  context: Omit<ProgramacionGastoInsert, 'gasto_id' | 'formulario_id'>;
}): Promise<RepositoryResult<ProgramacionGastoFullRow>> {
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
    .from('programacion_formularios')
    .insert(input.formulario)
    .select()
    .single();

  if (formularioError || !formularioData) {
    // Rollback: eliminar comprobante creado
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    return { data: null, error: mapSupabaseError(formularioError || { message: 'Error al crear formulario' }) };
  }

  // 3. Insert into programacion_comprobantes (context)
  const contextInsert = mapContextInsert(input.context, comprobante.id, formularioData.id);
  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    // Rollback: eliminar comprobante y formulario
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    await supabase.from('programacion_formularios').delete().eq('id', formularioData.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  // 4. Obtener registro completo desde la vista
  return findById(comprobante.id);
}

/**
 * Crea múltiples gastos de programación bajo un mismo formulario
 */
export async function createWithMultipleGastos(input: {
  formulario: ProgramacionFormularioInsert;
  gastos: Array<{
    gasto: GastoInsert;
    context: Omit<ProgramacionGastoInsert, 'gasto_id' | 'formulario_id'>;
  }>;
}): Promise<RepositoryListResult<ProgramacionGastoFullRow>> {
  console.log('[createWithMultipleGastos] Input gastos count:', input.gastos.length);

  if (input.gastos.length === 0) {
    return { data: [], error: { code: 'INVALID_INPUT', message: 'Debe proporcionar al menos un gasto' } };
  }

  // 1. Crear formulario (header) - one per group
  const { data: formularioData, error: formularioError } = await supabase
    .from('programacion_formularios')
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
    console.log(`[createWithMultipleGastos] Creating gasto ${i + 1}/${input.gastos.length}:`, item.gasto.neto);

    // Map and insert into comprobantes
    const comprobanteData = mapGastoToComprobante(item.gasto);
    const { data: comprobante, error: comprobanteError } = await supabase
      .from(COMPROBANTES_TABLE)
      .insert(comprobanteData)
      .select()
      .single();

    if (comprobanteError || !comprobante) {
      console.error(`[createWithMultipleGastos] Error creating comprobante ${i + 1}:`, comprobanteError);
      // Rollback: delete all created comprobantes and the formulario
      for (const comprobanteId of createdComprobanteIds) {
        await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobanteId);
      }
      await supabase.from('programacion_formularios').delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
    }

    console.log(`[createWithMultipleGastos] Comprobante ${i + 1} created with id:`, comprobante.id);
    createdComprobanteIds.push(comprobante.id);

    // Create context linking comprobante to formulario
    const contextInsert = mapContextInsert(item.context, comprobante.id, formularioData.id);
    const { error: contextError } = await supabase
      .from(CONTEXT_TABLE)
      .insert(contextInsert);

    if (contextError) {
      console.error(`[createWithMultipleGastos] Error creating context for comprobante ${i + 1}:`, contextError);
      // Rollback
      for (const comprobanteId of createdComprobanteIds) {
        await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobanteId);
      }
      await supabase.from('programacion_formularios').delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(contextError) };
    }
    console.log(`[createWithMultipleGastos] Context for comprobante ${i + 1} created`);
  }

  // 3. Fetch all created records from the view
  console.log(`[createWithMultipleGastos] Fetching ${createdComprobanteIds.length} created comprobantes from view`);
  const results: ProgramacionGastoFullRow[] = [];
  for (const comprobanteId of createdComprobanteIds) {
    const result = await findById(comprobanteId);
    if (result.error) {
      console.error(`[createWithMultipleGastos] Error fetching comprobante ${comprobanteId} from view:`, result.error);
      // Return the error instead of silently ignoring it
      return { data: results, error: result.error };
    }
    if (result.data) {
      results.push(result.data);
    }
  }

  console.log(`[createWithMultipleGastos] Returning ${results.length} comprobantes`);
  return { data: results, error: null };
}

/**
 * Agrega un gasto a un formulario existente
 */
export async function addGastoToFormulario(
  formularioId: string,
  input: {
    gasto: GastoInsert;
    context: Omit<ProgramacionGastoInsert, 'gasto_id' | 'formulario_id'>;
  }
): Promise<RepositoryResult<ProgramacionGastoFullRow>> {
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
 * Actualiza un gasto de programación (actualiza las 3 tablas según corresponda)
 */
export async function update(
  gastoId: string,
  input: {
    gasto?: GastoUpdate;
    formulario?: ProgramacionFormularioUpdate;
    context?: ProgramacionGastoUpdate;
  }
): Promise<RepositoryResult<ProgramacionGastoFullRow>> {
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
      .from('programacion_formularios')
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
 * Elimina un gasto de programación (cascadea automáticamente)
 */
export async function remove(gastoId: string): Promise<RepositoryResult<null>> {
  // Obtener el formulario_id antes de eliminar
  const current = await findById(gastoId);
  if (current.error || !current.data) {
    return { data: null, error: current.error || { code: 'NOT_FOUND', message: 'Gasto no encontrado' } };
  }

  const formularioId = current.data.formulario_id;

  // Eliminar comprobante (cascadea a programacion_comprobantes por ON DELETE CASCADE)
  const { error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .delete()
    .eq('id', gastoId);

  if (comprobanteError) {
    return { data: null, error: mapSupabaseError(comprobanteError) };
  }

  // Eliminar formulario huérfano
  const { error: formularioError } = await supabase
    .from('programacion_formularios')
    .delete()
    .eq('id', formularioId);

  if (formularioError) {
    // Log pero no fallar - el comprobante principal ya fue eliminado
    console.warn('Error eliminando formulario huérfano:', formularioError);
  }

  return { data: null, error: null };
}

/**
 * Busca gastos por mes de gestión
 */
export async function findByMesGestion(mesGestion: string): Promise<RepositoryListResult<ProgramacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('mes_gestion', mesGestion)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProgramacionGastoFullRow[], error: null };
}

/**
 * Busca gastos por programa
 */
export async function findByPrograma(programa: string): Promise<RepositoryListResult<ProgramacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('programa', programa)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProgramacionGastoFullRow[], error: null };
}

/**
 * Busca gastos por estado
 */
export async function findByEstado(estado: string): Promise<RepositoryListResult<ProgramacionGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('estado', estado)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProgramacionGastoFullRow[], error: null };
}
