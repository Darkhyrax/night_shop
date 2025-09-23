import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, SaleStatus, CurrencyType } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { CustomersService } from '../customers/customers.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private saleDetailsRepository: Repository<SaleDetail>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private customersService: CustomersService,
    private exchangeRatesService: ExchangeRatesService,
    private dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Verificar que el usuario existe
    await this.usersService.findOne(createSaleDto.userId);

    // Verificar que hay detalles de venta
    if (!createSaleDto.saleDetails || createSaleDto.saleDetails.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un producto');
    }
    
    // Verificar que se proporciona un cliente (existente o nuevo)
    if (!createSaleDto.customerId && !createSaleDto.newCustomer) {
      throw new BadRequestException('Debe proporcionar un cliente para la venta (customerId o newCustomer)');
    }

    // Iniciar transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Manejar la creación o verificación del cliente
      let customerId: string | null = null;
      
      // Si se proporciona información para un nuevo cliente, crearlo
      if (createSaleDto.newCustomer) {
        const newCustomer = await this.customersService.create(createSaleDto.newCustomer);
        customerId = newCustomer.id;
      } else if (createSaleDto.customerId) {
        // Si se proporciona un customerId, verificar que el cliente existe
        await this.customersService.findOne(createSaleDto.customerId);
        customerId = createSaleDto.customerId;
      }
      
      // Obtener la tasa de cambio actual
      const currentExchangeRate = await this.exchangeRatesService.getCurrentRate();
      
      // Crear la venta
      const sale = new Sale();
      sale.userId = createSaleDto.userId;
      sale.status = createSaleDto.status || SaleStatus.PENDING;
      sale.customerId = customerId;
      sale.notes = createSaleDto.notes || '';
      sale.totalAmountBs = 0;
      sale.totalAmountUsd = 0;
      sale.currency = createSaleDto.currency || CurrencyType.BS;
      sale.exchangeRateId = currentExchangeRate.id;
      sale.paidAmountBs = createSaleDto.paidAmountBs || 0;
      sale.paidAmountUsd = createSaleDto.paidAmountUsd || 0;

      const savedSale = await queryRunner.manager.save(sale);
      
      // Procesar cada detalle de venta
      let totalAmountBs = 0;
      let totalAmountUsd = 0;
      
      for (const detailDto of createSaleDto.saleDetails) {
        // Verificar que el producto existe
        const product = await this.productsService.findOne(detailDto.productId);
        
        // Verificar stock disponible
        if (product.totalStock < detailDto.quantity) {
          throw new BadRequestException(`Stock insuficiente para el producto ${product.name}`);
        }
        
        // Obtener el precio de venta actual
        const unitPriceUsd = product.currentSellingPrice;
        // Calcular el precio en bolívares usando la tasa de cambio actual
        const unitPriceBs = product.currentSellingPrice * currentExchangeRate.rate;
        
        // Crear el detalle de venta
        const saleDetail = new SaleDetail();
        saleDetail.saleId = savedSale.id;
        saleDetail.productId = detailDto.productId;
        saleDetail.quantity = detailDto.quantity;
        saleDetail.unitPriceUsd = unitPriceUsd;
        saleDetail.unitPriceBs = unitPriceBs;
        saleDetail.subtotalUsd = detailDto.quantity * unitPriceUsd;
        saleDetail.subtotalBs = detailDto.quantity * unitPriceBs;
        
        // Si se especifica un lote específico
        if (detailDto.inventoryBatchId) {
          saleDetail.inventoryBatchId = detailDto.inventoryBatchId;
          await this.inventoryService.updateBatchQuantity(
            detailDto.inventoryBatchId, 
            -detailDto.quantity
          );
        } else {
          // Implementar lógica FIFO para reducir inventario
          await this.reduceInventoryFIFO(detailDto.productId, detailDto.quantity);
        }
        
        await queryRunner.manager.save(saleDetail);
        totalAmountUsd += saleDetail.subtotalUsd;
        totalAmountBs += saleDetail.subtotalBs;
      }
      
      // Actualizar los montos totales de la venta
      savedSale.totalAmountUsd = totalAmountUsd;
      savedSale.totalAmountBs = totalAmountBs;
      await queryRunner.manager.save(savedSale);
      
      // Confirmar la transacción
      await queryRunner.commitTransaction();
      
      return this.findOne(savedSale.id);
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Sale[]> {
    return this.salesRepository.find({
      relations: ['user', 'saleDetails', 'saleDetails.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['user', 'saleDetails', 'saleDetails.product', 'saleDetails.inventoryBatch']
    });
    
    if (!sale) {
      throw new NotFoundException(`Venta con ID "${id}" no encontrada`);
    }
    
    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);
    
    // Solo permitir actualizar ciertos campos
    if (updateSaleDto.status) {
      sale.status = updateSaleDto.status;
    }
    
    if (updateSaleDto.notes) {
      sale.notes = updateSaleDto.notes;
    }
    
    return this.salesRepository.save(sale);
  }

  async updateStatus(id: string, status: SaleStatus): Promise<Sale> {
    const sale = await this.findOne(id);
    sale.status = status;
    return this.salesRepository.save(sale);
  }

  async remove(id: string): Promise<void> {
    const sale = await this.findOne(id);
    
    // Si la venta está completada, no se puede eliminar
    if (sale.status === SaleStatus.COMPLETED) {
      throw new BadRequestException('No se puede eliminar una venta completada');
    }
    
    // Si la venta está pendiente, restaurar el inventario
    if (sale.status === SaleStatus.PENDING) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Restaurar el inventario para cada detalle
        for (const detail of sale.saleDetails) {
          if (detail.inventoryBatchId) {
            // Si hay un lote específico, restaurar ese lote
            await this.inventoryService.updateBatchQuantity(
              detail.inventoryBatchId,
              detail.quantity
            );
          } else {
            // De lo contrario, simplemente actualizar el stock del producto
            const product = await this.productsService.findOne(detail.productId);
            await this.productsService.updateStock(
              detail.productId,
              product.totalStock + detail.quantity
            );
          }
        }
        
        // Cambiar el estado a cancelado
        sale.status = SaleStatus.CANCELLED;
        await queryRunner.manager.save(sale);
        
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }

  private async reduceInventoryFIFO(productId: string, quantity: number): Promise<void> {
    // Obtener todos los lotes del producto ordenados por fecha de compra (FIFO)
    const batches = await this.inventoryService.findBatchesByProduct(productId);
    
    // Ordenar por fecha de compra (más antiguo primero)
    batches.sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime());
    
    let remainingQuantity = quantity;
    
    for (const batch of batches) {
      if (remainingQuantity <= 0) break;
      
      if (batch.currentQuantity > 0) {
        const quantityToReduce = Math.min(batch.currentQuantity, remainingQuantity);
        await this.inventoryService.updateBatchQuantity(batch.id, -quantityToReduce);
        remainingQuantity -= quantityToReduce;
      }
    }
    
    if (remainingQuantity > 0) {
      throw new BadRequestException(`Stock insuficiente para el producto ${productId}`);
    }
  }
}
