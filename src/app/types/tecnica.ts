export type EstadoGasto = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPago = 'creado' | 'aprobado' | 'requiere_info' | 'rechazado' | 'pagado';

export interface GastoTecnica {
  id: string;
  proveedor: string;
  razonSocial: string;
  tipoFactura?: string;
  numeroFactura?: string;
  fechaFactura?: string;
  moneda: string;
  neto: number;
  iva: number;
  importeTotal: number;
  empresa: string;
  conceptoGasto: string;
  observaciones: string;
  estado: EstadoGasto;
  estadoPago: EstadoPago;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  ordenPublicidadId?: string;
  itemOrdenPublicidadId?: string;
  facturaEmitidaA: string;
  sector?: string;
  rubro?: string;
  subRubro?: string;
  condicionPago?: string;
  formaPago?: string;
  fechaPago?: string;
  adjuntos?: string[];
  ordenPublicidad?: string;
  responsable?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  nombreCampana?: string;
  marca?: string;
  mesServicio?: string;
  acuerdoPago?: string;
}

export interface CreateGastoTecnicaInput {
  proveedor: string;
  razonSocial?: string;
  tipoFactura?: string;
  numeroFactura?: string;
  fechaFactura?: string;
  moneda?: string;
  neto: number;
  iva?: number;
  empresa: string;
  conceptoGasto: string;
  observaciones?: string;
  createdBy?: string;
  ordenPublicidadId?: string;
  itemOrdenPublicidadId?: string;
  facturaEmitidaA: string;
  sector?: string;
  rubro?: string;
  subRubro?: string;
  condicionPago?: string;
  formaPago?: string;
  fechaPago?: string;
  adjuntos?: string[];
  unidadNegocio?: string;
  categoriaNegocio?: string;
  nombreCampana?: string;
}

export interface UpdateGastoTecnicaInput extends Partial<CreateGastoTecnicaInput> {
  id: string;
  estado?: EstadoGasto;
  estadoPago?: EstadoPago;
}

export interface GastoValidationError {
  field: string;
  message: string;
}

export interface GastoValidationResult {
  valid: boolean;
  errors: GastoValidationError[];
}
