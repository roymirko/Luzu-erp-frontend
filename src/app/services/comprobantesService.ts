import * as comprobantesRepo from '../repositories/comprobantesRepository';
import type { ComprobanteRow, ComprobanteFullRow, ComprobanteInsert } from '../repositories/types';
import type {
  Comprobante,
  ComprobanteWithContext,
  CreateComprobanteInput,
  UpdateComprobanteInput,
  ComprobanteValidationResult,
  TipoMovimiento,
  EstadoPago,
} from '../types/comprobantes';
import { isComprobanteLocked } from '../types/comprobantes';

function mapFromDB(row: ComprobanteRow): Comprobante {
  return {
    id: row.id,
    tipoMovimiento: row.tipo_movimiento,
    entidadId: row.entidad_id ?? undefined,
    entidadNombre: row.entidad_nombre,
    entidadCuit: row.entidad_cuit ?? undefined,
    tipoComprobante: row.tipo_comprobante as any,
    puntoVenta: row.punto_venta ?? undefined,
    numeroComprobante: row.numero_comprobante ?? undefined,
    fechaComprobante: row.fecha_comprobante ? new Date(row.fecha_comprobante) : undefined,
    cae: row.cae ?? undefined,
    fechaVencimientoCae: row.fecha_vencimiento_cae ? new Date(row.fecha_vencimiento_cae) : undefined,
    moneda: row.moneda as 'ARS' | 'USD',
    neto: row.neto,
    ivaAlicuota: row.iva_alicuota,
    ivaMonto: row.iva_monto,
    percepciones: row.percepciones,
    total: row.total,
    empresa: row.empresa ?? undefined,
    concepto: row.concepto ?? undefined,
    observaciones: row.observaciones ?? undefined,
    estado: row.estado as any,
    estadoPago: row.estado_pago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by ?? undefined,
  };
}

function mapToDBInsert(input: CreateComprobanteInput): ComprobanteInsert {
  // Calculate IVA and total if not provided
  const ivaAlicuota = input.ivaAlicuota ?? 21;
  const ivaMonto = input.ivaMonto ?? (input.neto * ivaAlicuota / 100);
  const percepciones = input.percepciones ?? 0;
  const total = input.total ?? (input.neto + ivaMonto + percepciones);

  return {
    tipo_movimiento: input.tipoMovimiento || 'egreso',
    entidad_id: input.entidadId || null,
    entidad_nombre: input.entidadNombre,
    entidad_cuit: input.entidadCuit || null,
    tipo_comprobante: input.tipoComprobante || null,
    punto_venta: input.puntoVenta || null,
    numero_comprobante: input.numeroComprobante || null,
    fecha_comprobante: input.fechaComprobante?.toISOString().split('T')[0] || null,
    cae: input.cae || null,
    fecha_vencimiento_cae: input.fechaVencimientoCae?.toISOString().split('T')[0] || null,
    moneda: input.moneda || 'ARS',
    neto: input.neto,
    iva_alicuota: ivaAlicuota,
    iva_monto: ivaMonto,
    percepciones: percepciones,
    total: total,
    empresa: input.empresa || null,
    concepto: input.concepto || null,
    observaciones: input.observaciones || null,
    estado: 'activo',
    estado_pago: 'pendiente',
    created_by: input.createdBy || null,
  };
}

export function validateCreate(input: CreateComprobanteInput): ComprobanteValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.entidadNombre?.trim()) {
    errors.push({ field: 'entidadNombre', message: 'Debe seleccionar una entidad' });
  }

  if (input.neto === undefined || input.neto < 0) {
    errors.push({ field: 'neto', message: 'Debe ingresar un importe neto válido' });
  }

  return { valid: errors.length === 0, errors };
}

