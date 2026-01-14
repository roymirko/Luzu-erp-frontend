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

export interface ProveedorValidationError {
  field: string;
  message: string;
}

export interface ProveedorValidationResult {
  valid: boolean;
  errors: ProveedorValidationError[];
}
