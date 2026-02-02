/**
 * Tipos para Entidades (proveedores + clientes)
 * Reemplaza el sistema anterior de solo proveedores
 */

export type TipoEntidad = 'proveedor' | 'cliente' | 'ambos';

export type CondicionIva =
  | 'responsable_inscripto'
  | 'monotributista'
  | 'exento'
  | 'consumidor_final'
  | 'no_responsable';

export interface Entidad {
  id: string;
  razonSocial: string;
  nombreFantasia?: string;
  cuit: string;
  tipoEntidad: TipoEntidad;
  condicionIva: CondicionIva;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateEntidadInput {
  razonSocial: string;
  nombreFantasia?: string;
  cuit: string;
  tipoEntidad?: TipoEntidad;
  condicionIva?: CondicionIva;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  createdBy?: string;
}

export interface UpdateEntidadInput extends Partial<CreateEntidadInput> {
  id: string;
  activo?: boolean;
}

export interface EntidadValidationError {
  field: string;
  message: string;
}

export interface EntidadValidationResult {
  valid: boolean;
  errors: EntidadValidationError[];
}

/**
 * Valida los campos de una entidad
 */
export function validateEntidad(input: CreateEntidadInput): EntidadValidationResult {
  const errors: EntidadValidationError[] = [];

  if (!input.razonSocial?.trim()) {
    errors.push({ field: 'razonSocial', message: 'Razón social es requerida' });
  }
  if (!input.cuit?.trim()) {
    errors.push({ field: 'cuit', message: 'CUIT es requerido' });
  } else if (!/^\d{11}$/.test(input.cuit.replace(/-/g, ''))) {
    errors.push({ field: 'cuit', message: 'CUIT debe tener 11 dígitos' });
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push({ field: 'email', message: 'Email inválido' });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Labels para condiciones de IVA
 */
export const CONDICION_IVA_LABELS: Record<CondicionIva, string> = {
  responsable_inscripto: 'Responsable Inscripto',
  monotributista: 'Monotributista',
  exento: 'Exento',
  consumidor_final: 'Consumidor Final',
  no_responsable: 'No Responsable',
};

/**
 * Labels para tipos de entidad
 */
export const TIPO_ENTIDAD_LABELS: Record<TipoEntidad, string> = {
  proveedor: 'Proveedor',
  cliente: 'Cliente',
  ambos: 'Proveedor y Cliente',
};
