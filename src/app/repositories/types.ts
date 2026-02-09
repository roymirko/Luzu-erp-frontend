export interface OrdenPublicidadRow {
  id: string;
  fecha: string | null;
  mes_servicio: string | null;
  responsable: string | null;
  orden_publicidad: string | null;
  total_venta: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  proyecto: string | null;
  razon_social: string | null;
  categoria: string | null;
  empresa_agencia: string | null;
  marca: string | null;
  nombre_campana: string | null;
  acuerdo_pago: string | null;
  tipo_importe: 'canje' | 'factura' | null;
  observaciones: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  creado_por: string | null;
}

export interface ItemOrdenPublicidadRow {
  id: string;
  orden_publicidad_id: string;
  programa: string | null;
  monto: string | null;
  nc_programa: string | null;
  nc_porcentaje: string | null;
  proveedor_fee: string | null;
  fee_programa: string | null;
  fee_porcentaje: string | null;
  implementacion: string | null;
  talentos: string | null;
  tecnica: string | null;
  fecha_creacion: string;
}

export interface OrdenPublicidadWithItems extends OrdenPublicidadRow {
  items_orden_publicidad: ItemOrdenPublicidadRow[];
}

export interface GastoImplementacionRow {
  id: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_registro: string;
  anio: number;
  mes: number;
  id_formulario_comercial: string;
  estado: string;
  item_orden_publicidad_id: string | null;
  acuerdo_pago: string | null;
  presupuesto: number | null;
  cantidad_programas: number | null;
  programas_disponibles: string[] | null;
  sector: string | null;
  rubro_gasto: string | null;
  sub_rubro: string | null;
  factura_emitida_a: string | null;
  empresa: string | null;
  concepto_gasto: string | null;
  observaciones: string | null;
  creado_por: string | null;
  actualizado_por: string | null;
}

export interface GastoImplementacionFullRow extends GastoImplementacionRow {
  orden_publicidad: string | null;
  responsable: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  nombre_campana: string | null;
  razon_social: string | null;
  marca: string | null;
  empresa_agencia: string | null;
}

export interface ItemGastoImplementacionRow {
  id: string;
  gasto_id: string;
  fecha_creacion: string;
  tipo_proveedor: string;
  proveedor: string;
  razon_social: string | null;
  descripcion: string | null;
  rubro_gasto: string;
  sub_rubro: string | null;
  sector: string;
  moneda: string;
  neto: number;
  iva: number;
  importe_total: number;
  tipo_factura: string | null;
  numero_factura: string | null;
  fecha_factura: string | null;
  condicion_pago: string | null;
  fecha_pago: string | null;
  estado_pago: string;
  adjuntos: string[] | null;
}

export interface GastoImplementacionWithItems extends GastoImplementacionFullRow {
  items_gasto_implementacion: ItemGastoImplementacionRow[];
}

export interface ProveedorRow {
  id: string;
  razon_social: string;
  cuit: string;
  direccion: string | null;
  empresa: string | null;
  activo: boolean;
  fecha_creacion: string;
  creado_por: string | null;
}

export interface RepositoryResult<T> {
  data: T | null;
  error: RepositoryError | null;
}

export interface RepositoryListResult<T> {
  data: T[];
  error: RepositoryError | null;
}

export interface RepositoryError {
  code: string;
  message: string;
  details?: string;
}

export type OrdenPublicidadInsert = Omit<OrdenPublicidadRow, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type OrdenPublicidadUpdate = Partial<Omit<OrdenPublicidadRow, 'id' | 'fecha_creacion'>>;

export type ItemOrdenPublicidadInsert = Omit<ItemOrdenPublicidadRow, 'id' | 'fecha_creacion'>;

export type GastoImplementacionInsert = Omit<GastoImplementacionRow, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type GastoImplementacionUpdate = Partial<Omit<GastoImplementacionRow, 'id' | 'fecha_creacion'>>;

export type ItemGastoImplementacionInsert = Omit<ItemGastoImplementacionRow, 'id' | 'fecha_creacion'>;

export type ProveedorInsert = Omit<ProveedorRow, 'id' | 'fecha_creacion'>;
export type ProveedorUpdate = Partial<Omit<ProveedorRow, 'id' | 'fecha_creacion'>>;

// ============================================
// Arquitectura Unificada de Gastos
// ============================================

