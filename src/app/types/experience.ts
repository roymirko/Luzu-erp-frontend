import type { Gasto, EstadoGasto, GastoValidationError, GastoValidationResult, EstadoPago } from './gastos';

export type { EstadoGasto as EstadoGastoExperience };
export type { EstadoPago };

export type EstadoFormularioExperience = 'activo' | 'cerrado' | 'anulado';

/**
 * Formulario de Experience (header que agrupa gastos)
 * Representa un registro en `experience_formularios`
 */
export interface ExperienceFormulario {
  id: string;
  mesGestion: string;
  nombreCampana: string;
  detalleCampana?: string;
  estado: EstadoFormularioExperience;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/**
 * Contexto de gasto de Experience
 * Campos específicos que se guardan en `experience_gastos`
 */
export interface ExperienceGastoContext {
  id: string;
  gastoId: string;
  formularioId: string;
  facturaEmitidaA?: string;
  empresa?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  acuerdoPago?: string;
  formaPago?: string;
  pais?: string;
}

/**
 * Vista completa de gasto de Experience (para UI)
 * Combina: gasto base + formulario header + contexto específico
 */
export interface GastoExperience extends Gasto {
  // Formulario (header) fields
  formularioId: string;
  mesGestion: string;
  nombreCampana: string;
  detalleCampana?: string;
  rubro?: string;
  subrubro?: string;
  formularioEstado?: EstadoFormularioExperience;
  formularioCreatedAt?: Date;
  formularioCreatedBy?: string;
  // Context fields (experience_gastos)
  experienceGastoId: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  empresaPrograma?: string;
  fechaComprobante?: string;
  acuerdoPago?: string;
  formaPago?: string;
  pais?: string;
}

/**
 * Input para crear un gasto de Experience
 * Incluye campos para las 3 tablas: gastos, experience_formularios, experience_gastos
 */
export interface CreateGastoExperienceInput {
  // Formulario (header)
  mesGestion?: string;
  nombreCampana: string;
  detalleCampana?: string;
  subrubro?: string;
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

/**
 * Input para actualizar un gasto de Experience
 */
export interface UpdateGastoExperienceInput extends Partial<CreateGastoExperienceInput> {
  id: string; // ID del gasto base
  estado?: EstadoGasto;
}

export type { GastoValidationError as GastoExperienceValidationError };
export type { GastoValidationResult as GastoExperienceValidationResult };

/**
 * Vista agrupada de formulario para la tabla de Experience
 * Agrupa datos de un formulario con info agregada de sus gastos
 */
export interface FormularioExperienceAgrupado {
  id: string; // formularioId
  estado: EstadoFormularioExperience;
  createdAt: Date;
  createdBy?: string;
  nombreCampana: string;
  detalleCampana?: string;
  subrubro?: string;
  proveedor?: string;
  razonSocial?: string;
  facturaEmitidaA?: string;
  empresaContext?: string;
  netoTotal: number;
  gastosCount: number;
}

/**
 * Input para cada gasto individual en una creación múltiple
 */
export interface GastoExperienceItemInput {
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

/**
 * Input para crear múltiples gastos bajo un mismo formulario
 */
export interface CreateMultipleGastosExperienceInput {
  // Formulario (header) fields - shared across all gastos
  mesGestion?: string;
  nombreCampana: string;
  detalleCampana?: string;
  subrubro?: string;
  createdBy?: string;
  // Individual gastos
  gastos: GastoExperienceItemInput[];
}
