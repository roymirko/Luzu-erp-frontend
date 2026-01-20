import type { Gasto, EstadoGasto, GastoValidationError, GastoValidationResult } from './gastos';

export type { EstadoGasto as EstadoGastoProgramacion };

/**
 * Formulario de programación (header que agrupa gastos)
 * Representa un registro en `programacion_formularios`
 */
export interface ProgramacionFormulario {
  id: string;
  mesGestion: string;
  mesVenta?: string;
  mesInicio?: string;
  unidadNegocio: string;
  categoriaNegocio?: string;
  programa: string;
  ejecutivo?: string;
  subRubroEmpresa?: string;
  detalleCampana?: string;
  estado: EstadoGasto;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/**
 * Contexto de gasto de programación
 * Campos específicos que se guardan en `programacion_gastos`
 */
export interface ProgramacionGastoContext {
  id: string;
  gastoId: string;
  formularioId: string;
  categoria?: string;
  acuerdoPago?: string;
  cliente?: string;
  monto?: number;
  valorImponible?: number;
  bonificacion?: number;
  facturaEmitidaA?: string;
}

/**
 * Vista completa de gasto de programación (para UI)
 * Combina: gasto base + formulario header + contexto específico
 */
export interface GastoProgramacion extends Gasto {
  // Formulario (header) fields
  formularioId: string;
  mesGestion: string;
  mesVenta: string;
  mesInicio: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  programa: string;
  ejecutivo: string;
  subRubroEmpresa: string;
  detalleCampana?: string;
  formularioEstado?: string;
  formularioCreatedAt?: Date;
  // Context fields (programacion_gastos)
  programacionGastoId: string;
  categoria: string;
  acuerdoPago: string;
  cliente: string;
  monto: number;
  valorImponible: number;
  bonificacion: number;
  facturaEmitidaA?: string;
}

/**
 * Input para crear un gasto de programación
 * Incluye campos para las 3 tablas: gastos, programacion_formularios, programacion_gastos
 */
export interface CreateGastoProgramacionInput {
  // Formulario (header)
  mesGestion: string;
  mesVenta?: string;
  mesInicio?: string;
  unidadNegocio: string;
  categoriaNegocio?: string;
  programa: string;
  ejecutivo?: string;
  subRubroEmpresa?: string;
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
  // Context específico
  categoria?: string;
  acuerdoPago?: string;
  cliente?: string;
  monto?: number;
  valorImponible?: number;
  bonificacion?: number;
  facturaEmitidaA?: string;
  // Audit
  createdBy?: string;
}

/**
 * Input para actualizar un gasto de programación
 */
export interface UpdateGastoProgramacionInput extends Partial<CreateGastoProgramacionInput> {
  id: string; // ID del gasto base
  estado?: EstadoGasto;
}

export type { GastoValidationError as GastoProgramacionValidationError };
export type { GastoValidationResult as GastoProgramacionValidationResult };

/**
 * Vista agrupada de formulario para la tabla de Programación
 * Agrupa datos de un formulario con info agregada de sus gastos
 */
export interface FormularioAgrupado {
  id: string; // formularioId
  estado: EstadoGasto;
  createdAt: Date;
  ejecutivo: string;
  facturaEmitidaA?: string;
  empresa?: string;
  unidadNegocio: string;
  subRubroEmpresa?: string;
  detalleCampana?: string;
  proveedor?: string;
  razonSocial?: string;
  netoTotal: number;
  gastosCount: number;
}
