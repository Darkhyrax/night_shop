import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AdminUserSeeder } from './admin-user.seeder';
import { ProductSeeder } from './product.seeder';
import { ExchangeRateSeeder } from './exchange-rate.seeder';
import { CustomerSeeder } from './customer.seeder';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { ExchangeRate } from '../exchange-rates/entities/exchange-rate.entity';
import { Customer } from '../customers/entities/customer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Product,
            InventoryBatch,
            ExchangeRate,
            Customer,
        ]),
        HttpModule,
    ],
    providers: [
        AdminUserSeeder,
        ProductSeeder,
        ExchangeRateSeeder,
        CustomerSeeder,
    ],
    exports: [
        AdminUserSeeder,
        ProductSeeder,
        ExchangeRateSeeder,
        CustomerSeeder,
    ],
})
export class SeedersModule {}
