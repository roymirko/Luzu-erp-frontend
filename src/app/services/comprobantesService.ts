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
    formaPago: row.forma_pago as any,
    cotizacion: row.cotizacion ?? undefined,
    banco: row.banco ?? undefined,
    numeroOperacion: row.numero_operacion ?? undefined,
    fechaPago: row.fecha_pago ? new Date(row.fecha_pago) : undefined,
    condicionIva: row.condicion_iva as any,
    comprobantePago: row.comprobante_pago ?? undefined,
    ingresosBrutos: row.ingresos_brutos ?? 0,
    retencionGanancias: row.retencion_ganancias ?? 0,
    fechaEstimadaPago: row.fecha_estimada_pago ? new Date(row.fecha_estimada_pago) : undefined,
    notaAdmin: row.nota_admin ?? undefined,
    retencionIva: row.retencion_iva ?? 0,
    retencionSuss: row.retencion_suss ?? 0,
    fechaVencimiento: row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : undefined,
    fechaIngresoCheque: row.fecha_ingreso_cheque ? new Date(row.fecha_ingreso_cheque) : undefined,
    certificacionEnviadaFecha: row.certificacion_enviada_fecha ? new Date(row.certificacion_enviada_fecha) : undefined,
    portal: row.portal ?? undefined,
    contacto: row.contacto ?? undefined,
    fechaEnvio: row.fecha_envio ? new Date(row.fecha_envio) : undefined,
    ordenPublicidadIdIngreso: row.orden_publicidad_id_ingreso ?? undefined,
    facturaEmitidaA: row.factura_emitida_a ?? undefined,
    acuerdoPago: row.acuerdo_pago ?? undefined,
    // Flattened context
    areaOrigen: row.area_origen ?? undefined,
    contextoComprobanteId: row.contexto_comprobante_id ?? undefined,
    ordenPublicidadId: row.orden_publicidad_id ?? undefined,
    itemOrdenPublicidadId: row.item_orden_publicidad_id ?? undefined,
    sector: row.sector ?? undefined,
    rubroContexto: row.rubro_contexto ?? undefined,
    subRubroContexto: row.sub_rubro_contexto ?? undefined,
    condicionPago: row.condicion_pago ?? undefined,
    adjuntos: row.adjuntos ?? undefined,
    nombreCampana: row.nombre_campana ?? undefined,
    unidadNegocio: row.unidad_negocio ?? undefined,
    categoriaNegocio: row.categoria_negocio ?? undefined,
    categoria: row.categoria ?? undefined,
    cliente: row.cliente ?? undefined,
    montoProg: row.monto_prog ?? undefined,
    valorImponible: row.valor_imponible ?? undefined,
    bonificacion: row.bonificacion ?? undefined,
    empresaPrograma: row.empresa_programa ?? undefined,
    pais: row.pais ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by ?? undefined,
  };
}

