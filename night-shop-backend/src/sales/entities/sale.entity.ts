import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { SaleDetail } from './sale-detail.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { ExchangeRate } from '../../exchange-rates/entities/exchange-rate.entity';

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CurrencyType {
  USD = 'usd',
  BS = 'bs',
  MIXED = 'mixed' // Para pagos mixtos (parte en USD y parte en Bs)
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.PENDING })
  status: SaleStatus;

  @Column({ type: 'enum', enum: CurrencyType, default: CurrencyType.BS })
  currency: CurrencyType;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmountBs: number;
  
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmountUsd: number;
  
  @ManyToOne(() => ExchangeRate)
  @JoinColumn({ name: 'exchange_rate_id' })
  exchangeRate: ExchangeRate; // Tasa de cambio al momento de la venta
  
  @Column({ name: 'exchange_rate_id' })
  exchangeRateId: string;
  
  // Campos para pagos mixtos
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmountBs: number;
  
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmountUsd: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Customer, customer => customer.sales, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @OneToMany(() => SaleDetail, saleDetail => saleDetail.sale, { cascade: true })
  saleDetails: SaleDetail[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
