export type EstadoGasto = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPago = 'pendiente-pago' | 'pagado' | 'anulado';

export interface GastoImplementacion {
  id: string;
  fechaRegistro: string;
  estadoGasto: EstadoGasto;
  idFormularioComercial?: string;
  itemOrdenPublicidadId?: string;
  facturaEmitidaA: string;
  empresa: string;
  conceptoGasto: string;
  observaciones: string;
  items: ItemGastoImplementacion[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  ordenPublicidad?: string;
  responsable?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  nombreCampana?: string;
}

export interface ItemGastoImplementacion {
  id: string;
  empresaPgm: string;
  fechaComprobante: string;
  proveedor: string;
  razonSocial: string;
  condicionPago: string;
  neto: number;
  iva: number;
  importeTotal: number;
  estadoPago: EstadoPago;
  adjuntos?: string[];
}

export interface CreateGastoImplementacionInput {
  fechaRegistro: string;
  idFormularioComercial?: string;
  itemOrdenPublicidadId?: string;
  facturaEmitidaA: string;
  empresa: string;
  conceptoGasto: string;
  observaciones?: string;
  items: CreateItemGastoInput[];
  createdBy?: string;
}

export interface CreateItemGastoInput {
  empresaPgm: string;
  fechaComprobante: string;
  proveedor: string;
  razonSocial: string;
  condicionPago: string;
  neto: number;
}

export interface UpdateGastoImplementacionInput extends Partial<CreateGastoImplementacionInput> {
  id: string;
  estadoGasto?: EstadoGasto;
}

export interface GastoValidationError {
  field: string;
  message: string;
}

export interface GastoValidationResult {
  valid: boolean;
  errors: GastoValidationError[];
}

export interface GastoConOrdenPublicidad extends GastoImplementacion {
  ordenPublicidad: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  nombreCampana: string;
  acuerdoPago: string;
  presupuesto: number;
  programasDisponibles: string[];
  responsable: string;
}