export async function getAll(): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.findAll();

  if (result.error) {
    console.error('Error fetching comprobantes:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getEgresos(): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.findEgresos();

  if (result.error) {
    console.error('Error fetching egresos:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getIngresos(): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.findIngresos();

  if (result.error) {
    console.error('Error fetching ingresos:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: Comprobante | null; error: string | null }> {
  const result = await comprobantesRepo.findById(id);

  if (result.error) {
    console.error('Error fetching comprobante:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function getByEntidad(entidadId: string): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.findByEntidad(entidadId);

  if (result.error) {
    console.error('Error fetching comprobantes by entidad:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function create(input: CreateComprobanteInput): Promise<{ data: Comprobante | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const comprobanteInsert = mapToDBInsert(input);
  const result = await comprobantesRepo.create(comprobanteInsert);

  if (result.error || !result.data) {
    console.error('Error creating comprobante:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear el comprobante' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function update(input: UpdateComprobanteInput): Promise<{ data: Comprobante | null; error: string | null }> {
  const { id, ...fields } = input;

  const updateData: Record<string, unknown> = {};
  if (fields.tipoMovimiento !== undefined) updateData.tipo_movimiento = fields.tipoMovimiento;
  if (fields.entidadId !== undefined) updateData.entidad_id = fields.entidadId;
  if (fields.entidadNombre !== undefined) updateData.entidad_nombre = fields.entidadNombre;
  if (fields.entidadCuit !== undefined) updateData.entidad_cuit = fields.entidadCuit;
  if (fields.tipoComprobante !== undefined) updateData.tipo_comprobante = fields.tipoComprobante;
  if (fields.puntoVenta !== undefined) updateData.punto_venta = fields.puntoVenta;
  if (fields.numeroComprobante !== undefined) updateData.numero_comprobante = fields.numeroComprobante;
  if (fields.fechaComprobante !== undefined) updateData.fecha_comprobante = fields.fechaComprobante?.toISOString().split('T')[0];
  if (fields.cae !== undefined) updateData.cae = fields.cae;
  if (fields.fechaVencimientoCae !== undefined) updateData.fecha_vencimiento_cae = fields.fechaVencimientoCae?.toISOString().split('T')[0];
  if (fields.moneda !== undefined) updateData.moneda = fields.moneda;
  if (fields.neto !== undefined) updateData.neto = fields.neto;
  if (fields.ivaAlicuota !== undefined) updateData.iva_alicuota = fields.ivaAlicuota;
  if (fields.ivaMonto !== undefined) updateData.iva_monto = fields.ivaMonto;
  if (fields.percepciones !== undefined) updateData.percepciones = fields.percepciones;
  if (fields.total !== undefined) updateData.total = fields.total;
  if (fields.empresa !== undefined) updateData.empresa = fields.empresa;
  if (fields.concepto !== undefined) updateData.concepto = fields.concepto;
  if (fields.observaciones !== undefined) updateData.observaciones = fields.observaciones;
  if (fields.estado !== undefined) updateData.estado = fields.estado;
  if (fields.estadoPago !== undefined) updateData.estado_pago = fields.estadoPago;

  const result = await comprobantesRepo.update(id, updateData);

  if (result.error || !result.data) {
    console.error('Error updating comprobante:', result.error);
    return { data: null, error: result.error?.message || 'Error al actualizar el comprobante' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await comprobantesRepo.remove(id);

  if (result.error) {
    console.error('Error deleting comprobante:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

export async function updateEstadoPago(id: string, estadoPago: EstadoPago): Promise<{ data: Comprobante | null; error: string | null }> {
  return update({ id, estadoPago });
}

export async function search(term: string, tipoMovimiento?: TipoMovimiento): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.search(term, tipoMovimiento);

  if (result.error) {
    console.error('Error searching comprobantes:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

// ============================================
// Functions with context (comprobantes_full view)
// ============================================

function mapFromDBWithContext(row: ComprobanteFullRow): ComprobanteWithContext {
  return {
    // Base comprobante fields
    id: row.id,
    tipoMovimiento: row.tipo_movimiento,
    entidadId: row.entidad_id ?? undefined,
    entidadNombre: row.entidad_nombre,
    entidadCuit: row.entidad_cuit ?? undefined,
    tipoComprobante: row.tipo_comprobante as any,
    puntoVenta: row.punto_venta ?? undefined,
    numeroComprobante: row.numero_comprobante ?? undefined,
    fechaComprobante: row.fecha_comprobante ? new Date(row.fecha_comprobante) : undefined,
    cae: row.cae ?? undefined,
    fechaVencimientoCae: row.fecha_vencimiento_cae ? new Date(row.fecha_vencimiento_cae) : undefined,
    moneda: row.moneda as 'ARS' | 'USD',
    neto: row.neto,
    ivaAlicuota: row.iva_alicuota,
    ivaMonto: row.iva_monto,
    percepciones: row.percepciones,
    total: row.total,
    empresa: row.empresa ?? undefined,
    concepto: row.concepto ?? undefined,
    observaciones: row.observaciones ?? undefined,
    estado: row.estado as any,
    estadoPago: row.estado_pago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by ?? undefined,
    // Context fields
    areaOrigen: row.area_origen,
    // Implementacion
    implementacionComprobanteId: row.implementacion_comprobante_id ?? undefined,
    ordenPublicidadId: row.orden_publicidad_id ?? undefined,
    sector: row.sector ?? undefined,
    rubroGasto: row.rubro_gasto ?? undefined,
    subRubro: row.sub_rubro ?? undefined,
    implFacturaEmitidaA: row.impl_factura_emitida_a ?? undefined,
    implNombreCampana: row.impl_nombre_campana ?? undefined,
    implOrdenPublicidad: row.impl_orden_publicidad ?? undefined,
    // Programacion
    programacionComprobanteId: row.programacion_comprobante_id ?? undefined,
    programacionFormularioId: row.programacion_formulario_id ?? undefined,
    progPrograma: row.prog_programa ?? undefined,
    progMesGestion: row.prog_mes_gestion ?? undefined,
    progUnidadNegocio: row.prog_unidad_negocio ?? undefined,
    progCategoriaNegocio: row.prog_categoria_negocio ?? undefined,
    // Experience
    experienceComprobanteId: row.experience_comprobante_id ?? undefined,
    experienceFormularioId: row.experience_formulario_id ?? undefined,
    expNombreCampana: row.exp_nombre_campana ?? undefined,
    expMesGestion: row.exp_mes_gestion ?? undefined,
  };
}

export async function getAllWithContext(): Promise<{ data: ComprobanteWithContext[]; error: string | null }> {
  const result = await comprobantesRepo.findAllWithContext();

  if (result.error) {
    console.error('Error fetching comprobantes with context:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDBWithContext), error: null };
}

export async function getWithContextByTipo(tipoMovimiento: TipoMovimiento): Promise<{ data: ComprobanteWithContext[]; error: string | null }> {
  const result = await comprobantesRepo.findWithContextByTipo(tipoMovimiento);

  if (result.error) {
    console.error('Error fetching comprobantes by tipo:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDBWithContext), error: null };
}

export async function searchWithContext(term: string, tipoMovimiento?: TipoMovimiento): Promise<{ data: ComprobanteWithContext[]; error: string | null }> {
  const result = await comprobantesRepo.searchWithContext(term, tipoMovimiento);

  if (result.error) {
    console.error('Error searching comprobantes:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDBWithContext), error: null };
}

export async function updateEstadoPagoWithValidation(id: string, nuevoEstado: EstadoPago): Promise<{ data: Comprobante | null; error: string | null }> {
  // First get current state
  const current = await getById(id);
  if (current.error || !current.data) {
    return { data: null, error: current.error || 'Comprobante no encontrado' };
  }

  // Check if locked
  if (isComprobanteLocked(current.data.estadoPago)) {
    return { data: null, error: `No se puede modificar un comprobante con estado "${current.data.estadoPago}"` };
  }

  return update({ id, estadoPago: nuevoEstado });
}
