/**
 * Unified gastos service — all areas, area_origen-aware.
 * Single INSERT into comprobantes (no more 2-table transactions for OP-linked areas).
 */
import * as gastosRepo from '../repositories/gastosRepository';
import type { GastoFullRow, GastoInsertRow } from '../repositories/gastosRepository';
import type {
  Gasto,
  CreateGastoInput,
  UpdateGastoInput,
  GastoValidationResult,
  AreaOrigenGasto,
  EstadoGasto,
  EstadoPago,
} from '../types/gastos';

const DEFAULT_IVA = 21;

// ============================================
// Mappers
// ============================================

export function mapFromDB(row: GastoFullRow): Gasto {
  return {
    id: row.id,
    areaOrigen: (row.area_origen || 'directo') as AreaOrigenGasto,
    // Core comprobante → gasto fields
    proveedor: row.entidad_nombre,
    razonSocial: row.entidad_nombre || '',
    tipoFactura: row.tipo_comprobante || undefined,
    numeroFactura: row.numero_comprobante || undefined,
    fechaFactura: row.fecha_comprobante || undefined,
    moneda: row.moneda || 'ARS',
    neto: row.neto,
    iva: row.iva_alicuota,
    importeTotal: row.total,
    empresa: row.empresa || '',
    conceptoGasto: row.concepto || '',
    observaciones: row.observaciones || '',
    estado: (row.estado || 'pendiente') as EstadoGasto,
    estadoPago: (row.estado_pago || 'creado') as EstadoPago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by || undefined,
    // Consolidated
    facturaEmitidaA: row.factura_emitida_a || undefined,
    acuerdoPago: row.acuerdo_pago || undefined,
    formaPago: row.forma_pago || undefined,
    fechaPago: row.fecha_pago || undefined,
    // Flattened context
    ordenPublicidadId: row.orden_publicidad_id || undefined,
    itemOrdenPublicidadId: row.item_orden_publicidad_id || undefined,
    sector: row.sector || undefined,
    rubro: row.rubro_contexto || undefined,
    subRubro: row.sub_rubro_contexto || undefined,
    condicionPago: row.condicion_pago || undefined,
    adjuntos: row.adjuntos || undefined,
    nombreCampana: row.nombre_campana || undefined,
    unidadNegocio: row.unidad_negocio || undefined,
    categoriaNegocio: row.categoria_negocio || undefined,
    contextoComprobanteId: row.contexto_comprobante_id || undefined,
    categoria: row.categoria || undefined,
    cliente: row.cliente || undefined,
    montoProg: row.monto_prog ?? undefined,
    valorImponible: row.valor_imponible ?? undefined,
    bonificacion: row.bonificacion ?? undefined,
    empresaPrograma: row.empresa_programa || undefined,
    pais: row.pais || undefined,
    // Joined OP
    opNumeroOrden: row.op_numero_orden || undefined,
    opResponsable: row.op_responsable || undefined,
    opUnidadNegocio: row.op_unidad_negocio || undefined,
    opCategoriaNegocio: row.op_categoria_negocio || undefined,
    opNombreCampana: row.op_nombre_campana || undefined,
    opRazonSocial: row.op_razon_social || undefined,
    opMarca: row.op_marca || undefined,
    opMesServicio: row.op_mes_servicio || undefined,
    opAcuerdoPago: row.op_acuerdo_pago || undefined,
    // Joined contexto_comprobante
    ctxMesGestion: row.ctx_mes_gestion || undefined,
    ctxDetalleCampana: row.ctx_detalle_campana || undefined,
    ctxPrograma: row.ctx_programa || undefined,
    ctxEjecutivo: row.ctx_ejecutivo || undefined,
    ctxMesVenta: row.ctx_mes_venta || undefined,
    ctxMesInicio: row.ctx_mes_inicio || undefined,
    ctxNombreCampana: row.ctx_nombre_campana || undefined,
    ctxUnidadNegocio: row.ctx_unidad_negocio || undefined,
    ctxCategoriaNegocio: row.ctx_categoria_negocio || undefined,
    ctxRubro: row.ctx_rubro || undefined,
    ctxSubRubro: row.ctx_sub_rubro || undefined,
    ctxEstado: row.ctx_estado || undefined,
    // Backward compat: unprefixed OP aliases (used by form components)
    ordenPublicidad: row.op_numero_orden || undefined,
    responsable: row.op_responsable || undefined,
    marca: row.op_marca || undefined,
    mesServicio: row.op_mes_servicio || undefined,
    // Backward compat: unprefixed formulario aliases (used by prog/exp/prod components)
    formularioId: row.contexto_comprobante_id || undefined,
    programa: row.ctx_programa || undefined,
    ejecutivo: row.ctx_ejecutivo || undefined,
    mesGestion: row.ctx_mes_gestion || undefined,
    mesVenta: row.ctx_mes_venta || undefined,
    mesInicio: row.ctx_mes_inicio || undefined,
    detalleCampana: row.ctx_detalle_campana || undefined,
    formularioEstado: row.ctx_estado || undefined,
    formularioCreatedAt: row.created_at ? new Date(row.created_at) : undefined,
    formularioCreatedBy: row.created_by || undefined,
    subrubro: row.sub_rubro_contexto || row.ctx_sub_rubro || undefined,
    subRubroEmpresa: row.sub_rubro_contexto || undefined,
    empresaContext: row.empresa_programa || undefined,
    formularioRubro: row.ctx_rubro || row.rubro_contexto || undefined,
    formularioSubRubro: row.ctx_sub_rubro || row.sub_rubro_contexto || undefined,
  };
}

