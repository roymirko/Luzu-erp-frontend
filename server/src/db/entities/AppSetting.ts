import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('app_settings')
export class AppSetting {
  @PrimaryColumn()
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at!: string | null;

  @Column({ type: 'text', nullable: true })
  updated_by!: string | null;
}
