/**
 * Unified Gasto type — all areas use the same structure.
 * Context columns are nullable; area_origen discriminates which fields apply.
 */

export type AreaOrigenGasto = 'implementacion' | 'tecnica' | 'talentos' | 'programacion' | 'experience' | 'productora' | 'directo';
export type EstadoGasto = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPago = 'creado' | 'aprobado' | 'requiere_info' | 'rechazado' | 'pagado';

export interface Gasto {
  id: string;
  areaOrigen: AreaOrigenGasto;
  // Core comprobante fields
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
  // Consolidated fields (on comprobantes)
  facturaEmitidaA?: string;
  acuerdoPago?: string;
  formaPago?: string;
  fechaPago?: string;
  // OP-linked context (impl/tec/talentos)
  ordenPublicidadId?: string;
  itemOrdenPublicidadId?: string;
  sector?: string;
  rubro?: string;
  subRubro?: string;
  condicionPago?: string;
  adjuntos?: unknown;
  nombreCampana?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  // Formulario-linked context (prog/exp/prod)
  contextoComprobanteId?: string;
  categoria?: string;
  cliente?: string;
  montoProg?: number;
  valorImponible?: number;
  bonificacion?: number;
  empresaPrograma?: string;
  pais?: string;
  // Joined from OP (read-only, from view)
  opNumeroOrden?: string;
  opResponsable?: string;
  opUnidadNegocio?: string;
  opCategoriaNegocio?: string;
  opNombreCampana?: string;
  opRazonSocial?: string;
  opMarca?: string;
  opMesServicio?: string;
  opAcuerdoPago?: string;
  // Joined from contexto_comprobante (read-only, from view)
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
  // Backward compat: unprefixed OP field aliases (used by form components)
  ordenPublicidad?: string;
  responsable?: string;
  marca?: string;
  mesServicio?: string;
  // Backward compat: unprefixed formulario field aliases (used by prog/exp/prod components)
  formularioId?: string;
  programa?: string;
  ejecutivo?: string;
  mesGestion?: string;
  mesVenta?: string;
  mesInicio?: string;
  detalleCampana?: string;
  formularioEstado?: string;
  formularioCreatedAt?: Date;
  formularioCreatedBy?: string;
  subrubro?: string;
  subRubroEmpresa?: string;
  empresaContext?: string;
  formularioRubro?: string;
  formularioSubRubro?: string;
}

export interface CreateGastoInput {
  areaOrigen: AreaOrigenGasto;
  // Core
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
  // Consolidated
  facturaEmitidaA?: string;
  acuerdoPago?: string;
  formaPago?: string;
  fechaPago?: string;
  // OP-linked context
  ordenPublicidadId?: string;
  itemOrdenPublicidadId?: string;
  sector?: string;
  rubro?: string;
  subRubro?: string;
  condicionPago?: string;
  adjuntos?: unknown;
  nombreCampana?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  // Formulario-linked context
  contextoComprobanteId?: string;
  categoria?: string;
  cliente?: string;
  montoProg?: number;
  valorImponible?: number;
  bonificacion?: number;
  empresaPrograma?: string;
  pais?: string;
}

export interface UpdateGastoInput extends Partial<CreateGastoInput> {
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

/**
 * Contexto comprobante — unified header for prog/exp/prod
 */
export interface ContextoComprobante {
  id: string;
  areaOrigen: 'programacion' | 'experience' | 'productora';
  mesGestion?: string;
  detalleCampana?: string;
  estado: string;
  nombreCampana?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  // Prog-specific
  mesVenta?: string;
  mesInicio?: string;
  programa?: string;
  ejecutivo?: string;
  // Productora-specific
  rubro?: string;
  subRubro?: string;
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateContextoComprobanteInput {
  areaOrigen: 'programacion' | 'experience' | 'productora';
  mesGestion?: string;
  detalleCampana?: string;
  nombreCampana?: string;
  unidadNegocio?: string;
  categoriaNegocio?: string;
  mesVenta?: string;
  mesInicio?: string;
  programa?: string;
  ejecutivo?: string;
  rubro?: string;
  subRubro?: string;
  createdBy?: string;
}

export interface UpdateContextoComprobanteInput extends Partial<CreateContextoComprobanteInput> {
  id: string;
  estado?: string;
}

// Backward-compat aliases
export type GastoImplementacion = Gasto;
export type GastoTecnica = Gasto;
export type GastoTalentos = Gasto;
export type GastoProgramacion = Gasto;
export type GastoExperience = Gasto;
export type GastoProductora = Gasto;
export type CreateGastoImplementacionInput = CreateGastoInput;
export type UpdateGastoImplementacionInput = UpdateGastoInput;
export type CreateGastoTecnicaInput = CreateGastoInput;
export type UpdateGastoTecnicaInput = UpdateGastoInput;
export type CreateGastoTalentosInput = CreateGastoInput;
export type UpdateGastoTalentosInput = UpdateGastoInput;
export type CreateGastoProgramacionInput = CreateGastoInput;
export type UpdateGastoProgramacionInput = UpdateGastoInput;
export type CreateGastoExperienceInput = CreateGastoInput;
export type UpdateGastoExperienceInput = UpdateGastoInput;
export type CreateGastoProductoraInput = CreateGastoInput;
export type UpdateGastoProductoraInput = UpdateGastoInput;
