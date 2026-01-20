import * as implementacionRepo from '../repositories/implementacionRepository';
import type {
  GastoInsert,
  GastoUpdate,
  ImplementacionGastoInsert,
  ImplementacionGastoUpdate,
  ImplementacionGastoFullRow,
} from '../repositories/types';
import type {
  GastoImplementacion,
  CreateGastoImplementacionInput,
  UpdateGastoImplementacionInput,
  GastoValidationResult,
  EstadoGasto,
  EstadoPago,
} from '../types/implementacion';

const DEFAULT_IVA = 21;

/**
 * Maps a database row (from view) to the domain model
 */
function mapFromDB(row: ImplementacionGastoFullRow): GastoImplementacion {
  return {
    // Core gasto fields
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
    estadoPago: (row.estado_pago || 'pendiente') as EstadoPago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by || undefined,
    // Implementacion context fields
    ordenPublicidadId: row.orden_publicidad_id || undefined,
    itemOrdenPublicidadId: row.item_orden_publicidad_id || undefined,
    facturaEmitidaA: row.factura_emitida_a || '',
    sector: row.sector || undefined,
    rubroGasto: row.rubro_gasto || undefined,
    subRubro: row.sub_rubro || undefined,
    condicionPago: row.condicion_pago || undefined,
    fechaPago: row.fecha_pago || undefined,
    adjuntos: row.adjuntos as string[] | undefined,
    // Joined orden publicidad fields
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

/**
 * Maps input to GastoInsert (core table)
 */
function mapToGastoInsert(input: CreateGastoImplementacionInput): GastoInsert {
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
    estado: 'pendiente',
    estado_pago: 'pendiente',
    created_by: input.createdBy || null,
  };
}

/**
 * Maps input to ImplementacionGastoInsert (context table)
 */
function mapToContextInsert(input: CreateGastoImplementacionInput): Omit<ImplementacionGastoInsert, 'gasto_id'> {
  return {
    orden_publicidad_id: input.ordenPublicidadId || null,
    item_orden_publicidad_id: input.itemOrdenPublicidadId || null,
    factura_emitida_a: input.facturaEmitidaA || null,
    sector: input.sector || null,
    rubro_gasto: input.rubroGasto || null,
    sub_rubro: input.subRubro || null,
    condicion_pago: input.condicionPago || null,
    fecha_pago: input.fechaPago || null,
    adjuntos: input.adjuntos || null,
  };
}

/**
 * Validates create input
 */
export function validateCreate(input: CreateGastoImplementacionInput): GastoValidationResult {
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
  if (!input.conceptoGasto?.trim()) {
    errors.push({ field: 'conceptoGasto', message: 'Debe ingresar un concepto de gasto' });
  }
  if (!input.neto || input.neto <= 0) {
    errors.push({ field: 'neto', message: 'El importe neto es requerido' });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Gets all gastos de implementacion
 */
export async function getAll(): Promise<{ data: GastoImplementacion[]; error: string | null }> {
  const result = await implementacionRepo.findAll();

  if (result.error) {
    console.error('Error fetching gastos:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

/**
 * Gets a gasto by ID
 */
export async function getById(id: string): Promise<{ data: GastoImplementacion | null; error: string | null }> {
  const result = await implementacionRepo.findById(id);

  if (result.error) {
    console.error('Error fetching gasto:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

/**
 * Gets all gastos for an orden de publicidad
 */
export async function getByOrdenId(ordenId: string): Promise<{ data: GastoImplementacion[]; error: string | null }> {
  const result = await implementacionRepo.findByOrdenId(ordenId);

  if (result.error) {
    console.error('Error fetching gastos by orden:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

/**
 * Gets all gastos for an item de orden de publicidad
 */
export async function getByItemOrdenId(itemId: string): Promise<{ data: GastoImplementacion[]; error: string | null }> {
  const result = await implementacionRepo.findByItemOrdenId(itemId);

  if (result.error) {
    console.error('Error fetching gastos by item orden:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

/**
 * Creates a single gasto de implementacion
 */
export async function create(input: CreateGastoImplementacionInput): Promise<{ data: GastoImplementacion | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const gastoInsert = mapToGastoInsert(input);
  const contextInsert = mapToContextInsert(input);

  const result = await implementacionRepo.create(gastoInsert, contextInsert);

  if (result.error || !result.data) {
    console.error('Error creating gasto:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear el gasto' };
  }

  return { data: mapFromDB(result.data), error: null };
}

/**
 * Creates multiple gastos de implementacion (one per input)
 */
export async function createMultiple(inputs: CreateGastoImplementacionInput[]): Promise<{ data: GastoImplementacion[]; error: string | null }> {
  // Validate all inputs first
  for (const input of inputs) {
    const validation = validateCreate(input);
    if (!validation.valid) {
      return { data: [], error: validation.errors.map(e => e.message).join(', ') };
    }
  }

  const items = inputs.map(input => ({
    gasto: mapToGastoInsert(input),
    context: mapToContextInsert(input),
  }));

  const result = await implementacionRepo.createMultiple(items);

  if (result.error) {
    console.error('Error creating gastos:', result.error);
    return { data: result.data.map(mapFromDB), error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

/**
 * Updates a gasto de implementacion
 */
export async function update(input: UpdateGastoImplementacionInput): Promise<{ data: GastoImplementacion | null; error: string | null }> {
  const { id, ...fields } = input;

  // Build gasto update
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

  // Build context update
  const contextUpdate: ImplementacionGastoUpdate = {};
  if (fields.facturaEmitidaA !== undefined) contextUpdate.factura_emitida_a = fields.facturaEmitidaA;
  if (fields.sector !== undefined) contextUpdate.sector = fields.sector;
  if (fields.rubroGasto !== undefined) contextUpdate.rubro_gasto = fields.rubroGasto;
  if (fields.subRubro !== undefined) contextUpdate.sub_rubro = fields.subRubro;
  if (fields.condicionPago !== undefined) contextUpdate.condicion_pago = fields.condicionPago;
  if (fields.fechaPago !== undefined) contextUpdate.fecha_pago = fields.fechaPago;
  if (fields.adjuntos !== undefined) contextUpdate.adjuntos = fields.adjuntos;

  const result = await implementacionRepo.update(id, gastoUpdate, contextUpdate);

  if (result.error) {
    console.error('Error updating gasto:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

/**
 * Removes a gasto de implementacion
 */
export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await implementacionRepo.remove(id);

  if (result.error) {
    console.error('Error deleting gasto:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

/**
 * Approves a gasto (changes estado to 'activo')
 */
export async function approveGasto(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await implementacionRepo.updateEstado(id, 'activo');

  if (result.error) {
    console.error('Error approving gasto:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

/**
 * Rejects a gasto (changes estado to 'anulado')
 */
export async function rejectGasto(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await implementacionRepo.updateEstado(id, 'anulado');

  if (result.error) {
    console.error('Error rejecting gasto:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

/**
 * Marks a gasto as paid (changes estado_pago to 'pagado')
 */
export async function markGastoAsPaid(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await implementacionRepo.updateEstadoPago(id, 'pagado');

  if (result.error) {
    console.error('Error marking gasto as paid:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

/**
 * Calculates total ejecutado for a list of gastos
 */
export function calculateTotalEjecutado(gastos: GastoImplementacion[]): number {
  return gastos.reduce((sum, gasto) => sum + (gasto.neto || 0), 0);
}

/**
 * Calculates disponible (presupuesto - ejecutado)
 */
export function calculateDisponible(presupuesto: number, gastos: GastoImplementacion[]): number {
  return presupuesto - calculateTotalEjecutado(gastos);
}

/**
 * Checks if gastos exceed budget
 */
export function isOverBudget(presupuesto: number, gastos: GastoImplementacion[]): boolean {
  return calculateTotalEjecutado(gastos) > presupuesto;
}
