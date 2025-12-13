import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerAccount } from '../customers/entities/customer-account.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Sale)
        private salesRepository: Repository<Sale>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        @InjectRepository(CustomerAccount)
        private customerAccountRepository: Repository<CustomerAccount>,
    ) {}

    // Reportes de Ventas
    async getSalesReport(
        startDate?: string,
        endDate?: string,
        limit = 10,
        offset = 0,
    ) {
        const query = this.salesRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.customer', 'customer')
            .leftJoinAndSelect('sale.saleDetails', 'saleDetails')
            .leftJoinAndSelect('saleDetails.product', 'product');

        if (startDate && endDate) {
            query.where('sale.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        } else if (startDate) {
            query.where('sale.createdAt >= :startDate', {
                startDate: new Date(startDate),
            });
        } else if (endDate) {
            query.where('sale.createdAt <= :endDate', {
                endDate: new Date(endDate),
            });
        }

        const [sales, total] = await query
            .orderBy('sale.createdAt', 'DESC')
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return {
            data: sales,
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
        };
    }

    // Resumen de Ventas por Período
    async getSalesSummary(startDate?: string, endDate?: string) {
        const query = this.salesRepository.createQueryBuilder('sale');

        if (startDate && endDate) {
            query.where('sale.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        } else if (startDate) {
            query.where('sale.createdAt >= :startDate', {
                startDate: new Date(startDate),
            });
        } else if (endDate) {
            query.where('sale.createdAt <= :endDate', {
                endDate: new Date(endDate),
            });
        }

        const sales = await query.getMany();

        // Obtener todas las cuentas de cliente con sus pagos para el período
        const accountsQuery = this.customerAccountRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.payments', 'payments');

        if (startDate && endDate) {
            accountsQuery.where('account.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        } else if (startDate) {
            accountsQuery.where('account.createdAt >= :startDate', {
                startDate: new Date(startDate),
            });
        } else if (endDate) {
            accountsQuery.where('account.createdAt <= :endDate', {
                endDate: new Date(endDate),
            });
        }

        const accounts = await accountsQuery.getMany();

        // Calcular ingresos: pagado de contado + abonos en sus monedas respectivas
        let totalPaidUsd = 0;
        let totalPaidBs = 0;

        // Sumar lo pagado de contado de las ventas
        sales.forEach((sale) => {
            totalPaidUsd += Number(sale.paidAmountUsd);
            totalPaidBs += Number(sale.paidAmountBs);
        });

        // Sumar abonos posteriores desde las cuentas de cliente
        accounts.forEach((account) => {
            if (account.payments && account.payments.length > 0) {
                account.payments.forEach((payment: any) => {
                    // Si el pago fue en USD, sumar a totalPaidUsd
                    if (payment.paidInCurrency === 'usd') {
                        totalPaidUsd += Number(payment.amountUsd || 0);
                    }
                    // Si el pago fue en Bs, sumar a totalPaidBs
                    else if (payment.paidInCurrency === 'bs') {
                        totalPaidBs += Number(payment.amountPaidInOriginalCurrency || 0);
                    }
                });
            }
        });

        const completedCount = sales.filter((s) => s.status === 'completed').length;
        const pendingCount = sales.filter((s) => s.status === 'pending').length;
        const cashCount = sales.filter((s) => s.saleType === 'cash').length;
        const creditCount = sales.filter((s) => s.saleType === 'credit').length;
        const totalUsd = sales.reduce(
            (sum, s) => sum + Number(s.totalAmountUsd),
            0,
        );
        const pendingUsd = sales.reduce((sum, s) => {
            if (s.status === 'pending') {
                return (
                    sum + (Number(s.totalAmountUsd) - Number(s.paidAmountUsd))
                );
            }
            return sum;
        }, 0);

        const summary = {
            totalSales: sales.length,
            completedSales: completedCount,
            pendingSales: pendingCount,
            cashSales: cashCount,
            creditSales: creditCount,
            totalUsd, // Ingresos USD esperado (todas las ventas)
            totalBs: totalPaidBs, // Ingresos Bs pagado en Bs
            paidUsd: totalPaidUsd, // Ingreso Real USD (contado + abonos en USD)
            paidBs: totalPaidBs, // Pagado Bs (contado + abonos en Bs)
            pendingUsd,
        };

        return summary;
    }

    // Productos Más Vendidos
    async getTopProducts(limit = 10, startDate?: string, endDate?: string) {
        const query = this.salesRepository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.saleDetails', 'saleDetails')
            .leftJoinAndSelect('saleDetails.product', 'product');

        if (startDate && endDate) {
            query.where('sale.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        } else if (startDate) {
            query.where('sale.createdAt >= :startDate', {
                startDate: new Date(startDate),
            });
        } else if (endDate) {
            query.where('sale.createdAt <= :endDate', {
                endDate: new Date(endDate),
            });
        }

        const sales = await query.getMany();

        const productMap = new Map<string, any>();

        sales.forEach((sale) => {
            sale.saleDetails.forEach((detail) => {
                const productId = detail.product.id;
                if (!productMap.has(productId)) {
                    productMap.set(productId, {
                        id: detail.product.id,
                        name: detail.product.name,
                        totalQuantitySold: 0,
                        totalRevenueUsd: 0,
                        totalRevenueBs: 0,
                        averagePrice: detail.product.currentSellingPrice,
                    });
                }
                const product = productMap.get(productId);
                product.totalQuantitySold += detail.quantity;
                product.totalRevenueUsd += Number(detail.subtotalUsd);
                product.totalRevenueBs += Number(detail.subtotalBs);
            });
        });

        const topProducts = Array.from(productMap.values())
            .filter((p) => p.totalQuantitySold > 0)
            .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
            .slice(0, limit);

        return topProducts;
    }

    // Clientes con Mayor Deuda
    async getTopDebtors(limit = 10) {
        const accounts = await this.customerAccountRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.customer', 'customer')
            .getMany();

        const debtorMap = new Map<string, any>();

        accounts.forEach((account) => {
            const customerId = account.customer.id;
            if (!debtorMap.has(customerId)) {
                debtorMap.set(customerId, {
                    id: account.customer.id,
                    firstName: account.customer.firstName,
                    lastName: account.customer.lastName,
                    email: account.customer.email,
                    phone: account.customer.phone,
                    totalDebtUsd: 0,
                    accountsCount: 0,
                });
            }
            const debtor = debtorMap.get(customerId);
            debtor.totalDebtUsd += Number(account.debtUsd);
            debtor.accountsCount += 1;
        });

        const debtors = Array.from(debtorMap.values())
            .filter((c) => c.totalDebtUsd > 0)
            .sort((a, b) => b.totalDebtUsd - a.totalDebtUsd)
            .slice(0, limit);

        return debtors;
    }

    // Clientes Más Activos (por cantidad de compras)
    async getTopCustomers(limit = 10, startDate?: string, endDate?: string) {
        const query = this.customersRepository
            .createQueryBuilder('customer')
            .leftJoinAndSelect('customer.sales', 'sales');

        if (startDate && endDate) {
            query.where('sales.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        } else if (startDate) {
            query.where('sales.createdAt >= :startDate', {
                startDate: new Date(startDate),
            });
        } else if (endDate) {
            query.where('sales.createdAt <= :endDate', {
                endDate: new Date(endDate),
            });
        }

        const customers = await query.getMany();

        const topCustomers = customers
            .map((c) => ({
                id: c.id,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                phone: c.phone,
                totalPurchases: c.sales.length,
                totalSpentUsd: c.sales.reduce(
                    (sum, s) => sum + Number(s.totalAmountUsd),
                    0,
                ),
                totalSpentBs: c.sales.reduce(
                    (sum, s) => sum + Number(s.totalAmountBs),
                    0,
                ),
            }))
            .filter((c) => c.totalPurchases > 0)
            .sort((a, b) => b.totalPurchases - a.totalPurchases)
            .slice(0, limit);

        return topCustomers;
    }

    // Inventario Bajo
    async getLowStockProducts(threshold = 10) {
        const products = await this.productsRepository.find();

        return products
            .filter((p) => p.totalStock <= threshold && p.isActive)
            .map((p) => ({
                id: p.id,
                name: p.name,
                currentStock: p.totalStock,
                threshold,
                sellingPrice: p.currentSellingPrice,
            }))
            .sort((a, b) => a.currentStock - b.currentStock);
    }
}
