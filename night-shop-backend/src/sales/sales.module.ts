import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { FixSaleStatusService } from './fix-sale-status.service';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CustomersModule } from '../customers/customers.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { CustomerPayment } from '../customers/entities/customer-payment.entity';
import { CustomerAccount } from '../customers/entities/customer-account.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Sale, SaleDetail, CustomerPayment, CustomerAccount]),
        UsersModule,
        ProductsModule,
        InventoryModule,
        CustomersModule,
        ExchangeRatesModule,
    ],
    providers: [SalesService, FixSaleStatusService],
    controllers: [SalesController],
    exports: [SalesService],
})
export class SalesModule {}
