// Re-export from unified gastos types
export type {
  Gasto as GastoMarketing,
  CreateGastoInput as CreateGastoMarketingInput,
  UpdateGastoInput as UpdateGastoMarketingInput,
  EstadoGasto as EstadoGastoMarketing,
  EstadoPago,
  GastoValidationError as GastoMarketingValidationError,
  GastoValidationResult as GastoMarketingValidationResult,
} from './gastos';

export type EstadoFormularioMarketing = 'activo' | 'cerrado' | 'anulado';

export interface FormularioMarketingAgrupado {
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

export interface GastoMarketingItemInput {
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

export interface CreateMultipleGastosMarketingInput {
  mesGestion?: string;
  nombreCampana: string;
  detalleCampana?: string;
  subrubro?: string;
  createdBy?: string;
  gastos: GastoMarketingItemInput[];
}
