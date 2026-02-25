// Re-export from unified gastos types
import type { Gasto } from './gastos';

export type {
  Gasto as GastoProgramacion,
  CreateGastoInput as CreateGastoProgramacionInput,
  UpdateGastoInput as UpdateGastoProgramacionInput,
  EstadoGasto as EstadoGastoProgramacion,
  EstadoPago,
  GastoValidationError as GastoProgramacionValidationError,
  GastoValidationResult as GastoProgramacionValidationResult,
} from './gastos';

export type EstadoFormularioProgramacion = 'activo' | 'cerrado' | 'anulado';

export interface FormularioAgrupado {
  id: string;
  estado: string;
  createdAt: Date;
  ejecutivo: string;
  programa?: string;
  facturaEmitidaA?: string;
  empresa?: string;
  unidadNegocio: string;
  subRubroEmpresa?: string;
  detalleCampana?: string;
  proveedor?: string;
  razonSocial?: string;
  netoTotal: number;
  gastosCount: number;
}

export interface ProgramacionFormulario {
  id: string;
  mesGestion: string;
  mesVenta?: string;
  mesInicio?: string;
  unidadNegocio: string;
  categoriaNegocio?: string;
  programa: string;
  ejecutivo?: string;
  subRubroEmpresa?: string;
  detalleCampana?: string;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
