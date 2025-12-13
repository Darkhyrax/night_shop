import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerAccount } from './entities/customer-account.entity';
import { CustomerPayment, PaymentCurrency } from './entities/customer-payment.entity';
import { Sale, SaleStatus, SaleType } from '../sales/entities/sale.entity';
import { ExchangeRate } from '../exchange-rates/entities/exchange-rate.entity';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        @InjectRepository(CustomerAccount)
        private customerAccountRepository: Repository<CustomerAccount>,
        @InjectRepository(CustomerPayment)
        private customerPaymentRepository: Repository<CustomerPayment>,
        @InjectRepository(Sale)
        private salesRepository: Repository<Sale>,
        @InjectRepository(ExchangeRate)
        private exchangeRateRepository: Repository<ExchangeRate>,
    ) {}

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        // Verificar si ya existe un cliente con el mismo DNI
        const existingCustomer = await this.customersRepository.findOne({
            where: { dni: createCustomerDto.dni },
        });

        if (existingCustomer) {
            throw new ConflictException(
                `Ya existe un cliente con el DNI ${createCustomerDto.dni}`,
            );
        }

        const customer = this.customersRepository.create(createCustomerDto);
        return this.customersRepository.save(customer);
    }

    async findAll(): Promise<Customer[]> {
        return this.customersRepository.find({
            where: { isActive: true },
            order: { lastName: 'ASC', firstName: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Customer> {
        const customer = await this.customersRepository.findOne({
            where: { id },
        });

        if (!customer) {
            throw new NotFoundException(`Cliente con ID "${id}" no encontrado`);
        }

        return customer;
    }

    async findByDni(dni: string): Promise<Customer> {
        const customer = await this.customersRepository.findOne({
            where: { dni },
        });

        if (!customer) {
            throw new NotFoundException(
                `Cliente con DNI "${dni}" no encontrado`,
            );
        }

        return customer;
    }

    async update(
        id: string,
        updateCustomerDto: UpdateCustomerDto,
    ): Promise<Customer> {
        const customer = await this.findOne(id);

        // Si se está actualizando el DNI, verificar que no exista otro cliente con ese DNI
        if (updateCustomerDto.dni && updateCustomerDto.dni !== customer.dni) {
            const existingCustomer = await this.customersRepository.findOne({
                where: { dni: updateCustomerDto.dni },
            });

            if (existingCustomer) {
                throw new ConflictException(
                    `Ya existe un cliente con el DNI ${updateCustomerDto.dni}`,
                );
            }
        }

        Object.assign(customer, updateCustomerDto);

        return this.customersRepository.save(customer);
    }

    async remove(id: string): Promise<void> {
        const customer = await this.findOne(id);
        customer.isActive = false;
        await this.customersRepository.save(customer);
    }

    async getCustomerDebts(customerId: string): Promise<any> {
        // Obtener todas las cuentas pendientes del cliente con sus ventas
        const accounts = await this.customerAccountRepository.find({
            where: { customerId },
            relations: ['sale', 'payments'],
            order: { createdAt: 'DESC' },
        });

        console.log(`[DEBUG] Customer ${customerId} has ${accounts.length} pending accounts`);

        // Calcular deuda total y obtener información de pagos
        let totalDebtUsd = 0;
        const debtsWithPayments: any[] = [];

        for (const account of accounts) {
            // Filtrar solo ventas a crédito (CREDIT)
            // Incluir tanto PENDING como COMPLETED si tienen pagos pendientes
            if (
                !account.sale ||
                account.sale.saleType !== SaleType.CREDIT
            ) {
                console.log(
                    `[DEBUG] Account ${account.id} filtered out: saleType=${account.sale?.saleType}, status=${account.sale?.status}`,
                );
                continue;
            }

            // Obtener los pagos de esta cuenta
            const payments = await this.customerPaymentRepository.find({
                where: { customerAccountId: account.id },
                relations: ['exchangeRate'],
                order: { createdAt: 'DESC' },
            });

            console.log(`[DEBUG] Account ${account.id} (Sale ${account.saleId}): Debt ${account.debtUsd}, Payments: ${payments.length}`);
            payments.forEach((p: any) => {
                console.log(`  [DEBUG] Payment: amountUsd=${p.amountUsd}, paidInCurrency=${p.paidInCurrency}, amountPaidInOriginalCurrency=${p.amountPaidInOriginalCurrency}`);
            });

            // Convertir a número para evitar concatenación de strings
            const debtAmount = parseFloat(account.debtUsd.toString());
            totalDebtUsd += debtAmount;

            debtsWithPayments.push({
                ...account,
                payments,
            });
        }

        // Redondear a 2 decimales
        totalDebtUsd = Math.round(totalDebtUsd * 100) / 100;
        console.log(`[DEBUG] Total debt for customer ${customerId}: ${totalDebtUsd}`);

        return {
            customerId,
            totalDebtUsd,
            accounts: debtsWithPayments,
        };
    }

    async addPaymentToCustomerDebts(
        customerId: string,
        paymentUsd: number,
        paymentBs: number,
        exchangeRateId?: number,
    ): Promise<any> {
        // Obtener todas las cuentas pendientes del cliente ordenadas por fecha (más antiguas primero)
        const accounts = await this.customerAccountRepository.find({
            where: { customerId },
            order: { createdAt: 'ASC' }, // FIFO: más antiguas primero
        });

        if (accounts.length === 0) {
            throw new NotFoundException(
                'El cliente no tiene deudas pendientes',
            );
        }

        // Obtener la tasa de cambio actual o usar la proporcionada
        let exchangeRate = 267.75; // Valor por defecto
        let currentExchangeRateEntity: ExchangeRate | null = null;

        if (exchangeRateId) {
            // Buscar la tasa de cambio más reciente
            currentExchangeRateEntity = await this.exchangeRateRepository.findOne({
                order: { createdAt: 'DESC' },
            });
            if (currentExchangeRateEntity) {
                exchangeRate = parseFloat(currentExchangeRateEntity.rate.toString());
            }
        }

        // Convertir pagos a USD equivalente
        const totalPaymentUsd =
            paymentUsd + paymentBs / exchangeRate;

        let remainingPaymentUsd = totalPaymentUsd;
        const paymentsCreated: any[] = [];

        // Distribuir el pago entre las cuentas (FIFO)
        for (const account of accounts) {
            if (remainingPaymentUsd <= 0) break;

            // Calcular cuánto se abona a esta cuenta
            const debtAmount = parseFloat(account.debtUsd.toString());
            const paymentForThisAccount = Math.min(
                remainingPaymentUsd,
                debtAmount,
            );

            if (paymentForThisAccount > 0) {
                // Crear registro de pago
                const payment = new CustomerPayment();
                payment.customerId = customerId;
                payment.customerAccountId = account.id;
                payment.amountUsd =
                    Math.round(paymentForThisAccount * 100) / 100;
                payment.paidInCurrency =
                    paymentUsd > 0
                        ? PaymentCurrency.USD
                        : PaymentCurrency.BS;
                payment.amountPaidInOriginalCurrency =
                    paymentUsd > 0 ? paymentForThisAccount : paymentBs;
                payment.isInitialPayment = false;
                // Asignar la tasa de cambio al pago
                if (currentExchangeRateEntity) {
                    payment.exchangeRateId = currentExchangeRateEntity.id;
                }

                const savedPayment =
                    await this.customerPaymentRepository.save(payment);
                paymentsCreated.push(savedPayment);

                // Actualizar deuda de la cuenta usando update directo
                const newDebt = debtAmount - paymentForThisAccount;
                const roundedNewDebt = Math.round(newDebt * 100) / 100;
                await this.customerAccountRepository.update(
                    { id: account.id },
                    { debtUsd: roundedNewDebt },
                );

                // Si la deuda se pagó completamente, marcar la venta como completada
                if (roundedNewDebt === 0) {
                    await this.salesRepository.update(
                        { id: account.saleId },
                        { status: SaleStatus.COMPLETED },
                    );
                }

                remainingPaymentUsd -= paymentForThisAccount;
            }
        }

        return {
            customerId,
            totalPaymentUsd: Math.round(totalPaymentUsd * 100) / 100,
            paymentsCreated,
            remainingDebt: Math.max(0, remainingPaymentUsd),
        };
    }
}
