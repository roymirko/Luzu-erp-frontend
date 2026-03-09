import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('comprobantes')
export class Comprobante {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  tipo_movimiento!: string;

  @Column({ type: 'uuid', nullable: true })
  entidad_id!: string | null;

  @Column({ type: 'text' })
  entidad_nombre!: string;

  @Column({ type: 'text', nullable: true })
  entidad_cuit!: string | null;

  @Column({ type: 'text', nullable: true })
  tipo_comprobante!: string | null;

  @Column({ type: 'text', nullable: true })
  punto_venta!: string | null;

  @Column({ type: 'text', nullable: true })
  numero_comprobante!: string | null;

  @Column({ type: 'text', nullable: true })
  fecha_comprobante!: string | null;

  @Column({ type: 'text', nullable: true })
  cae!: string | null;

  @Column({ type: 'text', nullable: true })
  fecha_vencimiento_cae!: string | null;

  @Column({ type: 'text', default: 'ARS' })
  moneda!: string;

  @Column({ type: 'numeric', default: 0 })
  neto!: number;

  @Column({ type: 'numeric', default: 0 })
  iva_alicuota!: number;

  @Column({ type: 'numeric', default: 0 })
  iva_monto!: number;

  @Column({ type: 'numeric', default: 0 })
  percepciones!: number;

  @Column({ type: 'numeric', default: 0 })
  total!: number;

  @Column({ type: 'text', nullable: true })
  empresa!: string | null;

  @Column({ type: 'text', nullable: true })
  concepto!: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'text', default: 'borrador' })
  estado!: string;

  @Column({ type: 'text', default: 'creado' })
  estado_pago!: string;

  @Column({ type: 'text', nullable: true })
  forma_pago!: string | null;

  @Column({ type: 'numeric', nullable: true })
  cotizacion!: number | null;

  @Column({ type: 'text', nullable: true })
  banco!: string | null;

  @Column({ type: 'text', nullable: true })
  numero_operacion!: string | null;

  @Column({ type: 'text', nullable: true })
  fecha_pago!: string | null;

  @Column({ type: 'text', nullable: true })
  condicion_iva!: string | null;

  @Column({ type: 'text', nullable: true })
  comprobante_pago!: string | null;

  @Column({ type: 'numeric', nullable: true })
  ingresos_brutos!: number | null;

  @Column({ type: 'numeric', nullable: true })
  retencion_ganancias!: number | null;

  @Column({ type: 'text', nullable: true })
  fecha_estimada_pago!: string | null;

  @Column({ type: 'text', nullable: true })
  nota_admin!: string | null;

  @Column({ type: 'numeric', nullable: true })
  retencion_iva!: number | null;

  @Column({ type: 'numeric', nullable: true })
  retencion_suss!: number | null;

  @Column({ type: 'text', nullable: true })
  fecha_vencimiento!: string | null;

  @Column({ type: 'text', nullable: true })
  fecha_ingreso_cheque!: string | null;

  @Column({ type: 'text', nullable: true })
  certificacion_enviada_fecha!: string | null;

  @Column({ type: 'text', nullable: true })
  portal!: string | null;

  @Column({ type: 'text', nullable: true })
  contacto!: string | null;

  @Column({ type: 'text', nullable: true })
  fecha_envio!: string | null;

  @Column({ type: 'uuid', nullable: true })
  orden_publicidad_id_ingreso!: string | null;

  @Column({ type: 'text', nullable: true })
  factura_emitida_a!: string | null;

  @Column({ type: 'text', nullable: true })
  acuerdo_pago!: string | null;

  // Flattened context columns
  @Column({ type: 'text', nullable: true })
  area_origen!: string | null;

  @Column({ type: 'uuid', nullable: true })
  contexto_comprobante_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  orden_publicidad_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  item_orden_publicidad_id!: string | null;

  @Column({ type: 'text', nullable: true })
  sector!: string | null;

  @Column({ type: 'text', nullable: true })
  rubro_contexto!: string | null;

  @Column({ type: 'text', nullable: true })
  sub_rubro_contexto!: string | null;

  @Column({ type: 'text', nullable: true })
  condicion_pago!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  adjuntos!: unknown | null;

  @Column({ type: 'text', nullable: true })
  nombre_campana!: string | null;

  @Column({ type: 'text', nullable: true })
  unidad_negocio!: string | null;

  @Column({ type: 'text', nullable: true })
  categoria_negocio!: string | null;

  @Column({ type: 'text', nullable: true })
  categoria!: string | null;

  @Column({ type: 'text', nullable: true })
  cliente!: string | null;

  @Column({ type: 'numeric', nullable: true })
  monto_prog!: number | null;

  @Column({ type: 'numeric', nullable: true })
  valor_imponible!: number | null;

  @Column({ type: 'numeric', nullable: true })
  bonificacion!: number | null;

  @Column({ type: 'text', nullable: true })
  empresa_programa!: string | null;

  @Column({ type: 'text', nullable: true })
  pais!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: string;

  @Column({ type: 'text', nullable: true })
  created_by!: string | null;
}
