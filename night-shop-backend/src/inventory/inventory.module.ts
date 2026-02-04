import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ProductsModule } from '../products/products.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { SaleDetail } from '../sales/entities/sale-detail.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryBatch, SaleDetail]),
        ProductsModule,
        ExchangeRatesModule,
    ],
    providers: [InventoryService],
    controllers: [InventoryController],
    exports: [InventoryService],
})
export class InventoryModule {}
