import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrdenPublicidad } from './OrdenPublicidad.js';

@Entity('items_orden_publicidad')
export class ItemOrdenPublicidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orden_publicidad_id!: string;

  @Column({ type: 'text', nullable: true })
  programa!: string | null;

  @Column({ type: 'text', nullable: true })
  monto!: string | null;

  @Column({ type: 'text', nullable: true })
  nc_programa!: string | null;

  @Column({ type: 'text', nullable: true })
  nc_porcentaje!: string | null;

  @Column({ type: 'text', nullable: true })
  proveedor_fee!: string | null;

  @Column({ type: 'text', nullable: true })
  fee_programa!: string | null;

  @Column({ type: 'text', nullable: true })
  fee_porcentaje!: string | null;

  @Column({ type: 'text', nullable: true })
  implementacion!: string | null;

  @Column({ type: 'text', nullable: true })
  talentos!: string | null;

  @Column({ type: 'text', nullable: true })
  tecnica!: string | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha_creacion!: string;

  @ManyToOne(() => OrdenPublicidad, op => op.items_orden_publicidad)
  @JoinColumn({ name: 'orden_publicidad_id' })
  orden!: OrdenPublicidad;
}
