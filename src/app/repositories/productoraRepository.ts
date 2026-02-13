import { supabase } from '../services/supabase';
import type {
  GastoInsert,
  GastoUpdate,
  ComprobanteInsert,
  ComprobanteUpdate,
  ProductoraFormularioInsert,
  ProductoraFormularioUpdate,
  ProductoraComprobanteInsert,
  ProductoraGastoFullRow,
  RepositoryResult,
  RepositoryListResult,
  RepositoryError,
} from './types';

const COMPROBANTES_TABLE = 'comprobantes';
const CONTEXT_TABLE = 'productora_comprobantes';
const FORMULARIOS_TABLE = 'productora_formularios';
const VIEW_NAME = 'productora_gastos_full';

function mapSupabaseError(error: { code?: string; message: string; details?: string }): RepositoryError {
  return {
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details,
  };
}

function mapGastoToComprobante(gasto: GastoInsert, context?: Partial<{ factura_emitida_a: string | null; acuerdo_pago: string | null; forma_pago: string | null }>): ComprobanteInsert {
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
    factura_emitida_a: context?.factura_emitida_a || null,
    acuerdo_pago: context?.acuerdo_pago || null,
    forma_pago: context?.forma_pago || null,
  };
}

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

function mapContextInsert(context: Omit<ProductoraComprobanteInsert, 'comprobante_id' | 'formulario_id'>, comprobanteId: string, formularioId: string): ProductoraComprobanteInsert {
  return {
    comprobante_id: comprobanteId,
    formulario_id: formularioId,
    empresa: context.empresa || null,
    empresa_programa: context.empresa_programa || null,
    fecha_comprobante: context.fecha_comprobante || null,
    pais: context.pais || 'argentina',
    rubro: context.rubro || null,
    sub_rubro: context.sub_rubro || null,
  };
}

export async function findAll(): Promise<RepositoryListResult<ProductoraGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProductoraGastoFullRow[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<ProductoraGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: mapSupabaseError(error) };
  }

  return { data: data as ProductoraGastoFullRow, error: null };
}

