import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { CustomerAccount } from './customer-account.entity';
import { CustomerPayment } from './customer-payment.entity';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    dni: string;

    @Column({ nullable: false })
    firstName: string;

    @Column({ nullable: false })
    lastName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Sale, (sale) => sale.customer)
    sales: Sale[];

    @OneToMany(() => CustomerAccount, (account) => account.customer)
    accounts: CustomerAccount[];

    @OneToMany(() => CustomerPayment, (payment) => payment.customer)
    payments: CustomerPayment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
