/**
 * Tipos base para el sistema unificado de gastos
 * Todos los módulos (implementación, programación, etc.) extienden de estos tipos base
 */

export type EstadoGasto = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPago = 'pendiente' | 'pagado' | 'anulado';
export type TipoGasto = 'implementacion' | 'programacion';
export type Moneda = 'ARS' | 'USD';

/**
 * Gasto base - representa un registro en la tabla `gastos`
 * Es la unidad atómica de gasto en el sistema
 */
export interface Gasto {
  id: string;
  // Proveedor/Factura
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
 * Input para crear un gasto base
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
 * Input para actualizar un gasto base
 */
export interface UpdateGastoInput extends Partial<CreateGastoInput> {
  id: string;
  estado?: EstadoGasto;
  estadoPago?: EstadoPago;
}

/**
 * Vista unificada de gastos (gastos_full view)
 * Incluye datos del gasto + contexto del módulo
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

/**
 * Error de validación
 */
export interface GastoValidationError {
  field: string;
  message: string;
}

/**
 * Resultado de validación
 */
export interface GastoValidationResult {
  valid: boolean;
  errors: GastoValidationError[];
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
