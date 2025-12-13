import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerAccount } from './entities/customer-account.entity';
import { CustomerPayment } from './entities/customer-payment.entity';
import { Sale } from '../sales/entities/sale.entity';
import { ExchangeRate } from '../exchange-rates/entities/exchange-rate.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Customer,
            CustomerAccount,
            CustomerPayment,
            Sale,
            ExchangeRate,
        ]),
    ],
    providers: [CustomersService],
    controllers: [CustomersController],
    exports: [CustomersService],
})
export class CustomersModule {}
