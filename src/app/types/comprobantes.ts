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
export type EstadoPago = 'pendiente' | 'pagado' | 'pedir_info' | 'anulado';
export type Moneda = 'ARS' | 'USD';
export type TipoGasto = 'implementacion' | 'programacion' | 'experience';
export type FormaPago = 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta' | 'otro';

export const FORMA_PAGO_LABELS: Record<FormaPago, string> = {
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
};

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
  // Pago/Cobro
  formaPago?: FormaPago;
  cotizacion?: number;
  banco?: string;
  numeroOperacion?: string;
  fechaPago?: Date;
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
  neto?: number;
  ivaAlicuota?: number;
  ivaMonto?: number;
  percepciones?: number;
  total: number;
  empresa?: string;
  concepto?: string;
  observaciones?: string;
  // Pago/Cobro
  formaPago?: FormaPago;
  cotizacion?: number;
  banco?: string;
  numeroOperacion?: string;
  fechaPago?: Date;
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
 * Calcula neto e IVA a partir del total (bruto)
 * Usuario ingresa total → IVA = total × alicuota% → Neto = total - IVA - percepciones
 */
export function calcularDesdeTotal(
  total: number,
  ivaAlicuota: number = 21,
  percepciones: number = 0
): { ivaMonto: number; neto: number } {
  const ivaMonto = total * (ivaAlicuota / 100);
  const neto = total - ivaMonto - percepciones;
  return { ivaMonto, neto };
}

/**
 * Valida los campos base de un comprobante
 */
export function validateComprobante(input: CreateComprobanteInput): ComprobanteValidationResult {
  const errors: ComprobanteValidationError[] = [];

  if (!input.entidadNombre?.trim()) {
    errors.push({ field: 'entidadNombre', message: 'Debe seleccionar una entidad' });
  }
  if (input.total === undefined || input.total < 0) {
    errors.push({ field: 'total', message: 'Debe ingresar un importe total válido' });
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

export type AreaOrigen = 'implementacion' | 'programacion' | 'experience' | 'directo';

/**
 * Comprobante con contexto de origen (vista comprobantes_full)
 */
export interface ComprobanteWithContext extends Comprobante {
  areaOrigen: AreaOrigen;
  // Implementacion context
  implementacionComprobanteId?: string;
  ordenPublicidadId?: string;
  sector?: string;
  rubroGasto?: string;
  subRubro?: string;
  implFacturaEmitidaA?: string;
  implNombreCampana?: string;
  implOrdenPublicidad?: string;
  // Programacion context
  programacionComprobanteId?: string;
  programacionFormularioId?: string;
  progPrograma?: string;
  progMesGestion?: string;
  progUnidadNegocio?: string;
  progCategoriaNegocio?: string;
  // Experience context
  experienceComprobanteId?: string;
  experienceFormularioId?: string;
  expNombreCampana?: string;
  expMesGestion?: string;
}

/**
 * Labels para área origen
 */
export const AREA_ORIGEN_LABELS: Record<AreaOrigen, string> = {
  implementacion: 'Implementación',
  programacion: 'Programación',
  experience: 'Experience',
  directo: 'Directo',
};

/**
 * Labels para estado de pago
 */
export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  pedir_info: 'Pedir Info',
  anulado: 'Anulado',
};

/**
 * Determina si un comprobante está bloqueado (no editable)
 */
export function isComprobanteLocked(estadoPago: EstadoPago): boolean {
  return estadoPago === 'pagado' || estadoPago === 'anulado';
}