function mapToInsertRow(input: CreateGastoInput): GastoInsertRow {
  const neto = input.neto || 0;
  const iva = input.iva ?? DEFAULT_IVA;
  const ivaMonto = neto * (iva / 100);
  const total = neto + ivaMonto;

  return {
    tipo_movimiento: 'egreso',
    entidad_nombre: input.proveedor,
    entidad_cuit: null,
    tipo_comprobante: input.tipoFactura || null,
    numero_comprobante: input.numeroFactura || null,
    fecha_comprobante: input.fechaFactura || null,
    moneda: input.moneda || 'ARS',
    neto,
    iva_alicuota: iva,
    iva_monto: ivaMonto,
    percepciones: 0,
    total,
    empresa: input.empresa || null,
    concepto: input.conceptoGasto || null,
    observaciones: input.observaciones || null,
    estado: 'activo',
    estado_pago: 'creado',
    forma_pago: input.formaPago || null,
    fecha_pago: input.fechaPago || null,
    factura_emitida_a: input.facturaEmitidaA || null,
    acuerdo_pago: input.acuerdoPago || null,
    created_by: input.createdBy || null,
    // Context columns
    area_origen: input.areaOrigen,
    contexto_comprobante_id: input.contextoComprobanteId || null,
    orden_publicidad_id: input.ordenPublicidadId || null,
    item_orden_publicidad_id: input.itemOrdenPublicidadId || null,
    sector: input.sector || null,
    rubro_contexto: input.rubro || null,
    sub_rubro_contexto: input.subRubro || null,
    condicion_pago: input.condicionPago || null,
    adjuntos: input.adjuntos || null,
    nombre_campana: input.nombreCampana || null,
    unidad_negocio: input.unidadNegocio || null,
    categoria_negocio: input.categoriaNegocio || null,
    categoria: input.categoria || null,
    cliente: input.cliente || null,
    monto_prog: input.montoProg ?? null,
    valor_imponible: input.valorImponible ?? null,
    bonificacion: input.bonificacion ?? null,
    empresa_programa: input.empresaPrograma || null,
    pais: input.pais || null,
  };
}

// ============================================
// Validation
// ============================================

export function validateCreate(input: CreateGastoInput): GastoValidationResult {
  const errors: { field: string; message: string }[] = [];
  const isEfectivo = input.formaPago === 'efectivo';

  if (!isEfectivo && !input.proveedor?.trim()) {
    errors.push({ field: 'proveedor', message: 'Debe seleccionar un proveedor' });
  }
  if (!input.neto || input.neto <= 0) {
    errors.push({ field: 'neto', message: 'El importe neto es requerido' });
  }
  if (!isEfectivo) {
    // Area-specific validations
    if (['implementacion', 'tecnica', 'talentos'].includes(input.areaOrigen)) {
      if (!input.facturaEmitidaA?.trim()) {
        errors.push({ field: 'facturaEmitidaA', message: 'Debe seleccionar a quién se emite la factura' });
      }
    }
    if (!input.empresa?.trim()) {
      errors.push({ field: 'empresa', message: 'Debe seleccionar una empresa' });
    }
  }
  return { valid: errors.length === 0, errors };
}

// ============================================
// CRUD
// ============================================

