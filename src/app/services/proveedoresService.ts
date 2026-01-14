import * as proveedoresRepo from '../repositories/proveedoresRepository';
import type { ProveedorRow, ProveedorInsert } from '../repositories/types';
import type {
  Proveedor,
  CreateProveedorInput,
  UpdateProveedorInput,
  ProveedorValidationResult,
} from '../types/proveedores';

function mapFromDB(row: ProveedorRow): Proveedor {
  return {
    id: row.id,
    razonSocial: row.razon_social,
    empresa: row.empresa,
    cuit: row.cuit,
    direccion: row.direccion,
    activo: row.activo,
    createdAt: new Date(row.fecha_creacion),
    createdBy: row.creado_por,
  };
}

function mapToDBInsert(input: CreateProveedorInput): ProveedorInsert {
  return {
    razon_social: input.razonSocial,
    empresa: input.empresa || input.razonSocial,
    cuit: input.cuit,
    direccion: input.direccion || null,
    activo: true,
    creado_por: input.createdBy || null,
  };
}

function validateCuit(cuit: string): boolean {
  const cleaned = cuit.replace(/[^0-9]/g, '');
  return cleaned.length === 11;
}

export function validateCreate(input: CreateProveedorInput): ProveedorValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.razonSocial?.trim()) {
    errors.push({ field: 'razonSocial', message: 'La razón social es requerida' });
  }

  if (!input.cuit?.trim()) {
    errors.push({ field: 'cuit', message: 'El CUIT es requerido' });
  } else if (!validateCuit(input.cuit)) {
    errors.push({ field: 'cuit', message: 'El CUIT debe tener 11 dígitos' });
  }

  return { valid: errors.length === 0, errors };
}

export async function getAll(): Promise<{ data: Proveedor[]; error: string | null }> {
  const result = await proveedoresRepo.findAll();

  if (result.error) {
    console.error('Error fetching proveedores:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getActive(): Promise<{ data: Proveedor[]; error: string | null }> {
  const result = await proveedoresRepo.findActive();

  if (result.error) {
    console.error('Error fetching active proveedores:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: Proveedor | null; error: string | null }> {
  const result = await proveedoresRepo.findById(id);

  if (result.error) {
    console.error('Error fetching proveedor:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function create(input: CreateProveedorInput): Promise<{ data: Proveedor | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const existingResult = await proveedoresRepo.findByCuit(input.cuit);
  if (existingResult.data) {
    return { data: null, error: 'Ya existe un proveedor con ese CUIT' };
  }

  const proveedorInsert = mapToDBInsert(input);
  const result = await proveedoresRepo.create(proveedorInsert);

  if (result.error || !result.data) {
    console.error('Error creating proveedor:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear el proveedor' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function update(input: UpdateProveedorInput): Promise<{ data: Proveedor | null; error: string | null }> {
  const { id, ...fields } = input;

  const updateData: Record<string, unknown> = {};
  if (fields.razonSocial !== undefined) updateData.razon_social = fields.razonSocial;
  if (fields.empresa !== undefined) updateData.empresa = fields.empresa;
  if (fields.cuit !== undefined) updateData.cuit = fields.cuit;
  if (fields.direccion !== undefined) updateData.direccion = fields.direccion;
  if (fields.activo !== undefined) updateData.activo = fields.activo;

  const result = await proveedoresRepo.update(id, updateData);

  if (result.error || !result.data) {
    console.error('Error updating proveedor:', result.error);
    return { data: null, error: result.error?.message || 'Error al actualizar el proveedor' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await proveedoresRepo.remove(id);

  if (result.error) {
    console.error('Error deleting proveedor:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

export async function search(term: string): Promise<{ data: Proveedor[]; error: string | null }> {
  const result = await proveedoresRepo.search(term);

  if (result.error) {
    console.error('Error searching proveedores:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}
