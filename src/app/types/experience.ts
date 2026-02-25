// Re-export from unified gastos types
export type {
  Gasto as GastoExperience,
  CreateGastoInput as CreateGastoExperienceInput,
  UpdateGastoInput as UpdateGastoExperienceInput,
  EstadoGasto as EstadoGastoExperience,
  EstadoPago,
  GastoValidationError as GastoExperienceValidationError,
  GastoValidationResult as GastoExperienceValidationResult,
} from './gastos';

export type EstadoFormularioExperience = 'activo' | 'cerrado' | 'anulado';

export interface FormularioExperienceAgrupado {
  id: string;
  estado: string;
  createdAt: Date;
  createdBy?: string;
  nombreCampana: string;
  detalleCampana?: string;
  subrubro: string;
  proveedor?: string;
  razonSocial?: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  netoTotal: number;
  gastosCount: number;
}

export interface GastoExperienceItemInput {
  proveedor: string;
  razonSocial: string;
  neto: number;
  iva?: number;
  empresa?: string;
  observaciones?: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  acuerdoPago?: string;
  formaPago?: string;
  pais?: string;
}

export interface CreateMultipleGastosExperienceInput {
  mesGestion?: string;
  nombreCampana: string;
  detalleCampana?: string;
  subrubro?: string;
  createdBy?: string;
  gastos: GastoExperienceItemInput[];
}
