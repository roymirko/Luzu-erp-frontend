export type EstadoGasto = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPago = 'pendiente' | 'pagado' | 'anulado';

/**
 * Domain model for a gasto de implementacion
 * Flattened structure combining gastos (core) + implementacion_gastos (context)
 */
export interface GastoImplementacion {
  // Core gasto fields (from gastos table)
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
  // Implementacion context fields (from implementacion_gastos table)
  ordenPublicidadId?: string;
  itemOrdenPublicidadId?: string;
  facturaEmitidaA: string;
  sector?: string;
  rubroGasto?: string;
  subRubro?: string;
  condicionPago?: string;
  fechaPago?: string;
  adjuntos?: string[];
  // Joined fields from ordenes_publicidad
  ordenPublicidad?: string;
  responsable?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  nombreCampana?: string;
  marca?: string;
  mesServicio?: string;
  acuerdoPago?: string;
}

/**
 * Input for creating a new gasto de implementacion
 */
export interface CreateGastoImplementacionInput {
  // Core gasto fields
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
  // Implementacion context fields
  ordenPublicidadId?: string;
  itemOrdenPublicidadId?: string;
  facturaEmitidaA: string;
  sector?: string;
  rubroGasto?: string;
  subRubro?: string;
  condicionPago?: string;
  fechaPago?: string;
  adjuntos?: string[];
}

/**
 * Input for updating a gasto de implementacion
 */
export interface UpdateGastoImplementacionInput extends Partial<CreateGastoImplementacionInput> {
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
