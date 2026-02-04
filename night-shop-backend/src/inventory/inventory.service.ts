import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { ProductsService } from '../products/products.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { SaleDetail } from '../sales/entities/sale-detail.entity';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(InventoryBatch)
        private inventoryBatchRepository: Repository<InventoryBatch>,
        @InjectRepository(SaleDetail)
        private saleDetailsRepository: Repository<SaleDetail>,
        private productsService: ProductsService,
        private exchangeRatesService: ExchangeRatesService,
    ) {}

    async createBatch(
        createInventoryBatchDto: CreateInventoryBatchDto,
    ): Promise<InventoryBatch> {
        const {
            productId,
            totalCost,
            costCurrency,
            initialQuantity,
            profitPercentage,
            purchaseExchangeRateId,
        } = createInventoryBatchDto;

        // Verificar que el producto existe
        const product = await this.productsService.findOne(productId);

        // Obtener la tasa de cambio
        const exchangeRate = await this.exchangeRatesService.findOne(
            purchaseExchangeRateId,
        );

        // Calcular costos totales en ambas monedas según la moneda de entrada
        let totalCostUsd: number;
        let totalCostBs: number;

        if (costCurrency === 'usd') {
            totalCostUsd = totalCost;
            totalCostBs = totalCost * exchangeRate.rate;
        } else {
            // bs
            totalCostBs = totalCost;
            totalCostUsd = totalCost / exchangeRate.rate;
        }

        // Calcular costos unitarios
        const unitCostUsd = totalCostUsd / initialQuantity;
        const unitCostBs = totalCostBs / initialQuantity;

        // Calcular precio de venta SIEMPRE en USD basado en el porcentaje de ganancia
        // Independientemente de la moneda de entrada, el precio de venta se calcula en USD
        // Esto protege contra la inflación y mantiene los precios estables
        const sellingPriceUsd = unitCostUsd * (1 + profitPercentage / 100);

        const batch = this.inventoryBatchRepository.create({
            ...createInventoryBatchDto,
            totalCostUsd,
            totalCostBs,
            unitCostUsd,
            unitCostBs,
            sellingPriceUsd,
            currentQuantity: initialQuantity,
        });

        // Guardar el lote
        const savedBatch = await this.inventoryBatchRepository.save(batch);

        // Actualizar el stock total del producto
        await this.updateProductStock(productId);

        // Calcular y actualizar el precio promedio ponderado del producto
        // Pasar el porcentaje de ganancia del nuevo lote para actualizar el producto
        await this.updateProductAveragePriceWithProfit(productId, profitPercentage);

        return savedBatch;
    }

    async findAllBatches(): Promise<InventoryBatch[]> {
        return this.inventoryBatchRepository.find({
            relations: ['product', 'purchaseExchangeRate'],
            order: { createdAt: 'DESC' },
        });
    }

    async findBatchesByProduct(productId: string): Promise<InventoryBatch[]> {
        return this.inventoryBatchRepository.find({
            where: { productId },
            relations: ['product', 'purchaseExchangeRate'],
            order: { purchaseDate: 'DESC' },
        });
    }

    async findBatch(id: string): Promise<InventoryBatch> {
        const batch = await this.inventoryBatchRepository.findOne({
            where: { id },
            relations: ['product', 'purchaseExchangeRate'],
        });

        if (!batch) {
            throw new NotFoundException(
                `Inventory batch with ID "${id}" not found`,
            );
        }

        return batch;
    }

    async updateBatchQuantity(
        id: string,
        quantityChange: number,
    ): Promise<InventoryBatch> {
        const batch = await this.findBatch(id);

        const newQuantity = batch.currentQuantity + quantityChange;
        if (newQuantity < 0) {
            throw new Error('Cannot reduce quantity below zero');
        }

        // Verificar si el lote se está agotando completamente
        const isBeingDepleted = batch.currentQuantity > 0 && newQuantity === 0;

        batch.currentQuantity = newQuantity;
        const updatedBatch = await this.inventoryBatchRepository.save(batch);

        // Actualizar el stock total del producto
        await this.updateProductStock(batch.productId);

        // Si el lote se agotó completamente o hubo un cambio significativo en la cantidad,
        // recalcular el precio promedio ponderado
        if (isBeingDepleted || Math.abs(quantityChange) > 5) {
            await this.updateProductAveragePrice(batch.productId);
        }

        return updatedBatch;
    }

    async updateProductStock(productId: string): Promise<void> {
        // Recalcular el stock total del producto sumando todos los lotes
        const batches = await this.inventoryBatchRepository.find({
            where: { productId },
        });

        const totalStock = batches.reduce(
            (sum, batch) => sum + batch.currentQuantity,
            0,
        );

        await this.productsService.updateStock(productId, totalStock);
    }

    /**
     * Calcula y actualiza el precio promedio ponderado de un producto basado en los lotes disponibles
     * @param productId ID del producto a actualizar
     */
    async updateProductAveragePrice(productId: string): Promise<void> {
        // Obtener todos los lotes disponibles del producto
        const batches = await this.inventoryBatchRepository.find({
            where: {
                productId,
                currentQuantity: MoreThan(0), // Solo lotes con stock disponible
            },
        });

        if (batches.length === 0) {
            return; // No hay lotes disponibles, mantener el precio actual
        }

        // Calcular el precio promedio ponderado
        let totalCost = 0;
        let totalQuantity = 0;

        for (const batch of batches) {
            totalCost += batch.unitCostUsd * batch.currentQuantity;
            totalQuantity += batch.currentQuantity;
        }

        const averageCost = totalCost / totalQuantity;

        // Obtener el porcentaje de ganancia actual del producto
        const product = await this.productsService.findOne(productId);
        const profitPercentage = product.currentProfitPercentage;

        // Calcular el nuevo precio de venta basado en el costo promedio
        const newSellingPrice = averageCost * (1 + profitPercentage / 100);

        // Actualizar el producto con el nuevo costo y precio
        await this.productsService.updatePricing(
            productId,
            averageCost,
            profitPercentage,
            newSellingPrice,
        );
    }

    /**
     * Calcula y actualiza el precio promedio ponderado con un porcentaje de ganancia específico
     * @param productId ID del producto a actualizar
     * @param profitPercentage Porcentaje de ganancia a aplicar
     */
    async updateProductAveragePriceWithProfit(
        productId: string,
        profitPercentage: number,
    ): Promise<void> {
        // Obtener todos los lotes disponibles del producto, ordenados por fecha de creación descendente
        const batches = await this.inventoryBatchRepository.find({
            where: {
                productId,
                currentQuantity: MoreThan(0), // Solo lotes con stock disponible
            },
            order: { createdAt: 'DESC' }, // Más reciente primero
        });

        if (batches.length === 0) {
            return; // No hay lotes disponibles, mantener el precio actual
        }

        // Usar el costo unitario del lote más reciente como referencia
        const latestBatch = batches[0];
        const referenceCost = latestBatch.unitCostUsd;

        // Calcular el nuevo precio de venta basado en el costo del lote más reciente y el porcentaje proporcionado
        const newSellingPrice = referenceCost * (1 + profitPercentage / 100);

        // Actualizar el producto con el costo del lote más reciente, porcentaje de ganancia y precio
        await this.productsService.updatePricing(
            productId,
            referenceCost,
            profitPercentage,
            newSellingPrice,
        );
    }

    async updateProductPricing(
        productId: string,
        costPrice: number,
        profitPercentage: number,
        sellingPrice: number,
    ): Promise<void> {
        // Actualizar el producto con los nuevos precios en USD
        await this.productsService.updatePricing(
            productId,
            costPrice,
            profitPercentage,
            sellingPrice,
        );
    }

    async updateBatch(
        id: string,
        updateData: {
            batchCode?: string;
            profitPercentage?: number;
            expirationDate?: Date;
        },
    ): Promise<InventoryBatch> {
        const batch = await this.findBatch(id);

        // Verificar si hay productos de este lote que han sido vendidos
        const saleDetailsCount = await this.saleDetailsRepository.count({
            where: { inventoryBatchId: id },
        });

        if (saleDetailsCount > 0) {
            throw new BadRequestException(
                'No se puede editar este lote porque tiene productos vendidos. Solo se pueden editar lotes sin ventas asociadas.',
            );
        }

        // Actualizar los campos permitidos
        if (updateData.batchCode !== undefined) {
            batch.batchCode = updateData.batchCode;
        }
        if (updateData.expirationDate !== undefined) {
            batch.expirationDate = updateData.expirationDate;
        }

        // Si se actualiza el porcentaje de ganancia, recalcular el precio de venta
        if (updateData.profitPercentage !== undefined) {
            batch.profitPercentage = updateData.profitPercentage;
            batch.sellingPriceUsd = batch.unitCostUsd * (1 + updateData.profitPercentage / 100);

            // Actualizar el precio del producto
            await this.updateProductAveragePriceWithProfit(
                batch.productId,
                updateData.profitPercentage,
            );
        }

        return this.inventoryBatchRepository.save(batch);
    }

    async deleteBatch(id: string): Promise<void> {
        const batch = await this.findBatch(id);

        // Verificar si hay productos de este lote que han sido vendidos
        const saleDetailsCount = await this.saleDetailsRepository.count({
            where: { inventoryBatchId: id },
        });

        if (saleDetailsCount > 0) {
            throw new BadRequestException(
                'No se puede eliminar este lote porque tiene productos vendidos. Solo se pueden eliminar lotes sin ventas asociadas.',
            );
        }

        // Si no hay ventas, proceder a eliminar el lote
        await this.inventoryBatchRepository.remove(batch);

        // Actualizar el stock total del producto
        await this.updateProductStock(batch.productId);

        // Recalcular el precio promedio ponderado del producto
        await this.updateProductAveragePrice(batch.productId);
    }
}
