// Re-export from unified gastos types
export type {
  Gasto as GastoProductora,
  CreateGastoInput as CreateGastoProductoraInput,
  UpdateGastoInput as UpdateGastoProductoraInput,
  EstadoGasto as EstadoGastoProductora,
  EstadoPago,
  GastoValidationError as GastoProductoraValidationError,
  GastoValidationResult as GastoProductoraValidationResult,
} from './gastos';

export type EstadoFormularioProductora = 'activo' | 'cerrado' | 'anulado';

export interface FormularioProductoraAgrupado {
  id: string;
  estado: string;
  createdAt: Date;
  createdBy?: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  rubro: string;
  subRubro: string;
  nombreCampana: string;
  detalleCampana?: string;
  proveedor?: string;
  razonSocial?: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  netoTotal: number;
  gastosCount: number;
}

export interface GastoProductoraItemInput {
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

export interface CreateMultipleGastosProductoraInput {
  mesGestion?: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  rubro: string;
  subRubro: string;
  nombreCampana: string;
  detalleCampana?: string;
  createdBy?: string;
  gastos: GastoProductoraItemInput[];
}
