import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, SaleStatus, SaleType, ChangePaymentMethod } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { CustomersService } from '../customers/customers.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { CustomerPayment, PaymentCurrency } from '../customers/entities/customer-payment.entity';
import { CustomerAccount } from '../customers/entities/customer-account.entity';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private salesRepository: Repository<Sale>,
        @InjectRepository(SaleDetail)
        private saleDetailsRepository: Repository<SaleDetail>,
        @InjectRepository(CustomerPayment)
        private customerPaymentRepository: Repository<CustomerPayment>,
        @InjectRepository(CustomerAccount)
        private customerAccountRepository: Repository<CustomerAccount>,
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
        if (
            !createSaleDto.saleDetails ||
            createSaleDto.saleDetails.length === 0
        ) {
            throw new BadRequestException(
                'La venta debe tener al menos un producto',
            );
        }

        // Iniciar transacción
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validar lógica de saleType primero
            if (createSaleDto.saleType === SaleType.CREDIT) {
                // Para ventas a crédito, se requiere un cliente
                if (!createSaleDto.customerId && !createSaleDto.newCustomer) {
                    throw new BadRequestException(
                        'Las ventas a crédito requieren un cliente (customerId o newCustomer)',
                    );
                }
            }

            // Manejar la creación o verificación del cliente (solo si se proporciona)
            let customerId: string | null = null;

            // Si se proporciona información para un nuevo cliente, crearlo
            if (createSaleDto.newCustomer) {
                const newCustomer = await this.customersService.create(
                    createSaleDto.newCustomer,
                );
                customerId = newCustomer.id;
            } else if (createSaleDto.customerId) {
                // Si se proporciona un customerId, verificar que el cliente existe
                await this.customersService.findOne(createSaleDto.customerId);
                customerId = createSaleDto.customerId;
            }

            // Obtener la tasa de cambio actual
            const currentExchangeRate =
                await this.exchangeRatesService.getCurrentRate();

            // Crear la venta
            const sale = new Sale();
            sale.userId = createSaleDto.userId;
            sale.status =
                createSaleDto.saleType === SaleType.CREDIT
                    ? SaleStatus.PENDING
                    : SaleStatus.COMPLETED;
            sale.saleType = createSaleDto.saleType;
            sale.customerId = customerId;
            sale.notes = createSaleDto.notes || '';
            sale.totalAmountBs = 0;
            sale.totalAmountUsd = 0;
            sale.exchangeRateId = currentExchangeRate.id;
            sale.paidAmountBs = createSaleDto.paidAmountBs || 0;
            sale.paidAmountUsd = createSaleDto.paidAmountUsd || 0;
            sale.changeUsd = createSaleDto.changeUsd || 0;
            sale.changeBS = createSaleDto.changeBS || 0;
            // Calcular el total del cambio en USD equivalente
            sale.changeTotalUsd = (createSaleDto.changeUsd || 0) + ((createSaleDto.changeBS || 0) / currentExchangeRate.rate);
            sale.changePaymentMethod = createSaleDto.changePaymentMethod;

            const savedSale = await queryRunner.manager.save(sale);

            // Procesar cada detalle de venta
            let totalAmountBs = 0;
            let totalAmountUsd = 0;

            for (const detailDto of createSaleDto.saleDetails) {
                // Verificar que el producto existe
                const product = await this.productsService.findOne(
                    detailDto.productId,
                );

                // Verificar stock disponible
                if (product.totalStock < detailDto.quantity) {
                    throw new BadRequestException(
                        `Stock insuficiente para el producto ${product.name}`,
                    );
                }

                // Obtener el precio de venta actual
                const unitPriceUsd = product.currentSellingPrice;
                // Calcular el precio en bolívares usando la tasa de cambio actual
                const unitPriceBs =
                    product.currentSellingPrice * currentExchangeRate.rate;

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
                        -detailDto.quantity,
                    );
                } else {
                    // Implementar lógica FIFO para reducir inventario
                    await this.reduceInventoryFIFO(
                        detailDto.productId,
                        detailDto.quantity,
                    );
                }

                await queryRunner.manager.save(saleDetail);
                totalAmountUsd += saleDetail.subtotalUsd;
                totalAmountBs += saleDetail.subtotalBs;
            }

            // Actualizar los montos totales de la venta
            savedSale.totalAmountUsd = totalAmountUsd;
            savedSale.totalAmountBs = totalAmountBs;
            await queryRunner.manager.save(savedSale);

            // Si es venta a crédito, crear registro de deuda en customer_accounts
            let customerAccount: CustomerAccount | null = null;
            if (createSaleDto.saleType === SaleType.CREDIT && savedSale.customerId) {
                // Calcular el monto abonado en USD equivalente
                const totalPaidUsd =
                    (createSaleDto.creditPaymentUsd || 0) +
                    (createSaleDto.creditPaymentBs || 0) / currentExchangeRate.rate;

                // Calcular la deuda pendiente
                const debtUsd = totalAmountUsd - totalPaidUsd;

                // Si hay deuda pendiente, crear registro en customer_accounts
                if (debtUsd > 0) {
                    const account = new CustomerAccount();
                    account.customerId = savedSale.customerId;
                    account.saleId = savedSale.id;
                    account.debtUsd = Math.round(debtUsd * 100) / 100;
                    customerAccount = await queryRunner.manager.save(account);
                }
            }

            // Si es venta a crédito y hay abono, guardar el pago en customer_payments
            if (
                createSaleDto.saleType === SaleType.CREDIT &&
                (createSaleDto.creditPaymentUsd || createSaleDto.creditPaymentBs) &&
                savedSale.customerId &&
                customerAccount
            ) {
                // Guardar abono en USD si existe
                if (
                    createSaleDto.creditPaymentUsd &&
                    createSaleDto.creditPaymentUsd > 0
                ) {
                    const paymentUsd = new CustomerPayment();
                    paymentUsd.customerId = savedSale.customerId;
                    paymentUsd.customerAccountId = customerAccount.id;
                    paymentUsd.amountUsd = createSaleDto.creditPaymentUsd;
                    paymentUsd.paidInCurrency = PaymentCurrency.USD;
                    paymentUsd.amountPaidInOriginalCurrency =
                        createSaleDto.creditPaymentUsd;
                    paymentUsd.exchangeRateId = savedSale.exchangeRateId;
                    paymentUsd.isInitialPayment = true;
                    await queryRunner.manager.save(paymentUsd);
                }

                // Guardar abono en Bs si existe
                if (
                    createSaleDto.creditPaymentBs &&
                    createSaleDto.creditPaymentBs > 0
                ) {
                    const paymentBs = new CustomerPayment();
                    paymentBs.customerId = savedSale.customerId;
                    paymentBs.customerAccountId = customerAccount.id;
                    paymentBs.amountUsd = Math.round(
                        (createSaleDto.creditPaymentBs /
                            currentExchangeRate.rate) *
                            100,
                    ) / 100;
                    paymentBs.paidInCurrency = PaymentCurrency.BS;
                    paymentBs.amountPaidInOriginalCurrency =
                        createSaleDto.creditPaymentBs;
                    paymentBs.exchangeRateId = savedSale.exchangeRateId;
                    paymentBs.isInitialPayment = true;
                    await queryRunner.manager.save(paymentBs);
                }
            }

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
        const sales = await this.salesRepository.find({
            relations: ['user', 'customer', 'exchangeRate', 'saleDetails', 'saleDetails.product'],
            order: { createdAt: 'DESC' },
        });

        // Obtener los abonos de cada venta a través de su cuenta pendiente
        for (const sale of sales) {
            if (sale.customerId) {
                // Buscar la cuenta pendiente (customer_account) de esta venta
                const customerAccount = await this.customerAccountRepository.findOne({
                    where: { saleId: sale.id },
                });

                // Si existe cuenta pendiente, obtener todos sus abonos
                if (customerAccount) {
                    sale.customerPayments = await this.customerPaymentRepository.find({
                        where: { customerAccountId: customerAccount.id },
                        order: { createdAt: 'DESC' },
                    });
                }
            }
        }

        return sales;
    }

    async findOne(id: string): Promise<Sale> {
        const sale = await this.salesRepository.findOne({
            where: { id },
            relations: [
                'user',
                'customer',
                'exchangeRate',
                'saleDetails',
                'saleDetails.product',
                'saleDetails.inventoryBatch',
            ],
        });

        if (!sale) {
            throw new NotFoundException(`Venta con ID "${id}" no encontrada`);
        }

        // Obtener los abonos de esta venta a través de su cuenta pendiente
        if (sale.customerId) {
            // Buscar la cuenta pendiente (customer_account) de esta venta
            const customerAccount = await this.customerAccountRepository.findOne({
                where: { saleId: sale.id },
            });

            // Si existe cuenta pendiente, obtener todos sus abonos
            if (customerAccount) {
                sale.customerPayments = await this.customerPaymentRepository.find({
                    where: { customerAccountId: customerAccount.id },
                    order: { createdAt: 'DESC' },
                });
            }
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
            throw new BadRequestException(
                'No se puede eliminar una venta completada',
            );
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
                            detail.quantity,
                        );
                    } else {
                        // De lo contrario, simplemente actualizar el stock del producto
                        const product = await this.productsService.findOne(
                            detail.productId,
                        );
                        await this.productsService.updateStock(
                            detail.productId,
                            product.totalStock + detail.quantity,
                        );
                    }
                }

                // Cambiar el estado a pendiente (no se puede cancelar, solo se elimina)
                await queryRunner.manager.remove(sale);

                await queryRunner.commitTransaction();
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            } finally {
                await queryRunner.release();
            }
        }
    }

    private async reduceInventoryFIFO(
        productId: string,
        quantity: number,
    ): Promise<void> {
        // Obtener todos los lotes del producto ordenados por fecha de compra (FIFO)
        const batches =
            await this.inventoryService.findBatchesByProduct(productId);

        // Ordenar por fecha de compra (más antiguo primero)
        batches.sort(
            (a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime(),
        );

        let remainingQuantity = quantity;

        for (const batch of batches) {
            if (remainingQuantity <= 0) break;

            if (batch.currentQuantity > 0) {
                const quantityToReduce = Math.min(
                    batch.currentQuantity,
                    remainingQuantity,
                );
                await this.inventoryService.updateBatchQuantity(
                    batch.id,
                    -quantityToReduce,
                );
                remainingQuantity -= quantityToReduce;
            }
        }

        if (remainingQuantity > 0) {
            throw new BadRequestException(
                `Stock insuficiente para el producto ${productId}`,
            );
        }
    }

    async addPayment(
        saleId: string,
        paymentDto: { amountUsd: number; amountBs: number },
    ): Promise<Sale> {
        const sale = await this.findOne(saleId);

        if (!sale) {
            throw new NotFoundException(`Venta con ID "${saleId}" no encontrada`);
        }

        if (!sale.customerId) {
            throw new BadRequestException(
                'Solo se pueden registrar abonos en ventas a crédito',
            );
        }

        // Buscar la cuenta pendiente (customer_account) de esta venta
        const customerAccount = await this.customerAccountRepository.findOne({
            where: { saleId: sale.id },
        });

        if (!customerAccount) {
            throw new BadRequestException(
                'No existe una deuda pendiente para esta venta',
            );
        }

        // Obtener la tasa de cambio actual
        const currentExchangeRate = await this.exchangeRatesService.getCurrentRate();

        // Crear registros de pago en customer_payments
        if (paymentDto.amountUsd > 0) {
            const paymentUsd = new CustomerPayment();
            paymentUsd.customerId = sale.customerId;
            paymentUsd.customerAccountId = customerAccount.id;
            paymentUsd.amountUsd = paymentDto.amountUsd;
            paymentUsd.paidInCurrency = PaymentCurrency.USD;
            paymentUsd.amountPaidInOriginalCurrency = paymentDto.amountUsd;
            paymentUsd.exchangeRateId = currentExchangeRate.id;
            await this.customerPaymentRepository.save(paymentUsd);
        }

        if (paymentDto.amountBs > 0) {
            const paymentBs = new CustomerPayment();
            paymentBs.customerId = sale.customerId;
            paymentBs.customerAccountId = customerAccount.id;
            paymentBs.amountUsd = Math.round(
                (paymentDto.amountBs / currentExchangeRate.rate) * 100,
            ) / 100;
            paymentBs.paidInCurrency = PaymentCurrency.BS;
            paymentBs.amountPaidInOriginalCurrency = paymentDto.amountBs;
            paymentBs.exchangeRateId = currentExchangeRate.id;
            await this.customerPaymentRepository.save(paymentBs);
        }

        // Retornar la venta actualizada con los nuevos pagos
        return this.findOne(saleId);
    }
}
