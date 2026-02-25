/**
 * Tipos para Comprobantes (ingresos + egresos)
 */

export type TipoMovimiento = 'ingreso' | 'egreso';

export type TipoComprobante =
  | 'FA' | 'FB' | 'FC' | 'FE'     // Facturas A, B, C, E
  | 'NCA' | 'NCB' | 'NCC'        // Notas de crédito
  | 'NDA' | 'NDB' | 'NDC'        // Notas de débito
  | 'REC' | 'TKT' | 'OTR';       // Recibo, Ticket, Otro

export type EstadoComprobante = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPago = 'creado' | 'aprobado' | 'requiere_info' | 'rechazado' | 'pagado';
export type Moneda = 'ARS' | 'USD';
export type TipoGasto = 'implementacion' | 'programacion' | 'experience';
export type FormaPago = 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta' | 'otro';
export type CondicionIva =
  | 'responsable_inscripto'
  | 'monotributista'
  | 'exento'
  | 'consumidor_final'
  | 'no_responsable';

export const CONDICION_IVA_LABELS: Record<CondicionIva, string> = {
  responsable_inscripto: 'Responsable Inscripto',
  monotributista: 'Monotributista',
  exento: 'Exento',
  consumidor_final: 'Consumidor Final',
  no_responsable: 'No Responsable',
};

export const FORMA_PAGO_LABELS: Record<FormaPago, string> = {
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
};

/**
 * Comprobante base - represents a row in `comprobantes` table
 */
export interface Comprobante {
  id: string;
  tipoMovimiento: TipoMovimiento;
  entidadId?: string;
  entidadNombre: string;
  entidadCuit?: string;
  tipoComprobante?: TipoComprobante;
  puntoVenta?: string;
  numeroComprobante?: string;
  fechaComprobante?: Date;
  cae?: string;
  fechaVencimientoCae?: Date;
  moneda: Moneda;
  neto: number;
  ivaAlicuota: number;
  ivaMonto: number;
  percepciones: number;
  total: number;
  empresa?: string;
  concepto?: string;
  observaciones?: string;
  estado: EstadoComprobante;
  estadoPago: EstadoPago;
  formaPago?: FormaPago;
  cotizacion?: number;
  banco?: string;
  numeroOperacion?: string;
  fechaPago?: Date;
  condicionIva?: CondicionIva;
  comprobantePago?: string;
  ingresosBrutos?: number;
  retencionGanancias?: number;
  fechaEstimadaPago?: Date;
  notaAdmin?: string;
  retencionIva?: number;
  retencionSuss?: number;
  fechaVencimiento?: Date;
  fechaIngresoCheque?: Date;
  certificacionEnviadaFecha?: Date;
  portal?: string;
  contacto?: string;
  fechaEnvio?: Date;
  ordenPublicidadIdIngreso?: string;
  facturaEmitidaA?: string;
  acuerdoPago?: string;
  // Flattened context columns
  areaOrigen?: string;
  contextoComprobanteId?: string;
  ordenPublicidadId?: string;
  itemOrdenPublicidadId?: string;
  sector?: string;
  rubroContexto?: string;
  subRubroContexto?: string;
  condicionPago?: string;
  adjuntos?: unknown;
  nombreCampana?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  categoria?: string;
  cliente?: string;
  montoProg?: number;
  valorImponible?: number;
  bonificacion?: number;
  empresaPrograma?: string;
  pais?: string;
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
  formaPago?: FormaPago;
  cotizacion?: number;
  banco?: string;
  numeroOperacion?: string;
  fechaPago?: Date;
  condicionIva?: CondicionIva;
  comprobantePago?: string;
  ingresosBrutos?: number;
  retencionGanancias?: number;
  fechaEstimadaPago?: Date;
  notaAdmin?: string;
  retencionIva?: number;
  retencionSuss?: number;
  fechaVencimiento?: Date;
  fechaIngresoCheque?: Date;
  certificacionEnviadaFecha?: Date;
  portal?: string;
  contacto?: string;
  fechaEnvio?: Date;
  ordenPublicidadIdIngreso?: string;
  facturaEmitidaA?: string;
  acuerdoPago?: string;
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

export type AreaOrigen = 'implementacion' | 'programacion' | 'experience' | 'tecnica' | 'talentos' | 'productora' | 'directo';

/**
 * Comprobante with context — from comprobantes_full view (simplified)
 * Context is now flattened on comprobantes + joined ctx_* and op_* from view.
 */
export interface ComprobanteWithContext extends Comprobante {
  // View joined fields from contexto_comprobante
  ctxMesGestion?: string;
  ctxDetalleCampana?: string;
  ctxPrograma?: string;
  ctxEjecutivo?: string;
  ctxMesVenta?: string;
  ctxMesInicio?: string;
  ctxNombreCampana?: string;
  ctxUnidadNegocio?: string;
  ctxCategoriaNegocio?: string;
  ctxRubro?: string;
  ctxSubRubro?: string;
  ctxEstado?: string;
  // View joined fields from ordenes_publicidad (egresos)
  opNumeroOrden?: string;
  opResponsable?: string;
  opUnidadNegocio?: string;
  opCategoriaNegocio?: string;
  opNombreCampana?: string;
  opRazonSocial?: string;
  opMarca?: string;
  opMesServicio?: string;
  opAcuerdoPago?: string;
  // View joined fields from ordenes_publicidad (ingresos)
  ingresoOpId?: string;
  ingresoOpNumero?: string;
  ingresoOpResponsable?: string;
  ingresoOpUnidadNegocio?: string;
  ingresoOpNombreCampana?: string;
  ingresoOpMarca?: string;
  ingresoOpRazonSocial?: string;
  ingresoOpImporte?: string;
  ingresoOpAcuerdoPago?: string;
  ingresoOpMesServicio?: string;
  // Entidad resolved
  entidadCuitEfectivo?: string;
  entidadCondicionIva?: string;
}

/**
 * Error de validación
 */
export interface ComprobanteValidationError {
  field: string;
  message: string;
}

export interface ComprobanteValidationResult {
  valid: boolean;
  errors: ComprobanteValidationError[];
}

/**
 * Calcula neto e IVA a partir del total (bruto)
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

export const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimiento, string> = {
  ingreso: 'Ingreso',
  egreso: 'Egreso',
};

export const AREA_ORIGEN_LABELS: Record<AreaOrigen, string> = {
  implementacion: 'Implementación',
  tecnica: 'Técnica',
  talentos: 'Talentos',
  programacion: 'Programación',
  experience: 'Experience',
  productora: 'Productora',
  directo: 'Directo',
};

export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  creado: 'Creado',
  aprobado: 'Aprobado',
  requiere_info: 'Requiere Info',
  rechazado: 'Rechazado',
  pagado: 'Pagado',
};

export function isComprobanteLocked(estadoPago: EstadoPago): boolean {
  return estadoPago === 'aprobado' || estadoPago === 'rechazado' || estadoPago === 'pagado';
}

// Keep ComprobanteFull as alias for backward compat
export type ComprobanteFull = ComprobanteWithContext;
