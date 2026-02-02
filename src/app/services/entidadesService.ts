import * as entidadesRepo from '../repositories/entidadesRepository';
import type { EntidadRow, EntidadInsert } from '../repositories/types';
import type {
  Entidad,
  CreateEntidadInput,
  UpdateEntidadInput,
  EntidadValidationResult,
  TipoEntidad,
  CondicionIva,
} from '../types/entidades';

function mapFromDB(row: EntidadRow): Entidad {
  return {
    id: row.id,
    razonSocial: row.razon_social,
    nombreFantasia: row.nombre_fantasia ?? undefined,
    cuit: row.cuit,
    tipoEntidad: row.tipo_entidad,
    condicionIva: row.condicion_iva,
    direccion: row.direccion ?? undefined,
    localidad: row.localidad ?? undefined,
    provincia: row.provincia ?? undefined,
    email: row.email ?? undefined,
    telefono: row.telefono ?? undefined,
    empresa: row.empresa ?? undefined,
    activo: row.activo,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by ?? undefined,
  };
}

function mapToDBInsert(input: CreateEntidadInput): EntidadInsert {
  return {
    razon_social: input.razonSocial,
    nombre_fantasia: input.nombreFantasia || null,
    cuit: input.cuit,
    tipo_entidad: input.tipoEntidad || 'proveedor',
    condicion_iva: input.condicionIva || 'responsable_inscripto',
    direccion: input.direccion || null,
    localidad: input.localidad || null,
    provincia: input.provincia || null,
    email: input.email || null,
    telefono: input.telefono || null,
    empresa: input.empresa || input.razonSocial,
    activo: true,
    created_by: input.createdBy || null,
  };
}

function validateCuit(cuit: string): boolean {
  const cleaned = cuit.replace(/[^0-9]/g, '');
  return cleaned.length === 11;
}

export function validateCreate(input: CreateEntidadInput): EntidadValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.razonSocial?.trim()) {
    errors.push({ field: 'razonSocial', message: 'La razón social es requerida' });
  }

  if (!input.cuit?.trim()) {
    errors.push({ field: 'cuit', message: 'El CUIT es requerido' });
  } else if (!validateCuit(input.cuit)) {
    errors.push({ field: 'cuit', message: 'El CUIT debe tener 11 dígitos' });
  }

  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push({ field: 'email', message: 'Email inválido' });
  }

  return { valid: errors.length === 0, errors };
}

export async function getAll(): Promise<{ data: Entidad[]; error: string | null }> {
  const result = await entidadesRepo.findAll();

  if (result.error) {
    console.error('Error fetching entidades:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getActive(): Promise<{ data: Entidad[]; error: string | null }> {
  const result = await entidadesRepo.findActive();

  if (result.error) {
    console.error('Error fetching active entidades:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getProveedores(): Promise<{ data: Entidad[]; error: string | null }> {
  const result = await entidadesRepo.findProveedores();

  if (result.error) {
    console.error('Error fetching proveedores:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getClientes(): Promise<{ data: Entidad[]; error: string | null }> {
  const result = await entidadesRepo.findClientes();

  if (result.error) {
    console.error('Error fetching clientes:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: Entidad | null; error: string | null }> {
  const result = await entidadesRepo.findById(id);

  if (result.error) {
    console.error('Error fetching entidad:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function create(input: CreateEntidadInput): Promise<{ data: Entidad | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const existingResult = await entidadesRepo.findByCuit(input.cuit);
  if (existingResult.data) {
    return { data: null, error: 'Ya existe una entidad con ese CUIT' };
  }

  const entidadInsert = mapToDBInsert(input);
  const result = await entidadesRepo.create(entidadInsert);

  if (result.error || !result.data) {
    console.error('Error creating entidad:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear la entidad' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function update(input: UpdateEntidadInput): Promise<{ data: Entidad | null; error: string | null }> {
  const { id, ...fields } = input;

  const updateData: Record<string, unknown> = {};
  if (fields.razonSocial !== undefined) updateData.razon_social = fields.razonSocial;
  if (fields.nombreFantasia !== undefined) updateData.nombre_fantasia = fields.nombreFantasia;
  if (fields.empresa !== undefined) updateData.empresa = fields.empresa;
  if (fields.cuit !== undefined) updateData.cuit = fields.cuit;
  if (fields.tipoEntidad !== undefined) updateData.tipo_entidad = fields.tipoEntidad;
  if (fields.condicionIva !== undefined) updateData.condicion_iva = fields.condicionIva;
  if (fields.direccion !== undefined) updateData.direccion = fields.direccion;
  if (fields.localidad !== undefined) updateData.localidad = fields.localidad;
  if (fields.provincia !== undefined) updateData.provincia = fields.provincia;
  if (fields.email !== undefined) updateData.email = fields.email;
  if (fields.telefono !== undefined) updateData.telefono = fields.telefono;
  if (fields.activo !== undefined) updateData.activo = fields.activo;

  const result = await entidadesRepo.update(id, updateData);

  if (result.error || !result.data) {
    console.error('Error updating entidad:', result.error);
    return { data: null, error: result.error?.message || 'Error al actualizar la entidad' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await entidadesRepo.remove(id);

  if (result.error) {
    console.error('Error deleting entidad:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

export async function search(term: string, tipoEntidad?: 'proveedor' | 'cliente'): Promise<{ data: Entidad[]; error: string | null }> {
  const result = await entidadesRepo.search(term, tipoEntidad);

  if (result.error) {
    console.error('Error searching entidades:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}
