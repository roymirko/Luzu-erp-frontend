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
  acuerdo_pago: string | null;
  cliente: string | null;
  monto: number | null;
  valor_imponible: number | null;
  bonificacion: number | null;
  factura_emitida_a: string | null;
  forma_pago: string | null;
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
  factura_emitida_a: string | null;
  sector: string | null;
  rubro_gasto: string | null;
  sub_rubro: string | null;
  condicion_pago: string | null;
  fecha_pago: string | null;
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
