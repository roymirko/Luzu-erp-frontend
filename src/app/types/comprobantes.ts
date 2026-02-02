/**
 * Tipos para Comprobantes (ingresos + egresos)
 * Reemplaza el sistema anterior de solo gastos (egresos)
 */

export type TipoMovimiento = 'ingreso' | 'egreso';

export type TipoComprobante =
  | 'FA' | 'FB' | 'FC' | 'FE'     // Facturas A, B, C, E
  | 'NCA' | 'NCB' | 'NCC'        // Notas de crédito
  | 'NDA' | 'NDB' | 'NDC'        // Notas de débito
  | 'REC' | 'TKT' | 'OTR';       // Recibo, Ticket, Otro

export type EstadoComprobante = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPago = 'pendiente' | 'pagado' | 'anulado';
export type Moneda = 'ARS' | 'USD';
export type TipoGasto = 'implementacion' | 'programacion' | 'experience';

/**
 * Comprobante base - representa un registro en la tabla `comprobantes`
 */
export interface Comprobante {
  id: string;
  // Dirección
  tipoMovimiento: TipoMovimiento;
  // Entidad
  entidadId?: string;
  entidadNombre: string;
  entidadCuit?: string;
  // Factura
  tipoComprobante?: TipoComprobante;
  puntoVenta?: string;
  numeroComprobante?: string;
  fechaComprobante?: Date;
  // AFIP
  cae?: string;
  fechaVencimientoCae?: Date;
  // Montos
  moneda: Moneda;
  neto: number;
  ivaAlicuota: number;
  ivaMonto: number;
  percepciones: number;
  total: number;
  // Concepto
  empresa?: string;
  concepto?: string;
  observaciones?: string;
  // Estado
  estado: EstadoComprobante;
  estadoPago: EstadoPago;
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/**
 * Input para crear un comprobante
 */
export interface CreateComprobanteInput {
  tipoMovimiento?: TipoMovimiento;
  entidadId?: string;
  entidadNombre: string;
  entidadCuit?: string;
  tipoComprobante?: TipoComprobante;
  puntoVenta?: string;
  numeroComprobante?: string;
  fechaComprobante?: Date;
  cae?: string;
  fechaVencimientoCae?: Date;
  moneda?: Moneda;
  neto: number;
  ivaAlicuota?: number;
  ivaMonto?: number;
  percepciones?: number;
  total?: number;
  empresa?: string;
  concepto?: string;
  observaciones?: string;
  createdBy?: string;
}

/**
 * Input para actualizar un comprobante
 */
export interface UpdateComprobanteInput extends Partial<CreateComprobanteInput> {
  id: string;
  estado?: EstadoComprobante;
  estadoPago?: EstadoPago;
}

/**
 * Vista unificada de comprobantes (comprobantes_full view)
 */
export interface ComprobanteFull extends Comprobante {
  tipoGasto: TipoGasto;
  // Implementación fields
  ordenPublicidadId?: string;
  facturaEmitidaA?: string;
  sector?: string;
  rubroGasto?: string;
  subRubro?: string;
  // Programación fields
  mesGestion?: string;
  programa?: string;
  formularioProgramacionId?: string;
  // Common derived
  nombreCampana?: string;
  unidadNegocioEfectiva?: string;
  categoriaNegocioEfectiva?: string;
}

/**
 * Error de validación
 */
export interface ComprobanteValidationError {
  field: string;
  message: string;
}

/**
 * Resultado de validación
 */
export interface ComprobanteValidationResult {
  valid: boolean;
  errors: ComprobanteValidationError[];
}

/**
 * Calcula el total a partir del neto, IVA y percepciones
 */
export function calcularTotal(
  neto: number,
  ivaAlicuota: number = 21,
  percepciones: number = 0
): { ivaMonto: number; total: number } {
  const ivaMonto = neto * (ivaAlicuota / 100);
  const total = neto + ivaMonto + percepciones;
  return { ivaMonto, total };
}

/**
 * Valida los campos base de un comprobante
 */
export function validateComprobante(input: CreateComprobanteInput): ComprobanteValidationResult {
  const errors: ComprobanteValidationError[] = [];

  if (!input.entidadNombre?.trim()) {
    errors.push({ field: 'entidadNombre', message: 'Debe seleccionar una entidad' });
  }
  if (input.neto === undefined || input.neto < 0) {
    errors.push({ field: 'neto', message: 'Debe ingresar un importe neto válido' });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Labels para tipos de comprobante
 */
export const TIPO_COMPROBANTE_LABELS: Record<TipoComprobante, string> = {
  FA: 'Factura A',
  FB: 'Factura B',
  FC: 'Factura C',
  FE: 'Factura E',
  NCA: 'Nota de Crédito A',
  NCB: 'Nota de Crédito B',
  NCC: 'Nota de Crédito C',
  NDA: 'Nota de Débito A',
  NDB: 'Nota de Débito B',
  NDC: 'Nota de Débito C',
  REC: 'Recibo',
  TKT: 'Ticket',
  OTR: 'Otro',
};

/**
 * Labels para tipos de movimiento
 */
export const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimiento, string> = {
  ingreso: 'Ingreso',
  egreso: 'Egreso',
};
