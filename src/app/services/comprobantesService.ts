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
    // Payment fields
    formaPago: row.forma_pago as any,
    cotizacion: row.cotizacion ?? undefined,
    banco: row.banco ?? undefined,
    numeroOperacion: row.numero_operacion ?? undefined,
    fechaPago: row.fecha_pago ? new Date(row.fecha_pago) : undefined,
    // Admin fields
    condicionIva: row.condicion_iva as any,
    comprobantePago: row.comprobante_pago ?? undefined,
    ingresosBrutos: row.ingresos_brutos ?? 0,
    retencionGanancias: row.retencion_ganancias ?? 0,
    fechaEstimadaPago: row.fecha_estimada_pago ? new Date(row.fecha_estimada_pago) : undefined,
    notaAdmin: row.nota_admin ?? undefined,
    // Ingreso-specific fields
    retencionIva: row.retencion_iva ?? 0,
    retencionSuss: row.retencion_suss ?? 0,
    fechaVencimiento: row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : undefined,
    fechaIngresoCheque: row.fecha_ingreso_cheque ? new Date(row.fecha_ingreso_cheque) : undefined,
    certificacionEnviadaFecha: row.certificacion_enviada_fecha ? new Date(row.certificacion_enviada_fecha) : undefined,
    portal: row.portal ?? undefined,
    contacto: row.contacto ?? undefined,
    fechaEnvio: row.fecha_envio ? new Date(row.fecha_envio) : undefined,
    ordenPublicidadIdIngreso: row.orden_publicidad_id_ingreso ?? undefined,
    // Consolidated context fields
    facturaEmitidaA: row.factura_emitida_a ?? undefined,
    acuerdoPago: row.acuerdo_pago ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by ?? undefined,
  };
}

function mapToDBInsert(input: CreateComprobanteInput): ComprobanteInsert {
  // Calculate IVA and neto from total if not provided
  const ivaAlicuota = input.ivaAlicuota ?? 21;
  const ivaMonto = input.ivaMonto ?? (input.total * ivaAlicuota / 100);
  const percepciones = input.percepciones ?? 0;
  const neto = input.neto ?? (input.total - ivaMonto - percepciones);

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
    neto: neto,
    iva_alicuota: ivaAlicuota,
    iva_monto: ivaMonto,
    percepciones: percepciones,
    total: input.total,
    empresa: input.empresa || null,
    concepto: input.concepto || null,
    observaciones: input.observaciones || null,
    estado: 'activo',
    estado_pago: 'creado',
    // Payment fields
    forma_pago: input.formaPago || null,
    cotizacion: input.cotizacion || null,
    banco: input.banco || null,
    numero_operacion: input.numeroOperacion || null,
    fecha_pago: input.fechaPago?.toISOString().split('T')[0] || null,
    // Consolidated context fields
    factura_emitida_a: input.facturaEmitidaA || null,
    acuerdo_pago: input.acuerdoPago || null,
    created_by: input.createdBy || null,
  };
}

