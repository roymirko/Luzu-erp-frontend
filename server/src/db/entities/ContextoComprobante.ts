import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contexto_comprobante')
export class ContextoComprobante {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  area_origen!: string;

  @Column({ type: 'text', nullable: true })
  mes_gestion!: string | null;

  @Column({ type: 'text', nullable: true })
  detalle_campana!: string | null;

  @Column({ type: 'text', default: 'borrador' })
  estado!: string;

  @Column({ type: 'text', nullable: true })
  nombre_campana!: string | null;

  @Column({ type: 'text', nullable: true })
  unidad_negocio!: string | null;

  @Column({ type: 'text', nullable: true })
  categoria_negocio!: string | null;

  @Column({ type: 'text', nullable: true })
  mes_venta!: string | null;

  @Column({ type: 'text', nullable: true })
  mes_inicio!: string | null;

  @Column({ type: 'text', nullable: true })
  programa!: string | null;

  @Column({ type: 'text', nullable: true })
  ejecutivo!: string | null;

  @Column({ type: 'text', nullable: true })
  rubro!: string | null;

  @Column({ type: 'text', nullable: true })
  sub_rubro!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: string;

  @Column({ type: 'text', nullable: true })
  created_by!: string | null;
}
