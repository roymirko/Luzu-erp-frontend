import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ItemOrdenPublicidad } from './ItemOrdenPublicidad.js';

@Entity('ordenes_publicidad')
export class OrdenPublicidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: true })
  fecha!: string | null;

  @Column({ type: 'text', nullable: true })
  mes_servicio!: string | null;

  @Column({ type: 'text', nullable: true })
  responsable!: string | null;

  @Column({ type: 'text', nullable: true })
  orden_publicidad!: string | null;

  @Column({ type: 'text', nullable: true })
  total_venta!: string | null;

  @Column({ type: 'text', nullable: true })
  unidad_negocio!: string | null;

  @Column({ type: 'text', nullable: true })
  categoria_negocio!: string | null;

  @Column({ type: 'text', nullable: true })
  proyecto!: string | null;

  @Column({ type: 'text', nullable: true })
  razon_social!: string | null;

  @Column({ type: 'text', nullable: true })
  categoria!: string | null;

  @Column({ type: 'text', nullable: true })
  empresa_agencia!: string | null;

  @Column({ type: 'text', nullable: true })
  marca!: string | null;

  @Column({ type: 'text', nullable: true })
  nombre_campana!: string | null;

  @Column({ type: 'text', nullable: true })
  acuerdo_pago!: string | null;

  @Column({ type: 'text', nullable: true })
  tipo_importe!: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'text', nullable: true })
  estado_op!: string | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha_creacion!: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha_actualizacion!: string;

  @Column({ type: 'text', nullable: true })
  creado_por!: string | null;

  @OneToMany(() => ItemOrdenPublicidad, item => item.orden)
  items_orden_publicidad!: ItemOrdenPublicidad[];
}
