import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { CustomerPayment } from './customer-payment.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('customer_accounts')
export class CustomerAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, (customer) => customer.accounts)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id' })
    customerId: string;

    @ManyToOne(() => Sale)
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @Column({ name: 'sale_id' })
    saleId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    debtUsd: number;

    @OneToMany(() => CustomerPayment, (payment) => payment.customerAccount)
    payments: CustomerPayment[];

    @CreateDateColumn()
    createdAt: Date;
}
