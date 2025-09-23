import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 15, scale: 2 })
  rate: number; // Tasa de cambio (1 USD = X Bs)

  @Column({ type: 'date' })
  effectiveDate: Date; // Fecha en que aplica esta tasa

  @Column({ default: false })
  isActive: boolean; // Indica si es la tasa activa actual

  @Column({ nullable: true })
  source: string; // Fuente de la tasa (BCV, paralelo, etc.)

  @Column({ nullable: true })
  notes: string; // Notas adicionales

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
