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

export type ProveedorInsert = Omit<ProveedorRow, 'id' | 'fecha_creacion'>;
export type ProveedorUpdate = Partial<Omit<ProveedorRow, 'id' | 'fecha_creacion'>>;

// ============================================
// Entidades (proveedores + clientes)
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
// Comprobantes (with flattened context columns)
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
  // Payment/collection
  forma_pago: string | null;
  cotizacion: number | null;
  banco: string | null;
  numero_operacion: string | null;
  fecha_pago: string | null;
  // Admin
  condicion_iva: string | null;
  comprobante_pago: string | null;
  ingresos_brutos: number | null;
  retencion_ganancias: number | null;
  fecha_estimada_pago: string | null;
  nota_admin: string | null;
  // Ingreso-specific
  retencion_iva: number | null;
  retencion_suss: number | null;
  fecha_vencimiento: string | null;
  fecha_ingreso_cheque: string | null;
  certificacion_enviada_fecha: string | null;
  portal: string | null;
  contacto: string | null;
  fecha_envio: string | null;
  orden_publicidad_id_ingreso: string | null;
  // Consolidated context
  factura_emitida_a: string | null;
  acuerdo_pago: string | null;
  // Flattened context columns (replaces 6 context tables)
  area_origen: string | null;
  contexto_comprobante_id: string | null;
  orden_publicidad_id: string | null;
  item_orden_publicidad_id: string | null;
  sector: string | null;
  rubro_contexto: string | null;
  sub_rubro_contexto: string | null;
  condicion_pago: string | null;
  adjuntos: unknown | null;
  nombre_campana: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  categoria: string | null;
  cliente: string | null;
  monto_prog: number | null;
  valor_imponible: number | null;
  bonificacion: number | null;
  empresa_programa: string | null;
  pais: string | null;
  // Audit
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ComprobanteInsert = Omit<ComprobanteRow, 'id' | 'created_at' | 'updated_at'>;
export type ComprobanteUpdate = Partial<Omit<ComprobanteRow, 'id' | 'created_at'>>;

// ============================================
// Comprobantes Full View (simplified — 4 JOINs)
// ============================================

export interface ComprobanteFullRow extends ComprobanteRow {
  // From contexto_comprobante JOIN
  ctx_mes_gestion: string | null;
  ctx_detalle_campana: string | null;
  ctx_programa: string | null;
  ctx_ejecutivo: string | null;
  ctx_mes_venta: string | null;
  ctx_mes_inicio: string | null;
  ctx_nombre_campana: string | null;
  ctx_unidad_negocio: string | null;
  ctx_categoria_negocio: string | null;
  ctx_rubro: string | null;
  ctx_sub_rubro: string | null;
  ctx_estado: string | null;
  ctx_created_at: string | null;
  ctx_created_by: string | null;
  // From ordenes_publicidad JOIN (egresos)
  op_numero_orden: string | null;
  op_responsable: string | null;
  op_unidad_negocio: string | null;
  op_categoria_negocio: string | null;
  op_nombre_campana: string | null;
  op_razon_social: string | null;
  op_marca: string | null;
  op_mes_servicio: string | null;
  op_acuerdo_pago: string | null;
  // From ordenes_publicidad JOIN (ingresos)
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
  // From entidades JOIN
  entidad_cuit_efectivo: string | null;
  entidad_condicion_iva: string | null;
}