// Tabla gastos (core - normalizada)
export interface GastoRow {
  id: string;
  proveedor: string;
  razon_social: string | null;
  tipo_factura: string | null;
  numero_factura: string | null;
  fecha_factura: string | null;
  moneda: string;
  neto: number;
  iva: number;
  importe_total: number;
  empresa: string | null;
  concepto_gasto: string | null;
  observaciones: string | null;
  estado: string;
  estado_pago: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type GastoInsert = Omit<GastoRow, 'id' | 'created_at' | 'updated_at'>;
export type GastoUpdate = Partial<Omit<GastoRow, 'id' | 'created_at'>>;

// Tabla programacion_formularios (header)
export interface ProgramacionFormularioRow {
  id: string;
  mes_gestion: string | null;
  mes_venta: string | null;
  mes_inicio: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  programa: string | null;
  ejecutivo: string | null;
  sub_rubro_empresa: string | null;
  detalle_campana: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ProgramacionFormularioInsert = Omit<ProgramacionFormularioRow, 'id' | 'created_at' | 'updated_at'>;
export type ProgramacionFormularioUpdate = Partial<Omit<ProgramacionFormularioRow, 'id' | 'created_at'>>;

// Tabla programacion_gastos (contexto)
export interface ProgramacionGastoRow {
  id: string;
  gasto_id: string;
  formulario_id: string;
  categoria: string | null;
  cliente: string | null;
  monto: number | null;
  valor_imponible: number | null;
  bonificacion: number | null;
}

export type ProgramacionGastoInsert = Omit<ProgramacionGastoRow, 'id'>;
export type ProgramacionGastoUpdate = Partial<Omit<ProgramacionGastoRow, 'id' | 'gasto_id' | 'formulario_id'>>;

// Vista programacion_gastos_full (para queries)
export interface ProgramacionGastoFullRow {
  // Gasto fields
  id: string;
  proveedor: string;
  razon_social: string | null;
  tipo_factura: string | null;
  numero_factura: string | null;
  fecha_factura: string | null;
  moneda: string;
  neto: number;
  iva: number;
  importe_total: number;
  empresa: string | null;
  concepto_gasto: string | null;
  observaciones: string | null;
  estado: string;
  estado_pago: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Formulario fields
  formulario_id: string;
  mes_gestion: string | null;
  mes_venta: string | null;
  mes_inicio: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  programa: string | null;
  ejecutivo: string | null;
  sub_rubro_empresa: string | null;
  detalle_campana: string | null;
  formulario_estado: string | null;
  formulario_created_at: string | null;
  // Context fields
  programacion_gasto_id: string;
  categoria: string | null;
  acuerdo_pago: string | null;
  cliente: string | null;
  monto: number | null;
  valor_imponible: number | null;
  bonificacion: number | null;
  factura_emitida_a: string | null;
  forma_pago: string | null;
}

// Tabla implementacion_gastos (contexto implementación)
export interface ImplementacionGastoRow {
  id: string;
  gasto_id: string;
  orden_publicidad_id: string | null;
  item_orden_publicidad_id: string | null;
  sector: string | null;
  rubro_gasto: string | null;
  sub_rubro: string | null;
  condicion_pago: string | null;
  adjuntos: unknown | null;
}

export type ImplementacionGastoInsert = Omit<ImplementacionGastoRow, 'id'>;
export type ImplementacionGastoUpdate = Partial<Omit<ImplementacionGastoRow, 'id' | 'gasto_id'>>;

// Vista implementacion_gastos_full (para queries)
export interface ImplementacionGastoFullRow {
  // Gasto fields (from gastos table)
  id: string;
  proveedor: string;
  razon_social: string | null;
  tipo_factura: string | null;
  numero_factura: string | null;
  fecha_factura: string | null;
  moneda: string;
  neto: number;
  iva: number;
  importe_total: number;
  empresa: string | null;
  concepto_gasto: string | null;
  observaciones: string | null;
  estado: string;
  estado_pago: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Contexto implementacion (from implementacion_gastos table)
  implementacion_gasto_id: string;
  orden_publicidad_id: string | null;
  item_orden_publicidad_id: string | null;
  factura_emitida_a: string | null;
  sector: string | null;
  rubro_gasto: string | null;
  sub_rubro: string | null;
  condicion_pago: string | null;
  forma_pago: string | null;
  fecha_pago: string | null;
  adjuntos: unknown | null;
  // Joined from ordenes_publicidad
  orden_publicidad: string | null;
  responsable: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  nombre_campana: string | null;
  orden_razon_social: string | null;
  marca: string | null;
  mes_servicio: string | null;
  orden_acuerdo_pago: string | null;
}

// ============================================
// LEGACY: Gastos Programacion (deprecated - mantener para migración)
// ============================================
export interface GastoProgramacionRow {
  id: string;
  mes_gestion: string | null;
  mes_venta: string | null;
  mes_inicio: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  programa: string | null;
  ejecutivo: string | null;
  proveedor: string | null;
  razon_social: string | null;
  categoria: string | null;
  monto: number | null;
  sub_rubro_empresa: string | null;
  acuerdo_pago: string | null;
  cliente: string | null;
  empresa: string | null;
  neto: number | null;
  iva: number | null;
  concepto_gasto: string | null;
  nro_factura: string | null;
  valor_imponible: number | null;
  bonificacion: number | null;
  observaciones: string | null;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  creado_por: string | null;
}

export type GastoProgramacionInsert = Omit<GastoProgramacionRow, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type GastoProgramacionUpdate = Partial<Omit<GastoProgramacionRow, 'id' | 'fecha_creacion'>>;

// ============================================
// Experience Module Types
// ============================================

// Tabla experience_formularios (header)
export interface ExperienceFormularioRow {
  id: string;
  mes_gestion: string | null;
  nombre_campana: string | null;
  detalle_campana: string | null;
  subrubro: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ExperienceFormularioInsert = Omit<ExperienceFormularioRow, 'id' | 'created_at' | 'updated_at'>;
export type ExperienceFormularioUpdate = Partial<Omit<ExperienceFormularioRow, 'id' | 'created_at'>>;

// Tabla experience_gastos (contexto)
export interface ExperienceGastoRow {
  id: string;
  gasto_id: string;
  formulario_id: string;
  empresa: string | null;
  empresa_programa: string | null;
  fecha_comprobante: string | null;
  pais: string | null;
}

export type ExperienceGastoInsert = Omit<ExperienceGastoRow, 'id'>;
export type ExperienceGastoUpdate = Partial<Omit<ExperienceGastoRow, 'id' | 'gasto_id' | 'formulario_id'>>;

// Vista experience_gastos_full (para queries)
export interface ExperienceGastoFullRow {
  // Gasto fields
  id: string;
  proveedor: string;
  razon_social: string | null;
  tipo_factura: string | null;
  numero_factura: string | null;
  fecha_factura: string | null;
  moneda: string;
  neto: number;
  iva: number;
  importe_total: number;
  gasto_empresa: string | null;
  concepto_gasto: string | null;
  observaciones: string | null;
  estado: string;
  estado_pago: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Formulario fields
  formulario_id: string;
  mes_gestion: string | null;
  nombre_campana: string | null;
  detalle_campana: string | null;
  subrubro: string | null;
  formulario_estado: string | null;
  formulario_created_at: string | null;
  formulario_created_by: string | null;
  // Context fields
  experience_gasto_id: string;
  factura_emitida_a: string | null;
  empresa: string | null;
  empresa_programa: string | null;
  fecha_comprobante: string | null;
  acuerdo_pago: string | null;
  forma_pago: string | null;
  pais: string | null;
}

// ============================================
// NEW: Entidades (proveedores + clientes)
// ============================================

export interface EntidadRow {
  id: string;
  razon_social: string;
  nombre_fantasia: string | null;
  cuit: string;
  tipo_entidad: 'proveedor' | 'cliente' | 'ambos';
  condicion_iva: 'responsable_inscripto' | 'monotributista' | 'exento' | 'consumidor_final' | 'no_responsable';
  direccion: string | null;
  localidad: string | null;
  provincia: string | null;
  email: string | null;
  telefono: string | null;
  empresa: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type EntidadInsert = Omit<EntidadRow, 'id' | 'created_at' | 'updated_at'>;
export type EntidadUpdate = Partial<Omit<EntidadRow, 'id' | 'created_at'>>;

// ============================================
// NEW: Comprobantes (ingresos + egresos)
// ============================================

export interface ComprobanteRow {
  id: string;
  tipo_movimiento: 'ingreso' | 'egreso';
  entidad_id: string | null;
  entidad_nombre: string;
  entidad_cuit: string | null;
  tipo_comprobante: string | null;
  punto_venta: string | null;
  numero_comprobante: string | null;
  fecha_comprobante: string | null;
  cae: string | null;
  fecha_vencimiento_cae: string | null;
  moneda: string;
  neto: number;
  iva_alicuota: number;
  iva_monto: number;
  percepciones: number;
  total: number;
  empresa: string | null;
  concepto: string | null;
  observaciones: string | null;
  estado: string;
  estado_pago: 'creado' | 'aprobado' | 'requiere_info' | 'rechazado' | 'pagado';
  // Payment/collection fields (migration 004)
  forma_pago: string | null;
  cotizacion: number | null;
  banco: string | null;
  numero_operacion: string | null;
  fecha_pago: string | null;
  // Admin fields (migration 005)
  condicion_iva: string | null;
  comprobante_pago: string | null;
  ingresos_brutos: number | null;
  retencion_ganancias: number | null;
  fecha_estimada_pago: string | null;
  nota_admin: string | null;
  // Ingreso-specific fields (migration 006)
  retencion_iva: number | null;
  retencion_suss: number | null;
  fecha_vencimiento: string | null;
  fecha_ingreso_cheque: string | null;
  certificacion_enviada_fecha: string | null;
  portal: string | null;
  contacto: string | null;
  fecha_envio: string | null;
  orden_publicidad_id_ingreso: string | null;
  // Consolidated context fields (migration 007)
  factura_emitida_a: string | null;
  acuerdo_pago: string | null;
  // Audit
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ComprobanteInsert = Omit<ComprobanteRow, 'id' | 'created_at' | 'updated_at'>;
export type ComprobanteUpdate = Partial<Omit<ComprobanteRow, 'id' | 'created_at'>>;

// Tabla implementacion_comprobantes (contexto)
export interface ImplementacionComprobanteRow {
  id: string;
  comprobante_id: string;
  orden_publicidad_id: string | null;
  item_orden_publicidad_id: string | null;
  sector: string | null;
  rubro_gasto: string | null;
  sub_rubro: string | null;
  condicion_pago: string | null;
  adjuntos: unknown | null;
}

export type ImplementacionComprobanteInsert = Omit<ImplementacionComprobanteRow, 'id'>;
export type ImplementacionComprobanteUpdate = Partial<Omit<ImplementacionComprobanteRow, 'id' | 'comprobante_id'>>;

// Tabla programacion_comprobantes (contexto)
export interface ProgramacionComprobanteRow {
  id: string;
  comprobante_id: string;
  formulario_id: string;
  categoria: string | null;
  cliente: string | null;
  monto: number | null;
  valor_imponible: number | null;
  bonificacion: number | null;
}

export type ProgramacionComprobanteInsert = Omit<ProgramacionComprobanteRow, 'id'>;
export type ProgramacionComprobanteUpdate = Partial<Omit<ProgramacionComprobanteRow, 'id' | 'comprobante_id' | 'formulario_id'>>;

// Tabla experience_comprobantes (contexto)
export interface ExperienceComprobanteRow {
  id: string;
  comprobante_id: string;
  formulario_id: string;
  empresa: string | null;
  empresa_programa: string | null;
  fecha_comprobante: string | null;
  pais: string | null;
}

export type ExperienceComprobanteInsert = Omit<ExperienceComprobanteRow, 'id'>;
export type ExperienceComprobanteUpdate = Partial<Omit<ExperienceComprobanteRow, 'id' | 'comprobante_id' | 'formulario_id'>>;

// Vista comprobantes_full (para queries con contexto)
// Note: ComprobanteFullRow inherits admin fields from ComprobanteRow
export interface ComprobanteFullRow extends ComprobanteRow {
  area_origen: 'implementacion' | 'programacion' | 'experience' | 'directo';
  // Implementacion context
  implementacion_comprobante_id: string | null;
  orden_publicidad_id: string | null;
  item_orden_publicidad_id: string | null;
  sector: string | null;
  rubro_gasto: string | null;
  sub_rubro: string | null;
  impl_nombre_campana: string | null;
  impl_orden_publicidad: string | null;
  // Programacion context
  programacion_comprobante_id: string | null;
  programacion_formulario_id: string | null;
  prog_programa: string | null;
  prog_mes_gestion: string | null;
  prog_unidad_negocio: string | null;
  prog_categoria_negocio: string | null;
  // Experience context
  experience_comprobante_id: string | null;
  experience_formulario_id: string | null;
  exp_nombre_campana: string | null;
  exp_mes_gestion: string | null;
  // OP vinculada para ingresos
  ingreso_op_id: string | null;
  ingreso_op_numero: string | null;
  ingreso_op_responsable: string | null;
  ingreso_op_unidad_negocio: string | null;
  ingreso_op_nombre_campana: string | null;
  ingreso_op_marca: string | null;
  ingreso_op_razon_social: string | null;
  ingreso_op_importe: string | null;
  ingreso_op_acuerdo_pago: string | null;
  ingreso_op_mes_servicio: string | null;
  // Entidad resolved (from LEFT JOIN entidades)
  entidad_cuit_efectivo: string | null;
  entidad_condicion_iva: string | null;
}
