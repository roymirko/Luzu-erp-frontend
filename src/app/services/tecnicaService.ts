import * as tecnicaRepo from '../repositories/tecnicaRepository';
import type {
  GastoInsert,
  GastoUpdate,
  TecnicaComprobanteUpdate,
  TecnicaGastoFullRow,
} from '../repositories/types';
import type {
  GastoTecnica,
  CreateGastoTecnicaInput,
  UpdateGastoTecnicaInput,
  GastoValidationResult,
  EstadoGasto,
  EstadoPago,
} from '../types/tecnica';

const DEFAULT_IVA = 21;

function mapFromDB(row: TecnicaGastoFullRow): GastoTecnica {
  return {
    id: row.id,
    proveedor: row.proveedor,
    razonSocial: row.razon_social || '',
    tipoFactura: row.tipo_factura || undefined,
    numeroFactura: row.numero_factura || undefined,
    fechaFactura: row.fecha_factura || undefined,
    moneda: row.moneda,
    neto: row.neto,
    iva: row.iva,
    importeTotal: row.importe_total,
    empresa: row.empresa || '',
    conceptoGasto: row.concepto_gasto || '',
    observaciones: row.observaciones || '',
    estado: (row.estado || 'pendiente') as EstadoGasto,
    estadoPago: (row.estado_pago || 'creado') as EstadoPago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by || undefined,
    ordenPublicidadId: row.orden_publicidad_id || undefined,
    itemOrdenPublicidadId: row.item_orden_publicidad_id || undefined,
    facturaEmitidaA: row.factura_emitida_a || '',
    sector: row.sector || undefined,
    rubro: row.rubro || undefined,
    subRubro: row.sub_rubro || undefined,
    condicionPago: row.condicion_pago || undefined,
    formaPago: row.forma_pago || undefined,
    fechaPago: row.fecha_pago || undefined,
    adjuntos: row.adjuntos as string[] | undefined,
    ordenPublicidad: row.orden_publicidad || undefined,
    responsable: row.responsable || undefined,
    unidadNegocio: row.unidad_negocio || undefined,
    categoriaNegocio: row.categoria_negocio || undefined,
    nombreCampana: row.nombre_campana || undefined,
    marca: row.marca || undefined,
    mesServicio: row.mes_servicio || undefined,
    acuerdoPago: row.orden_acuerdo_pago || undefined,
  };
}

function mapToGastoInsert(input: CreateGastoTecnicaInput): GastoInsert {
  const neto = input.neto || 0;
  const iva = input.iva ?? DEFAULT_IVA;
  const importeTotal = neto * (1 + iva / 100);

  return {
    proveedor: input.proveedor,
    razon_social: input.razonSocial || null,
    tipo_factura: input.tipoFactura || null,
    numero_factura: input.numeroFactura || null,
    fecha_factura: input.fechaFactura || null,
    moneda: input.moneda || 'ARS',
    neto,
    iva,
    importe_total: importeTotal,
    empresa: input.empresa || null,
    concepto_gasto: input.conceptoGasto || null,
    observaciones: input.observaciones || null,
    estado: 'activo',
    estado_pago: 'creado',
    created_by: input.createdBy || null,
  };
}

function mapToContextInsert(input: CreateGastoTecnicaInput) {
  return {
    orden_publicidad_id: input.ordenPublicidadId || null,
    item_orden_publicidad_id: input.itemOrdenPublicidadId || null,
    factura_emitida_a: input.facturaEmitidaA || null,
    sector: input.sector || null,
    rubro: input.rubro || null,
    sub_rubro: input.subRubro || null,
    condicion_pago: input.condicionPago || null,
    forma_pago: input.formaPago || null,
    fecha_pago: input.fechaPago || null,
    adjuntos: input.adjuntos || null,
    unidad_negocio: input.unidadNegocio || null,
    categoria_negocio: input.categoriaNegocio || null,
    nombre_campana: input.nombreCampana || null,
  };
}

