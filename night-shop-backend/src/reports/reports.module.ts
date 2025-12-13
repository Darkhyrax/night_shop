import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Sale } from '../sales/entities/sale.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerAccount } from '../customers/entities/customer-account.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Sale, Product, Customer, CustomerAccount]),
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule {}
