import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, SaleStatus } from './entities/sale.entity';
import { CustomerAccount } from '../customers/entities/customer-account.entity';
import { CustomerPayment } from '../customers/entities/customer-payment.entity';

@Injectable()
export class FixSaleStatusService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(CustomerAccount)
    private customerAccountRepository: Repository<CustomerAccount>,
    @InjectRepository(CustomerPayment)
    private customerPaymentRepository: Repository<CustomerPayment>,
  ) {}

  async fixSaleStatuses(): Promise<{
    totalChecked: number;
    totalFixed: number;
    fixedSales: Array<{ saleId: string; previousStatus: string; newStatus: string; debtUsdUpdated: boolean }>;
  }> {
    // Obtener todas las ventas PENDING
    const pendingSales = await this.salesRepository.find({
      where: { status: SaleStatus.PENDING },
    });

    const fixedSales: Array<{ saleId: string; previousStatus: string; newStatus: string; debtUsdUpdated: boolean }> = [];

    for (const sale of pendingSales) {
      // Obtener la cuenta pendiente de esta venta
      const customerAccount = await this.customerAccountRepository.findOne({
        where: { saleId: sale.id },
      });

      // Si no hay cuenta pendiente, la venta debería estar COMPLETED
      if (!customerAccount) {
        sale.status = SaleStatus.COMPLETED;
        await this.salesRepository.save(sale);
        fixedSales.push({
          saleId: sale.id,
          previousStatus: SaleStatus.PENDING,
          newStatus: SaleStatus.COMPLETED,
          debtUsdUpdated: false,
        });
        continue;
      }

      // Calcular la deuda real comparando el total de la venta contra los pagos registrados
      const totalSaleUsd = parseFloat(sale.totalAmountUsd?.toString() || '0');

      // Obtener todos los pagos registrados para esta cuenta
      const payments = await this.customerPaymentRepository.find({
        where: { customerAccountId: customerAccount.id },
      });

      // Sumar todos los pagos en USD
      const totalPaidUsd = payments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amountUsd?.toString() || '0');
      }, 0);

      // Calcular la deuda real
      const realDebtUsd = totalSaleUsd - totalPaidUsd;
      // Si la deuda es negativa, cerrar en 0.00
      const finalDebtUsd = Math.max(0, realDebtUsd);
      const roundedRealDebtUsd = Math.round(finalDebtUsd * 100) / 100;

      // Actualizar debtUsd en customer_accounts si es diferente
      let debtUsdUpdated = false;
      const currentDebtUsd = parseFloat(customerAccount.debtUsd?.toString() || '0');

      if (Math.abs(currentDebtUsd - roundedRealDebtUsd) > 0.01) {
        await this.customerAccountRepository.update(
          { id: customerAccount.id },
          { debtUsd: roundedRealDebtUsd },
        );
        debtUsdUpdated = true;
      }

      // Si la deuda real es 0 o negativa, marcar como COMPLETED
      if (roundedRealDebtUsd <= 0) {
        sale.status = SaleStatus.COMPLETED;
        await this.salesRepository.save(sale);
        fixedSales.push({
          saleId: sale.id,
          previousStatus: SaleStatus.PENDING,
          newStatus: SaleStatus.COMPLETED,
          debtUsdUpdated,
        });
      } else if (debtUsdUpdated) {
        // Si solo se actualizó debtUsd pero la venta sigue PENDING
        fixedSales.push({
          saleId: sale.id,
          previousStatus: SaleStatus.PENDING,
          newStatus: SaleStatus.PENDING,
          debtUsdUpdated: true,
        });
      }
    }

    return {
      totalChecked: pendingSales.length,
      totalFixed: fixedSales.length,
      fixedSales,
    };
  }
}
