import * as gastosRepo from '../repositories/gastosRepository';
import type { GastoRow, GastoInsert } from '../repositories/types';
import type {
  Gasto,
  CreateGastoInput,
  UpdateGastoInput,
  EstadoGasto,
  EstadoPago,
  Moneda,
  GastoValidationResult,
  calcularImporteTotal,
  validateGastoBase,
} from '../types/gastos';

const DEFAULT_IVA = 21;
const DEFAULT_MONEDA: Moneda = 'ARS';

/**
 * Mapea una fila de la base de datos al modelo de dominio
 */
export function mapFromDB(row: GastoRow): Gasto {
  return {
    id: row.id,
    proveedor: row.proveedor,
    razonSocial: row.razon_social || undefined,
    tipoFactura: row.tipo_factura || undefined,
    numeroFactura: row.numero_factura || undefined,
    fechaFactura: row.fecha_factura ? new Date(row.fecha_factura) : undefined,
    moneda: (row.moneda || DEFAULT_MONEDA) as Moneda,
    neto: row.neto || 0,
    iva: row.iva || DEFAULT_IVA,
    importeTotal: row.importe_total || 0,
    empresa: row.empresa || undefined,
    conceptoGasto: row.concepto_gasto || undefined,
    observaciones: row.observaciones || undefined,
    estado: (row.estado || 'pendiente') as EstadoGasto,
    estadoPago: (row.estado_pago || 'pendiente') as EstadoPago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by || undefined,
  };
}

/**
 * Mapea el input de creación al formato de inserción de la base de datos
 */
export function mapToDBInsert(input: CreateGastoInput): GastoInsert {
  const neto = input.neto || 0;
  const iva = input.iva ?? DEFAULT_IVA;
  const importeTotal = input.importeTotal ?? neto * (1 + iva / 100);

  return {
    proveedor: input.proveedor,
    razon_social: input.razonSocial || null,
    tipo_factura: input.tipoFactura || null,
    numero_factura: input.numeroFactura || null,
    fecha_factura: input.fechaFactura?.toISOString().split('T')[0] || null,
    moneda: input.moneda || DEFAULT_MONEDA,
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
 * Valida los campos base de un gasto
 */
export function validateCreate(input: CreateGastoInput): GastoValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.proveedor?.trim()) {
    errors.push({ field: 'proveedor', message: 'Debe seleccionar un proveedor' });
  }
  if (!input.neto || input.neto <= 0) {
    errors.push({ field: 'neto', message: 'Debe ingresar un importe neto válido' });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Obtiene todos los gastos
 */
export async function getAll(): Promise<{ data: Gasto[]; error: string | null }> {
  const result = await gastosRepo.findAll();

  if (result.error) {
    console.error('Error fetching gastos:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

/**
 * Obtiene un gasto por ID
 */
export async function getById(id: string): Promise<{ data: Gasto | null; error: string | null }> {
  const result = await gastosRepo.findById(id);

  if (result.error) {
    console.error('Error fetching gasto:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

/**
 * Crea un nuevo gasto
 */
export async function create(input: CreateGastoInput): Promise<{ data: Gasto | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const gastoInsert = mapToDBInsert(input);
  const result = await gastosRepo.create(gastoInsert);

  if (result.error || !result.data) {
    console.error('Error creating gasto:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear el gasto' };
  }

  return { data: mapFromDB(result.data), error: null };
}

/**
 * Actualiza un gasto existente
 */
export async function update(input: UpdateGastoInput): Promise<{ data: Gasto | null; error: string | null }> {
  const { id, ...fields } = input;

  const updateData: Record<string, unknown> = {};

  if (fields.proveedor !== undefined) updateData.proveedor = fields.proveedor;
  if (fields.razonSocial !== undefined) updateData.razon_social = fields.razonSocial;
  if (fields.tipoFactura !== undefined) updateData.tipo_factura = fields.tipoFactura;
  if (fields.numeroFactura !== undefined) updateData.numero_factura = fields.numeroFactura;
  if (fields.fechaFactura !== undefined) {
    updateData.fecha_factura = fields.fechaFactura?.toISOString().split('T')[0] || null;
  }
  if (fields.moneda !== undefined) updateData.moneda = fields.moneda;
  if (fields.neto !== undefined) updateData.neto = fields.neto;
  if (fields.iva !== undefined) updateData.iva = fields.iva;
  if (fields.importeTotal !== undefined) updateData.importe_total = fields.importeTotal;
  if (fields.empresa !== undefined) updateData.empresa = fields.empresa;
  if (fields.conceptoGasto !== undefined) updateData.concepto_gasto = fields.conceptoGasto;
  if (fields.observaciones !== undefined) updateData.observaciones = fields.observaciones;
  if (fields.estado !== undefined) updateData.estado = fields.estado;
  if (fields.estadoPago !== undefined) updateData.estado_pago = fields.estadoPago;

  // Recalcular importe total si cambió neto o iva
  if (fields.neto !== undefined || fields.iva !== undefined) {
    const currentResult = await gastosRepo.findById(id);
    if (currentResult.data) {
      const neto = fields.neto ?? currentResult.data.neto;
      const iva = fields.iva ?? currentResult.data.iva;
      updateData.importe_total = neto * (1 + iva / 100);
    }
  }

  const result = await gastosRepo.update(id, updateData);

  if (result.error) {
    console.error('Error updating gasto:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

/**
 * Elimina un gasto
 */
export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await gastosRepo.remove(id);

  if (result.error) {
    console.error('Error deleting gasto:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

/**
 * Calcula el importe total a partir del neto e IVA
 */
export function calculateTotalImporte(neto: number, iva: number = DEFAULT_IVA): number {
  return neto * (1 + iva / 100);
}
