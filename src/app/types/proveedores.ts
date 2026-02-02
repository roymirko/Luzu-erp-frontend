/**
 * LEGACY - Re-exports from entidades for backward compatibility
 * New code should import from './entidades' directly
 */

import type { Entidad, CreateEntidadInput, UpdateEntidadInput, EntidadValidationError, EntidadValidationResult } from './entidades';

// Re-export Entidad as Proveedor for backward compatibility
export interface Proveedor {
  id: string;
  razonSocial: string;
  empresa: string | null;
  cuit: string;
  direccion: string | null;
  activo: boolean;
  createdAt: Date;
  createdBy: string | null;
}

export interface CreateProveedorInput {
  razonSocial: string;
  empresa?: string;
  cuit: string;
  direccion?: string;
  createdBy?: string;
}

export interface UpdateProveedorInput extends Partial<CreateProveedorInput> {
  id: string;
  activo?: boolean;
}

export type ProveedorValidationError = EntidadValidationError;
export type ProveedorValidationResult = EntidadValidationResult;

/**
 * Convert Entidad to legacy Proveedor format
 */
export function entidadToProveedor(entidad: Entidad): Proveedor {
  return {
    id: entidad.id,
    razonSocial: entidad.razonSocial,
    empresa: entidad.empresa ?? null,
    cuit: entidad.cuit,
    direccion: entidad.direccion ?? null,
    activo: entidad.activo,
    createdAt: entidad.createdAt,
    createdBy: entidad.createdBy ?? null,
  };
}

/**
 * Convert legacy CreateProveedorInput to CreateEntidadInput
 */
export function proveedorInputToEntidadInput(input: CreateProveedorInput): CreateEntidadInput {
  return {
    razonSocial: input.razonSocial,
    empresa: input.empresa,
    cuit: input.cuit,
    direccion: input.direccion,
    tipoEntidad: 'proveedor',
    createdBy: input.createdBy,
  };
}
