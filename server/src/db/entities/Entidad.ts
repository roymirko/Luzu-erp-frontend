import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('entidades')
export class Entidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  razon_social!: string;

  @Column({ type: 'text', nullable: true })
  nombre_fantasia!: string | null;

  @Column({ type: 'text' })
  cuit!: string;

  @Column({ type: 'text' })
  tipo_entidad!: 'proveedor' | 'cliente' | 'ambos';

  @Column({ type: 'text' })
  condicion_iva!: string;

  @Column({ type: 'text', nullable: true })
  direccion!: string | null;

  @Column({ type: 'text', nullable: true })
  localidad!: string | null;

  @Column({ type: 'text', nullable: true })
  provincia!: string | null;

  @Column({ type: 'text', nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  telefono!: string | null;

  @Column({ type: 'text', nullable: true })
  empresa!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: string;

  @Column({ type: 'text', nullable: true })
  created_by!: string | null;
}