export async function create(input: {
  gasto: GastoInsert;
  formulario: ProductoraFormularioInsert;
  context: Omit<ProductoraComprobanteInsert, 'comprobante_id' | 'formulario_id'>;
}): Promise<RepositoryResult<ProductoraGastoFullRow>> {
  const comprobanteData = mapGastoToComprobante(input.gasto, {
    factura_emitida_a: (input.context as any).factura_emitida_a || null,
    acuerdo_pago: (input.context as any).acuerdo_pago || null,
    forma_pago: (input.context as any).forma_pago || null,
  });
  const { data: comprobante, error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .insert(comprobanteData)
    .select()
    .single();

  if (comprobanteError || !comprobante) {
    return { data: null, error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
  }

  const { data: formularioData, error: formularioError } = await supabase
    .from(FORMULARIOS_TABLE)
    .insert(input.formulario)
    .select()
    .single();

  if (formularioError || !formularioData) {
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    return { data: null, error: mapSupabaseError(formularioError || { message: 'Error al crear formulario' }) };
  }

  const contextInsert = mapContextInsert(input.context, comprobante.id, formularioData.id);
  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    await supabase.from(FORMULARIOS_TABLE).delete().eq('id', formularioData.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  return findById(comprobante.id);
}

export async function createWithMultipleGastos(input: {
  formulario: ProductoraFormularioInsert;
  gastos: Array<{
    gasto: GastoInsert;
    context: Omit<ProductoraComprobanteInsert, 'comprobante_id' | 'formulario_id'>;
  }>;
}): Promise<RepositoryListResult<ProductoraGastoFullRow>> {
  if (input.gastos.length === 0) {
    return { data: [], error: { code: 'INVALID_INPUT', message: 'Debe proporcionar al menos un gasto' } };
  }

  const { data: formularioData, error: formularioError } = await supabase
    .from(FORMULARIOS_TABLE)
    .insert(input.formulario)
    .select()
    .single();

  if (formularioError || !formularioData) {
    return { data: [], error: mapSupabaseError(formularioError || { message: 'Error al crear formulario' }) };
  }

  const createdComprobanteIds: string[] = [];

  for (let i = 0; i < input.gastos.length; i++) {
    const item = input.gastos[i];

    const comprobanteData = mapGastoToComprobante(item.gasto, {
      factura_emitida_a: (item.context as any).factura_emitida_a || null,
      acuerdo_pago: (item.context as any).acuerdo_pago || null,
      forma_pago: (item.context as any).forma_pago || null,
    });
    const { data: comprobante, error: comprobanteError } = await supabase
      .from(COMPROBANTES_TABLE)
      .insert(comprobanteData)
      .select()
      .single();

    if (comprobanteError || !comprobante) {
      for (const comprobanteId of createdComprobanteIds) {
        await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobanteId);
      }
      await supabase.from(FORMULARIOS_TABLE).delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
    }

    createdComprobanteIds.push(comprobante.id);

    const contextInsert = mapContextInsert(item.context, comprobante.id, formularioData.id);
    const { error: contextError } = await supabase
      .from(CONTEXT_TABLE)
      .insert(contextInsert);

    if (contextError) {
      for (const comprobanteId of createdComprobanteIds) {
        await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobanteId);
      }
      await supabase.from(FORMULARIOS_TABLE).delete().eq('id', formularioData.id);
      return { data: [], error: mapSupabaseError(contextError) };
    }
  }

  const results: ProductoraGastoFullRow[] = [];
  for (const comprobanteId of createdComprobanteIds) {
    const result = await findById(comprobanteId);
    if (result.error) {
      return { data: results, error: result.error };
    }
    if (result.data) {
      results.push(result.data);
    }
  }

  return { data: results, error: null };
}

export async function addGastoToFormulario(
  formularioId: string,
  input: {
    gasto: GastoInsert;
    context: Omit<ProductoraComprobanteInsert, 'comprobante_id' | 'formulario_id'>;
  }
): Promise<RepositoryResult<ProductoraGastoFullRow>> {
  const comprobanteData = mapGastoToComprobante(input.gasto, {
    factura_emitida_a: (input.context as any).factura_emitida_a || null,
    acuerdo_pago: (input.context as any).acuerdo_pago || null,
    forma_pago: (input.context as any).forma_pago || null,
  });
  const { data: comprobante, error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .insert(comprobanteData)
    .select()
    .single();

  if (comprobanteError || !comprobante) {
    return { data: null, error: mapSupabaseError(comprobanteError || { message: 'Error al crear comprobante' }) };
  }

  const contextInsert = mapContextInsert(input.context, comprobante.id, formularioId);
  const { error: contextError } = await supabase
    .from(CONTEXT_TABLE)
    .insert(contextInsert);

  if (contextError) {
    await supabase.from(COMPROBANTES_TABLE).delete().eq('id', comprobante.id);
    return { data: null, error: mapSupabaseError(contextError) };
  }

  return findById(comprobante.id);
}

export async function update(
  gastoId: string,
  input: {
    gasto?: GastoUpdate;
    formulario?: ProductoraFormularioUpdate;
    context?: Record<string, unknown>;
  }
): Promise<RepositoryResult<ProductoraGastoFullRow>> {
  const current = await findById(gastoId);
  if (current.error || !current.data) {
    return { data: null, error: current.error || { code: 'NOT_FOUND', message: 'Gasto no encontrado' } };
  }

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

  if (input.formulario && Object.keys(input.formulario).length > 0) {
    const { error: formularioError } = await supabase
      .from(FORMULARIOS_TABLE)
      .update({ ...input.formulario, updated_at: new Date().toISOString() })
      .eq('id', current.data.formulario_id);

    if (formularioError) {
      return { data: null, error: mapSupabaseError(formularioError) };
    }
  }

  if (input.context && Object.keys(input.context).length > 0) {
    const { error: contextError } = await supabase
      .from(CONTEXT_TABLE)
      .update(input.context)
      .eq('comprobante_id', gastoId);

    if (contextError) {
      return { data: null, error: mapSupabaseError(contextError) };
    }
  }

  return findById(gastoId);
}

export async function remove(gastoId: string): Promise<RepositoryResult<null>> {
  const current = await findById(gastoId);
  if (current.error || !current.data) {
    return { data: null, error: current.error || { code: 'NOT_FOUND', message: 'Gasto no encontrado' } };
  }

  const formularioId = current.data.formulario_id;

  const { error: comprobanteError } = await supabase
    .from(COMPROBANTES_TABLE)
    .delete()
    .eq('id', gastoId);

  if (comprobanteError) {
    return { data: null, error: mapSupabaseError(comprobanteError) };
  }

  const { data: remainingComprobantes } = await supabase
    .from(CONTEXT_TABLE)
    .select('id')
    .eq('formulario_id', formularioId);

  if (!remainingComprobantes || remainingComprobantes.length === 0) {
    const { error: formularioError } = await supabase
      .from(FORMULARIOS_TABLE)
      .delete()
      .eq('id', formularioId);

    if (formularioError) {
      console.warn('Error eliminando formulario huérfano:', formularioError);
    }
  }

  return { data: null, error: null };
}

export async function findByFormularioId(formularioId: string): Promise<RepositoryListResult<ProductoraGastoFullRow>> {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('formulario_id', formularioId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: mapSupabaseError(error) };
  }

  return { data: data as ProductoraGastoFullRow[], error: null };
}
