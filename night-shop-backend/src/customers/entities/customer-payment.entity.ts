import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { CustomerAccount } from './customer-account.entity';
import { ExchangeRate } from '../../exchange-rates/entities/exchange-rate.entity';

export enum PaymentCurrency {
    USD = 'usd',
    BS = 'bs',
}

@Entity('customer_payments')
export class CustomerPayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, (customer) => customer.payments)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id' })
    customerId: string;

    @ManyToOne(() => CustomerAccount, (account) => account.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_account_id' })
    customerAccount: CustomerAccount;

    @Column({ name: 'customer_account_id' })
    customerAccountId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amountUsd: number;

    @Column({ type: 'enum', enum: PaymentCurrency })
    paidInCurrency: PaymentCurrency;

    @Column('decimal', { precision: 10, scale: 2 })
    amountPaidInOriginalCurrency: number;

    @ManyToOne(() => ExchangeRate, { nullable: true })
    @JoinColumn({ name: 'exchange_rate_id' })
    exchangeRate: ExchangeRate;

    @Column({ name: 'exchange_rate_id', nullable: true })
    exchangeRateId: string;

    @Column({ default: false, name: 'is_initial_payment' })
    isInitialPayment: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