export function validateCreate(input: CreateComprobanteInput): ComprobanteValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.entidadNombre?.trim()) {
    errors.push({ field: 'entidadNombre', message: 'Debe seleccionar una entidad' });
  }

  if (input.total === undefined || input.total < 0) {
    errors.push({ field: 'total', message: 'Debe ingresar un importe total válido' });
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
  // Payment fields
  if (fields.formaPago !== undefined) updateData.forma_pago = fields.formaPago;
  if (fields.cotizacion !== undefined) updateData.cotizacion = fields.cotizacion;
  if (fields.banco !== undefined) updateData.banco = fields.banco;
  if (fields.numeroOperacion !== undefined) updateData.numero_operacion = fields.numeroOperacion;
  if (fields.fechaPago !== undefined) updateData.fecha_pago = fields.fechaPago?.toISOString().split('T')[0];
  // Admin fields
  if (fields.condicionIva !== undefined) updateData.condicion_iva = fields.condicionIva;
  if (fields.comprobantePago !== undefined) updateData.comprobante_pago = fields.comprobantePago;
  if (fields.ingresosBrutos !== undefined) updateData.ingresos_brutos = fields.ingresosBrutos;
  if (fields.retencionGanancias !== undefined) updateData.retencion_ganancias = fields.retencionGanancias;
  if (fields.fechaEstimadaPago !== undefined) updateData.fecha_estimada_pago = fields.fechaEstimadaPago?.toISOString().split('T')[0];
  if (fields.notaAdmin !== undefined) updateData.nota_admin = fields.notaAdmin;
  // Ingreso-specific fields
  if (fields.retencionIva !== undefined) updateData.retencion_iva = fields.retencionIva;
  if (fields.retencionSuss !== undefined) updateData.retencion_suss = fields.retencionSuss;
  if (fields.fechaVencimiento !== undefined) updateData.fecha_vencimiento = fields.fechaVencimiento?.toISOString().split('T')[0];
  if (fields.fechaIngresoCheque !== undefined) updateData.fecha_ingreso_cheque = fields.fechaIngresoCheque?.toISOString().split('T')[0];
  if (fields.certificacionEnviadaFecha !== undefined) updateData.certificacion_enviada_fecha = fields.certificacionEnviadaFecha?.toISOString().split('T')[0];
  if (fields.portal !== undefined) updateData.portal = fields.portal;
  if (fields.contacto !== undefined) updateData.contacto = fields.contacto;
  if (fields.fechaEnvio !== undefined) updateData.fecha_envio = fields.fechaEnvio?.toISOString().split('T')[0];
  if (fields.ordenPublicidadIdIngreso !== undefined) updateData.orden_publicidad_id_ingreso = fields.ordenPublicidadIdIngreso;
  // Consolidated context fields
  if (fields.facturaEmitidaA !== undefined) updateData.factura_emitida_a = fields.facturaEmitidaA;
  if (fields.acuerdoPago !== undefined) updateData.acuerdo_pago = fields.acuerdoPago;

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
    entidadCuit: row.entidad_cuit_efectivo ?? row.entidad_cuit ?? undefined,
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
    // Payment fields
    formaPago: row.forma_pago as any,
    cotizacion: row.cotizacion ?? undefined,
    banco: row.banco ?? undefined,
    numeroOperacion: row.numero_operacion ?? undefined,
    fechaPago: row.fecha_pago ? new Date(row.fecha_pago) : undefined,
    // Admin fields (fallback to entidad data for condicionIva)
    condicionIva: (row.condicion_iva ?? row.entidad_condicion_iva ?? undefined) as any,
    comprobantePago: row.comprobante_pago ?? undefined,
    ingresosBrutos: row.ingresos_brutos ?? 0,
    retencionGanancias: row.retencion_ganancias ?? 0,
    fechaEstimadaPago: row.fecha_estimada_pago ? new Date(row.fecha_estimada_pago) : undefined,
    notaAdmin: row.nota_admin ?? undefined,
    // Ingreso-specific fields
    retencionIva: row.retencion_iva ?? 0,
    retencionSuss: row.retencion_suss ?? 0,
    fechaVencimiento: row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : undefined,
    fechaIngresoCheque: row.fecha_ingreso_cheque ? new Date(row.fecha_ingreso_cheque) : undefined,
    certificacionEnviadaFecha: row.certificacion_enviada_fecha ? new Date(row.certificacion_enviada_fecha) : undefined,
    portal: row.portal ?? undefined,
    contacto: row.contacto ?? undefined,
    fechaEnvio: row.fecha_envio ? new Date(row.fecha_envio) : undefined,
    ordenPublicidadIdIngreso: row.orden_publicidad_id_ingreso ?? undefined,
    // Consolidated context fields
    facturaEmitidaA: row.factura_emitida_a ?? undefined,
    acuerdoPago: row.acuerdo_pago ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by ?? undefined,
    // Context fields
    areaOrigen: row.area_origen,
    // Implementacion
    implementacionComprobanteId: row.implementacion_comprobante_id ?? undefined,
    ordenPublicidadId: row.orden_publicidad_id ?? undefined,
    itemOrdenPublicidadId: row.item_orden_publicidad_id ?? undefined,
    sector: row.sector ?? undefined,
    rubroGasto: row.rubro_gasto ?? undefined,
    subRubro: row.sub_rubro ?? undefined,
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
    // OP vinculada para ingresos
    ingresoOpId: row.ingreso_op_id ?? undefined,
    ingresoOpNumero: row.ingreso_op_numero ?? undefined,
    ingresoOpResponsable: row.ingreso_op_responsable ?? undefined,
    ingresoOpUnidadNegocio: row.ingreso_op_unidad_negocio ?? undefined,
    ingresoOpNombreCampana: row.ingreso_op_nombre_campana ?? undefined,
    ingresoOpMarca: row.ingreso_op_marca ?? undefined,
    ingresoOpRazonSocial: row.ingreso_op_razon_social ?? undefined,
    ingresoOpImporte: row.ingreso_op_importe ?? undefined,
    ingresoOpAcuerdoPago: row.ingreso_op_acuerdo_pago ?? undefined,
    ingresoOpMesServicio: row.ingreso_op_mes_servicio ?? undefined,
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