function mapToDBInsert(input: CreateComprobanteInput): ComprobanteInsert {
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
    neto,
    iva_alicuota: ivaAlicuota,
    iva_monto: ivaMonto,
    percepciones,
    total: input.total,
    empresa: input.empresa || null,
    concepto: input.concepto || null,
    observaciones: input.observaciones || null,
    estado: 'activo',
    estado_pago: 'creado',
    forma_pago: input.formaPago || null,
    cotizacion: null,
    banco: null,
    numero_operacion: null,
    fecha_pago: input.fechaPago?.toISOString().split('T')[0] || null,
    condicion_iva: null,
    comprobante_pago: null,
    ingresos_brutos: null,
    retencion_ganancias: null,
    fecha_estimada_pago: null,
    nota_admin: null,
    retencion_iva: null,
    retencion_suss: null,
    fecha_vencimiento: null,
    fecha_ingreso_cheque: null,
    certificacion_enviada_fecha: null,
    portal: null,
    contacto: null,
    fecha_envio: null,
    orden_publicidad_id_ingreso: null,
    factura_emitida_a: input.facturaEmitidaA || null,
    acuerdo_pago: input.acuerdoPago || null,
    // Flattened context defaults
    area_origen: null,
    contexto_comprobante_id: null,
    orden_publicidad_id: null,
    item_orden_publicidad_id: null,
    sector: null,
    rubro_contexto: null,
    sub_rubro_contexto: null,
    condicion_pago: null,
    adjuntos: null,
    nombre_campana: null,
    unidad_negocio: null,
    categoria_negocio: null,
    categoria: null,
    cliente: null,
    monto_prog: null,
    valor_imponible: null,
    bonificacion: null,
    empresa_programa: null,
    pais: null,
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
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getEgresos(): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.findEgresos();
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getIngresos(): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.findIngresos();
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: Comprobante | null; error: string | null }> {
  const result = await comprobantesRepo.findById(id);
  if (result.error) return { data: null, error: result.error.message };
  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function getByEntidad(entidadId: string): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.findByEntidad(entidadId);
  if (result.error) return { data: [], error: result.error.message };
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
  if (fields.formaPago !== undefined) updateData.forma_pago = fields.formaPago;
  if (fields.cotizacion !== undefined) updateData.cotizacion = fields.cotizacion;
  if (fields.banco !== undefined) updateData.banco = fields.banco;
  if (fields.numeroOperacion !== undefined) updateData.numero_operacion = fields.numeroOperacion;
  if (fields.fechaPago !== undefined) updateData.fecha_pago = fields.fechaPago?.toISOString().split('T')[0];
  if (fields.condicionIva !== undefined) updateData.condicion_iva = fields.condicionIva;
  if (fields.comprobantePago !== undefined) updateData.comprobante_pago = fields.comprobantePago;
  if (fields.ingresosBrutos !== undefined) updateData.ingresos_brutos = fields.ingresosBrutos;
  if (fields.retencionGanancias !== undefined) updateData.retencion_ganancias = fields.retencionGanancias;
  if (fields.fechaEstimadaPago !== undefined) updateData.fecha_estimada_pago = fields.fechaEstimadaPago?.toISOString().split('T')[0];
  if (fields.notaAdmin !== undefined) updateData.nota_admin = fields.notaAdmin;
  if (fields.retencionIva !== undefined) updateData.retencion_iva = fields.retencionIva;
  if (fields.retencionSuss !== undefined) updateData.retencion_suss = fields.retencionSuss;
  if (fields.fechaVencimiento !== undefined) updateData.fecha_vencimiento = fields.fechaVencimiento?.toISOString().split('T')[0];
  if (fields.fechaIngresoCheque !== undefined) updateData.fecha_ingreso_cheque = fields.fechaIngresoCheque?.toISOString().split('T')[0];
  if (fields.certificacionEnviadaFecha !== undefined) updateData.certificacion_enviada_fecha = fields.certificacionEnviadaFecha?.toISOString().split('T')[0];
  if (fields.portal !== undefined) updateData.portal = fields.portal;
  if (fields.contacto !== undefined) updateData.contacto = fields.contacto;
  if (fields.fechaEnvio !== undefined) updateData.fecha_envio = fields.fechaEnvio?.toISOString().split('T')[0];
  if (fields.ordenPublicidadIdIngreso !== undefined) updateData.orden_publicidad_id_ingreso = fields.ordenPublicidadIdIngreso;
  if (fields.facturaEmitidaA !== undefined) updateData.factura_emitida_a = fields.facturaEmitidaA;
  if (fields.acuerdoPago !== undefined) updateData.acuerdo_pago = fields.acuerdoPago;

  const result = await comprobantesRepo.update(id, updateData);
  if (result.error || !result.data) {
    return { data: null, error: result.error?.message || 'Error al actualizar el comprobante' };
  }
  return { data: mapFromDB(result.data), error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await comprobantesRepo.remove(id);
  if (result.error) return { success: false, error: result.error.message };
  return { success: true, error: null };
}

export async function updateEstadoPago(id: string, estadoPago: EstadoPago): Promise<{ data: Comprobante | null; error: string | null }> {
  return update({ id, estadoPago });
}

export async function search(term: string, tipoMovimiento?: TipoMovimiento): Promise<{ data: Comprobante[]; error: string | null }> {
  const result = await comprobantesRepo.search(term, tipoMovimiento);
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

// ============================================
// With context (comprobantes_full view)
// ============================================

function mapFromDBWithContext(row: ComprobanteFullRow): ComprobanteWithContext {
  return {
    ...mapFromDB(row),
    // Contexto comprobante joined
    ctxMesGestion: row.ctx_mes_gestion ?? undefined,
    ctxDetalleCampana: row.ctx_detalle_campana ?? undefined,
    ctxPrograma: row.ctx_programa ?? undefined,
    ctxEjecutivo: row.ctx_ejecutivo ?? undefined,
    ctxMesVenta: row.ctx_mes_venta ?? undefined,
    ctxMesInicio: row.ctx_mes_inicio ?? undefined,
    ctxNombreCampana: row.ctx_nombre_campana ?? undefined,
    ctxUnidadNegocio: row.ctx_unidad_negocio ?? undefined,
    ctxCategoriaNegocio: row.ctx_categoria_negocio ?? undefined,
    ctxRubro: row.ctx_rubro ?? undefined,
    ctxSubRubro: row.ctx_sub_rubro ?? undefined,
    ctxEstado: row.ctx_estado ?? undefined,
    // OP joined (egresos)
    opNumeroOrden: row.op_numero_orden ?? undefined,
    opResponsable: row.op_responsable ?? undefined,
    opUnidadNegocio: row.op_unidad_negocio ?? undefined,
    opCategoriaNegocio: row.op_categoria_negocio ?? undefined,
    opNombreCampana: row.op_nombre_campana ?? undefined,
    opRazonSocial: row.op_razon_social ?? undefined,
    opMarca: row.op_marca ?? undefined,
    opMesServicio: row.op_mes_servicio ?? undefined,
    opAcuerdoPago: row.op_acuerdo_pago ?? undefined,
    // OP joined (ingresos)
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
    // Entidad
    entidadCuitEfectivo: row.entidad_cuit_efectivo ?? undefined,
    entidadCondicionIva: row.entidad_condicion_iva ?? undefined,
  };
}

export async function getAllWithContext(): Promise<{ data: ComprobanteWithContext[]; error: string | null }> {
  const result = await comprobantesRepo.findAllWithContext();
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDBWithContext), error: null };
}

export async function getWithContextByTipo(tipoMovimiento: TipoMovimiento): Promise<{ data: ComprobanteWithContext[]; error: string | null }> {
  const result = await comprobantesRepo.findWithContextByTipo(tipoMovimiento);
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDBWithContext), error: null };
}

export async function searchWithContext(term: string, tipoMovimiento?: TipoMovimiento): Promise<{ data: ComprobanteWithContext[]; error: string | null }> {
  const result = await comprobantesRepo.searchWithContext(term, tipoMovimiento);
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDBWithContext), error: null };
}

export async function updateEstadoPagoWithValidation(id: string, nuevoEstado: EstadoPago): Promise<{ data: Comprobante | null; error: string | null }> {
  const current = await getById(id);
  if (current.error || !current.data) {
    return { data: null, error: current.error || 'Comprobante no encontrado' };
  }
  if (isComprobanteLocked(current.data.estadoPago)) {
    return { data: null, error: `No se puede modificar un comprobante con estado "${current.data.estadoPago}"` };
  }
  return update({ id, estadoPago: nuevoEstado });
}
