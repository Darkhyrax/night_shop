import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { ExchangeRate } from '../exchange-rates/entities/exchange-rate.entity';

@Injectable()
export class ProductSeeder {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(InventoryBatch)
        private inventoryBatchRepository: Repository<InventoryBatch>,
        @InjectRepository(ExchangeRate)
        private exchangeRateRepository: Repository<ExchangeRate>,
    ) {}

    async seed(): Promise<void> {
        // Verificar si ya existe el producto de prueba
        const existingProduct = await this.productsRepository.findOne({
            where: { name: 'Producto de Prueba' },
        });

        if (existingProduct) {
            console.log('Producto de prueba ya existe, omitiendo seeder');
            return;
        }

        // Obtener la tasa de cambio actual
        let exchangeRate = await this.exchangeRateRepository.findOne({
            where: { isActive: true },
        });

        // Si no existe tasa activa, crear una por defecto
        if (!exchangeRate) {
            exchangeRate = this.exchangeRateRepository.create({
                rate: 256.5,
                effectiveDate: new Date(),
                isActive: true,
                source: 'Sistema',
                notes: 'Tasa inicial del sistema',
            });
            exchangeRate = await this.exchangeRateRepository.save(exchangeRate);
        }

        // Crear producto de prueba
        const product = this.productsRepository.create({
            name: 'Producto de Prueba',
            description: 'Producto creado automáticamente por el seeder',
            currentCostPrice: 10.0,
            currentProfitPercentage: 50,
            currentSellingPrice: 15.0,
            totalStock: 100,
            isActive: true,
        });

        const savedProduct = await this.productsRepository.save(product);

        // Crear lote de inventario
        const batch = this.inventoryBatchRepository.create({
            productId: savedProduct.id,
            batchCode: `BATCH-${Date.now()}`,
            totalCostUsd: 100.0,
            totalCostBs: 100.0 * exchangeRate.rate,
            unitCostUsd: 10.0,
            unitCostBs: 10.0 * exchangeRate.rate,
            sellingPriceUsd: 15.0,
            initialQuantity: 100,
            currentQuantity: 100,
            profitPercentage: 50,
            purchaseDate: new Date(),
            purchaseExchangeRateId: exchangeRate.id,
        });

        await this.inventoryBatchRepository.save(batch);

        console.log('✅ Seeder ejecutado: Producto e inventario creados correctamente');
    }
}
