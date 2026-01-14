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
