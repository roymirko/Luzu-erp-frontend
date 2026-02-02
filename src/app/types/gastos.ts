/**
 * LEGACY - Re-exports from comprobantes for backward compatibility
 * New code should import from './comprobantes' directly
 *
 * gastos = comprobantes where tipo_movimiento = 'egreso'
 */

import type {
  Comprobante,
  ComprobanteFull,
  CreateComprobanteInput,
  UpdateComprobanteInput,
  ComprobanteValidationError,
  ComprobanteValidationResult,
  EstadoPago as ComprobanteEstadoPago,
  EstadoComprobante,
  Moneda as ComprobanteMoneda,
  TipoGasto as ComprobanteTipoGasto,
} from './comprobantes';

// Re-export types with legacy names
export type EstadoGasto = EstadoComprobante;
export type EstadoPago = ComprobanteEstadoPago;
export type TipoGasto = ComprobanteTipoGasto;
export type Moneda = ComprobanteMoneda;

/**
 * Gasto base - legacy interface mapping to Comprobante
 * Maps old field names to new Comprobante structure
 */
export interface Gasto {
  id: string;
  // Proveedor/Factura (legacy names)
  proveedor: string;
  razonSocial?: string;
  tipoFactura?: string;
  numeroFactura?: string;
  fechaFactura?: Date;
  // Importes
  moneda: Moneda;
  neto: number;
  iva: number;
  importeTotal: number;
  // Concepto
  empresa?: string;
  conceptoGasto?: string;
  observaciones?: string;
  // Estado
  estado: EstadoGasto;
  estadoPago: EstadoPago;
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/**
 * Input para crear un gasto base (legacy)
 */
export interface CreateGastoInput {
  proveedor: string;
  razonSocial?: string;
  tipoFactura?: string;
  numeroFactura?: string;
  fechaFactura?: Date;
  moneda?: Moneda;
  neto: number;
  iva?: number;
  importeTotal?: number;
  empresa?: string;
  conceptoGasto?: string;
  observaciones?: string;
  createdBy?: string;
}

/**
 * Input para actualizar un gasto base (legacy)
 */
export interface UpdateGastoInput extends Partial<CreateGastoInput> {
  id: string;
  estado?: EstadoGasto;
  estadoPago?: EstadoPago;
}

/**
 * Vista unificada de gastos (legacy)
 */
export interface GastoFull extends Gasto {
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

export type GastoValidationError = ComprobanteValidationError;
export type GastoValidationResult = ComprobanteValidationResult;

/**
 * Convert Comprobante to legacy Gasto format
 */
export function comprobanteToGasto(comprobante: Comprobante): Gasto {
  return {
    id: comprobante.id,
    proveedor: comprobante.entidadNombre,
    razonSocial: comprobante.entidadNombre,
    tipoFactura: comprobante.tipoComprobante,
    numeroFactura: comprobante.puntoVenta && comprobante.numeroComprobante
      ? `${comprobante.puntoVenta}-${comprobante.numeroComprobante}`
      : comprobante.numeroComprobante,
    fechaFactura: comprobante.fechaComprobante,
    moneda: comprobante.moneda,
    neto: comprobante.neto,
    iva: comprobante.ivaAlicuota,
    importeTotal: comprobante.total,
    empresa: comprobante.empresa,
    conceptoGasto: comprobante.concepto,
    observaciones: comprobante.observaciones,
    estado: comprobante.estado,
    estadoPago: comprobante.estadoPago,
    createdAt: comprobante.createdAt,
    updatedAt: comprobante.updatedAt,
    createdBy: comprobante.createdBy,
  };
}

/**
 * Convert legacy CreateGastoInput to CreateComprobanteInput
 */
export function gastoInputToComprobanteInput(input: CreateGastoInput): CreateComprobanteInput {
  // Parse numero_factura if it contains punto_venta
  let puntoVenta: string | undefined;
  let numeroComprobante: string | undefined;
  if (input.numeroFactura?.includes('-')) {
    const parts = input.numeroFactura.split('-');
    puntoVenta = parts[0];
    numeroComprobante = parts[1];
  } else {
    numeroComprobante = input.numeroFactura;
  }

  return {
    tipoMovimiento: 'egreso',
    entidadNombre: input.proveedor,
    tipoComprobante: input.tipoFactura as any,
    puntoVenta,
    numeroComprobante,
    fechaComprobante: input.fechaFactura,
    moneda: input.moneda,
    neto: input.neto,
    ivaAlicuota: input.iva,
    empresa: input.empresa,
    concepto: input.conceptoGasto,
    observaciones: input.observaciones,
    createdBy: input.createdBy,
  };
}

/**
 * Calcula el importe total a partir del neto e IVA
 */
export function calcularImporteTotal(neto: number, iva: number = 21): number {
  return neto * (1 + iva / 100);
}

/**
 * Valida los campos base de un gasto
 */
export function validateGastoBase(input: CreateGastoInput): GastoValidationResult {
  const errors: GastoValidationError[] = [];

  if (!input.proveedor?.trim()) {
    errors.push({ field: 'proveedor', message: 'Debe seleccionar un proveedor' });
  }
  if (!input.neto || input.neto <= 0) {
    errors.push({ field: 'neto', message: 'Debe ingresar un importe neto válido' });
  }

  return { valid: errors.length === 0, errors };
}