export function validateCreate(input: CreateGastoTecnicaInput): GastoValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.proveedor?.trim()) {
    errors.push({ field: 'proveedor', message: 'Debe seleccionar un proveedor' });
  }
  if (!input.facturaEmitidaA?.trim()) {
    errors.push({ field: 'facturaEmitidaA', message: 'Debe seleccionar a quién se emite la factura' });
  }
  if (!input.empresa?.trim()) {
    errors.push({ field: 'empresa', message: 'Debe seleccionar una empresa' });
  }
  if (!input.neto || input.neto <= 0) {
    errors.push({ field: 'neto', message: 'El importe neto es requerido' });
  }

  return { valid: errors.length === 0, errors };
}

export async function getAll(): Promise<{ data: GastoTecnica[]; error: string | null }> {
  const result = await tecnicaRepo.findAll();
  if (result.error) {
    console.error('Error fetching gastos tecnica:', result.error);
    return { data: [], error: result.error.message };
  }
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: GastoTecnica | null; error: string | null }> {
  const result = await tecnicaRepo.findById(id);
  if (result.error) {
    console.error('Error fetching gasto tecnica:', result.error);
    return { data: null, error: result.error.message };
  }
  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function getByOrdenId(ordenId: string): Promise<{ data: GastoTecnica[]; error: string | null }> {
  const result = await tecnicaRepo.findByOrdenId(ordenId);
  if (result.error) {
    console.error('Error fetching gastos tecnica by orden:', result.error);
    return { data: [], error: result.error.message };
  }
  return { data: result.data.map(mapFromDB), error: null };
}

export async function getByItemOrdenId(itemId: string): Promise<{ data: GastoTecnica[]; error: string | null }> {
  const result = await tecnicaRepo.findByItemOrdenId(itemId);
  if (result.error) {
    console.error('Error fetching gastos tecnica by item orden:', result.error);
    return { data: [], error: result.error.message };
  }
  return { data: result.data.map(mapFromDB), error: null };
}

export async function create(input: CreateGastoTecnicaInput): Promise<{ data: GastoTecnica | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const gastoInsert = mapToGastoInsert(input);
  const contextInsert = mapToContextInsert(input);

  const result = await tecnicaRepo.create(gastoInsert, contextInsert);

  if (result.error || !result.data) {
    console.error('Error creating gasto tecnica:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear el gasto' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function createMultiple(inputs: CreateGastoTecnicaInput[]): Promise<{ data: GastoTecnica[]; error: string | null }> {
  console.log('[TecnicaService] createMultiple inputs:', inputs);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const validation = validateCreate(input);
    if (!validation.valid) {
      console.error('[TecnicaService] Validación fallida para input', i, ':', validation.errors);
      return { data: [], error: validation.errors.map(e => e.message).join(', ') };
    }
  }

  const items = inputs.map(input => ({
    gasto: mapToGastoInsert(input),
    context: mapToContextInsert(input),
  }));
  console.log('[TecnicaService] Items mapeados para inserción:', items);

  const result = await tecnicaRepo.createMultiple(items);
  console.log('[TecnicaService] Resultado del repositorio:', result);

  if (result.error) {
    console.error('[TecnicaService] Error creating gastos:', result.error);
    return { data: result.data.map(mapFromDB), error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function update(input: UpdateGastoTecnicaInput): Promise<{ data: GastoTecnica | null; error: string | null }> {
  const { id, ...fields } = input;

  const gastoUpdate: GastoUpdate = {};
  if (fields.proveedor !== undefined) gastoUpdate.proveedor = fields.proveedor;
  if (fields.razonSocial !== undefined) gastoUpdate.razon_social = fields.razonSocial;
  if (fields.tipoFactura !== undefined) gastoUpdate.tipo_factura = fields.tipoFactura;
  if (fields.numeroFactura !== undefined) gastoUpdate.numero_factura = fields.numeroFactura;
  if (fields.fechaFactura !== undefined) gastoUpdate.fecha_factura = fields.fechaFactura;
  if (fields.neto !== undefined) {
    const iva = fields.iva ?? DEFAULT_IVA;
    gastoUpdate.neto = fields.neto;
    gastoUpdate.iva = iva;
    gastoUpdate.importe_total = fields.neto * (1 + iva / 100);
  }
  if (fields.empresa !== undefined) gastoUpdate.empresa = fields.empresa;
  if (fields.conceptoGasto !== undefined) gastoUpdate.concepto_gasto = fields.conceptoGasto;
  if (fields.observaciones !== undefined) gastoUpdate.observaciones = fields.observaciones;
  if (fields.estado !== undefined) gastoUpdate.estado = fields.estado;
  if (fields.estadoPago !== undefined) gastoUpdate.estado_pago = fields.estadoPago;

  // Consolidated fields → comprobante extras (these live in comprobantes table, not context)
  const comprobanteExtras: Record<string, unknown> = {};
  if (fields.facturaEmitidaA !== undefined) comprobanteExtras.factura_emitida_a = fields.facturaEmitidaA;
  if (fields.formaPago !== undefined) comprobanteExtras.forma_pago = fields.formaPago;
  if (fields.fechaPago !== undefined) comprobanteExtras.fecha_pago = fields.fechaPago;

  const contextUpdate: TecnicaComprobanteUpdate = {};
  if (fields.sector !== undefined) contextUpdate.sector = fields.sector;
  if (fields.rubro !== undefined) contextUpdate.rubro = fields.rubro;
  if (fields.subRubro !== undefined) contextUpdate.sub_rubro = fields.subRubro;
  if (fields.condicionPago !== undefined) contextUpdate.condicion_pago = fields.condicionPago;
  if (fields.adjuntos !== undefined) contextUpdate.adjuntos = fields.adjuntos;
  if (fields.itemOrdenPublicidadId !== undefined) contextUpdate.item_orden_publicidad_id = fields.itemOrdenPublicidadId;
  if (fields.unidadNegocio !== undefined) contextUpdate.unidad_negocio = fields.unidadNegocio;
  if (fields.categoriaNegocio !== undefined) contextUpdate.categoria_negocio = fields.categoriaNegocio;
  if (fields.nombreCampana !== undefined) contextUpdate.nombre_campana = fields.nombreCampana;

  const result = await tecnicaRepo.update(id, gastoUpdate, contextUpdate, Object.keys(comprobanteExtras).length > 0 ? comprobanteExtras : undefined);

  if (result.error) {
    console.error('Error updating gasto tecnica:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await tecnicaRepo.remove(id);
  if (result.error) {
    console.error('Error deleting gasto tecnica:', result.error);
    return { success: false, error: result.error.message };
  }
  return { success: true, error: null };
}

export async function approveGasto(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await tecnicaRepo.updateEstado(id, 'activo');
  if (result.error) {
    console.error('Error approving gasto tecnica:', result.error);
    return { success: false, error: result.error.message };
  }
  return { success: true, error: null };
}

export async function rejectGasto(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await tecnicaRepo.updateEstado(id, 'anulado');
  if (result.error) {
    console.error('Error rejecting gasto tecnica:', result.error);
    return { success: false, error: result.error.message };
  }
  return { success: true, error: null };
}

export async function markGastoAsPaid(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await tecnicaRepo.updateEstadoPago(id, 'pagado');
  if (result.error) {
    console.error('Error marking gasto tecnica as paid:', result.error);
    return { success: false, error: result.error.message };
  }
  return { success: true, error: null };
}

export function calculateTotalEjecutado(gastos: GastoTecnica[]): number {
  return gastos.reduce((sum, gasto) => sum + (gasto.neto || 0), 0);
}

export function calculateDisponible(presupuesto: number, gastos: GastoTecnica[]): number {
  return presupuesto - calculateTotalEjecutado(gastos);
}

export function isOverBudget(presupuesto: number, gastos: GastoTecnica[]): boolean {
  return calculateTotalEjecutado(gastos) > presupuesto;
}
