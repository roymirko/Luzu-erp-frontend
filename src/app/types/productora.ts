import type { Gasto, EstadoGasto, GastoValidationError, GastoValidationResult, EstadoPago } from './gastos';

export type { EstadoGasto as EstadoGastoProductora };
export type { EstadoPago };

export type EstadoFormularioProductora = 'activo' | 'cerrado' | 'anulado';

export interface ProductoraFormulario {
  id: string;
  mesGestion: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  rubro: string;
  subRubro: string;
  nombreCampana: string;
  detalleCampana?: string;
  estado: EstadoFormularioProductora;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface ProductoraGastoContext {
  id: string;
  comprobanteId: string;
  formularioId: string;
  empresa?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  pais?: string;
  rubro?: string;
  subRubro?: string;
}

export interface GastoProductora extends Gasto {
  // Formulario (header) fields
  formularioId: string;
  mesGestion: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  formularioRubro: string;
  formularioSubRubro: string;
  nombreCampana: string;
  detalleCampana?: string;
  formularioEstado?: EstadoFormularioProductora;
  formularioCreatedAt?: Date;
  formularioCreatedBy?: string;
  // Context fields (productora_comprobantes)
  productoraGastoId: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  acuerdoPago?: string;
  formaPago?: string;
  pais?: string;
  contextRubro?: string;
  contextSubRubro?: string;
}

export interface CreateGastoProductoraInput {
  // Formulario (header)
  mesGestion?: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  rubro: string;
  subRubro: string;
  nombreCampana: string;
  detalleCampana?: string;
  // Gasto base
  proveedor: string;
  razonSocial: string;
  tipoFactura?: string;
  numeroFactura?: string;
  fechaFactura?: Date;
  moneda?: 'ARS' | 'USD';
  neto: number;
  iva?: number;
  empresa?: string;
  conceptoGasto?: string;
  observaciones?: string;
  // Context
  facturaEmitidaA?: string;
  empresaContext?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  acuerdoPago?: string;
  formaPago?: string;
  pais?: string;
  // Audit
  createdBy?: string;
}

export interface UpdateGastoProductoraInput extends Partial<CreateGastoProductoraInput> {
  id: string;
  estado?: EstadoGasto;
}

export type { GastoValidationError as GastoProductoraValidationError };
export type { GastoValidationResult as GastoProductoraValidationResult };

export interface FormularioProductoraAgrupado {
  id: string;
  estado: EstadoFormularioProductora;
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