export async function getByArea(area: AreaOrigenGasto): Promise<{ data: Gasto[]; error: string | null }> {
  const result = await gastosRepo.findByArea(area);
  if (result.error) {
    console.error(`Error fetching gastos ${area}:`, result.error);
    return { data: [], error: result.error.message };
  }
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: Gasto | null; error: string | null }> {
  const result = await gastosRepo.findById(id);
  if (result.error) {
    console.error('Error fetching gasto:', result.error);
    return { data: null, error: result.error.message };
  }
  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function getByOrdenId(ordenId: string, area?: AreaOrigenGasto): Promise<{ data: Gasto[]; error: string | null }> {
  const result = await gastosRepo.findByOrdenId(ordenId, area);
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getByItemOrdenId(itemId: string, area?: AreaOrigenGasto): Promise<{ data: Gasto[]; error: string | null }> {
  const result = await gastosRepo.findByItemOrdenId(itemId, area);
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getByContextoId(contextoId: string): Promise<{ data: Gasto[]; error: string | null }> {
  const result = await gastosRepo.findByContextoId(contextoId);
  if (result.error) return { data: [], error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

export async function create(input: CreateGastoInput): Promise<{ data: Gasto | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }
  const row = mapToInsertRow(input);
  const result = await gastosRepo.create(row);
  if (result.error || !result.data) {
    console.error('Error creating gasto:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear el gasto' };
  }
  return { data: mapFromDB(result.data), error: null };
}

export async function createMultiple(inputs: CreateGastoInput[]): Promise<{ data: Gasto[]; error: string | null }> {
  // Validate all
  for (const input of inputs) {
    const v = validateCreate(input);
    if (!v.valid) return { data: [], error: v.errors.map(e => e.message).join(', ') };
  }
  const rows = inputs.map(mapToInsertRow);
  const result = await gastosRepo.createMultiple(rows);
  if (result.error) return { data: result.data.map(mapFromDB), error: result.error.message };
  return { data: result.data.map(mapFromDB), error: null };
}

export async function update(input: UpdateGastoInput): Promise<{ data: Gasto | null; error: string | null }> {
  const { id, ...fields } = input;
  const updateData: Record<string, unknown> = {};

  // Core comprobante fields
  if (fields.proveedor !== undefined) updateData.entidad_nombre = fields.proveedor;
  if (fields.razonSocial !== undefined) updateData.entidad_nombre = fields.razonSocial;
  if (fields.tipoFactura !== undefined) updateData.tipo_comprobante = fields.tipoFactura;
  if (fields.numeroFactura !== undefined) updateData.numero_comprobante = fields.numeroFactura;
  if (fields.fechaFactura !== undefined) updateData.fecha_comprobante = fields.fechaFactura;
  if (fields.moneda !== undefined) updateData.moneda = fields.moneda;
  if (fields.neto !== undefined) {
    const iva = fields.iva ?? DEFAULT_IVA;
    updateData.neto = fields.neto;
    updateData.iva_alicuota = iva;
    updateData.iva_monto = fields.neto * (iva / 100);
    updateData.total = fields.neto + fields.neto * (iva / 100);
  }
  if (fields.empresa !== undefined) updateData.empresa = fields.empresa;
  if (fields.conceptoGasto !== undefined) updateData.concepto = fields.conceptoGasto;
  if (fields.observaciones !== undefined) updateData.observaciones = fields.observaciones;
  if (fields.estado !== undefined) updateData.estado = fields.estado;
  if (fields.estadoPago !== undefined) updateData.estado_pago = fields.estadoPago;
  // Consolidated
  if (fields.facturaEmitidaA !== undefined) updateData.factura_emitida_a = fields.facturaEmitidaA;
  if (fields.acuerdoPago !== undefined) updateData.acuerdo_pago = fields.acuerdoPago;
  if (fields.formaPago !== undefined) updateData.forma_pago = fields.formaPago;
  if (fields.fechaPago !== undefined) updateData.fecha_pago = fields.fechaPago;
  // Context columns
  if (fields.ordenPublicidadId !== undefined) updateData.orden_publicidad_id = fields.ordenPublicidadId;
  if (fields.itemOrdenPublicidadId !== undefined) updateData.item_orden_publicidad_id = fields.itemOrdenPublicidadId;
  if (fields.sector !== undefined) updateData.sector = fields.sector;
  if (fields.rubro !== undefined) updateData.rubro_contexto = fields.rubro;
  if (fields.subRubro !== undefined) updateData.sub_rubro_contexto = fields.subRubro;
  if (fields.condicionPago !== undefined) updateData.condicion_pago = fields.condicionPago;
  if (fields.adjuntos !== undefined) updateData.adjuntos = fields.adjuntos;
  if (fields.nombreCampana !== undefined) updateData.nombre_campana = fields.nombreCampana;
  if (fields.unidadNegocio !== undefined) updateData.unidad_negocio = fields.unidadNegocio;
  if (fields.categoriaNegocio !== undefined) updateData.categoria_negocio = fields.categoriaNegocio;
  if (fields.contextoComprobanteId !== undefined) updateData.contexto_comprobante_id = fields.contextoComprobanteId;
  if (fields.categoria !== undefined) updateData.categoria = fields.categoria;
  if (fields.cliente !== undefined) updateData.cliente = fields.cliente;
  if (fields.montoProg !== undefined) updateData.monto_prog = fields.montoProg;
  if (fields.valorImponible !== undefined) updateData.valor_imponible = fields.valorImponible;
  if (fields.bonificacion !== undefined) updateData.bonificacion = fields.bonificacion;
  if (fields.empresaPrograma !== undefined) updateData.empresa_programa = fields.empresaPrograma;
  if (fields.pais !== undefined) updateData.pais = fields.pais;

  const result = await gastosRepo.update(id, updateData);
  if (result.error) {
    console.error('Error updating gasto:', result.error);
    return { data: null, error: result.error.message };
  }
  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await gastosRepo.remove(id);
  if (result.error) return { success: false, error: result.error.message };
  return { success: true, error: null };
}

// ============================================
// Helpers
// ============================================

export function calculateTotalEjecutado(gastos: Gasto[]): number {
  return gastos.reduce((sum, g) => sum + (g.neto || 0), 0);
}

export function calculateDisponible(presupuesto: number, gastos: Gasto[]): number {
  return presupuesto - calculateTotalEjecutado(gastos);
}

export function isOverBudget(presupuesto: number, gastos: Gasto[]): boolean {
  return calculateTotalEjecutado(gastos) > presupuesto;
}
