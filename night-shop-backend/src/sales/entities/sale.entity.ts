import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SaleDetail } from './sale-detail.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { ExchangeRate } from '../../exchange-rates/entities/exchange-rate.entity';

export enum SaleStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
}

export enum SaleType {
    CREDIT = 'credit',
    CASH = 'cash',
}

export enum ChangePaymentMethod {
    USD = 'usd',
    BS = 'bs',
    MIXED = 'mixed',
}

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.PENDING })
    status: SaleStatus;

    @Column({ type: 'enum', enum: SaleType, default: SaleType.CASH, name: 'sale_type' })
    saleType: SaleType;

    @Column('decimal', { precision: 10, scale: 2, name: 'total_amount_usd' })
    totalAmountUsd: number;

    @Column('decimal', { precision: 10, scale: 2, name: 'total_amount_bs' })
    totalAmountBs: number;

    @ManyToOne(() => ExchangeRate)
    @JoinColumn({ name: 'exchange_rate_id' })
    exchangeRate: ExchangeRate; // Tasa de cambio al momento de la venta

    @Column({ name: 'exchange_rate_id' })
    exchangeRateId: string;

    // Campos para pagos mixtos
    @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'paid_amount_bs' })
    paidAmountBs: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'paid_amount_usd' })
    paidAmountUsd: number;

    // Campos para cambio
    @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'change_usd' })
    changeUsd: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'change_bs' })
    changeBS: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'change_total_usd' })
    changeTotalUsd: number; // Total del cambio convertido a USD

    @Column({ type: 'enum', enum: ChangePaymentMethod, nullable: true, name: 'change_payment_method' })
    changePaymentMethod?: ChangePaymentMethod;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => Customer, (customer) => customer.sales, { nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id', nullable: true })
    customerId: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    notes: string;

    @OneToMany(() => SaleDetail, (saleDetail) => saleDetail.sale, {
        cascade: true,
    })
    saleDetails: SaleDetail[];

    // Relación con pagos del cliente (para mostrar abonos iniciales)
    customerPayments?: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
