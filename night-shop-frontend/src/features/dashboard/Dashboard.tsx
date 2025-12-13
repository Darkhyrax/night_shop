import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { Product, Sale, SaleStatus } from '../../types';
import ExchangeRateSyncStatus from './components/ExchangeRateSyncStatus';

interface CustomerDebt {
  customerId: string;
  customerName: string;
  totalDebtUsd: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    salesThisMonth: 0,
    salesThisDay: 0,
    pendingSales: 0,
    totalDebtUsd: 0,
    todaySalesBreakdown: {
      cashCount: 0,
      creditCount: 0,
      cashUsd: 0,
      creditUsd: 0
    },
    revenue: {
      usd: 0,
      bs: 0
    },
    todayRevenue: {
      usd: 0,
      bs: 0
    },
    todayRevenueBreakdown: {
      cashUsd: 0,
      cashBs: 0,
      paymentsUsd: 0,
      paymentsBs: 0,
      changeUsd: 0,
      changeBs: 0,
      netUsd: 0,
      netBs: 0,
      exchangeRate: 0
    },
    revenueBreakdown: {
      cashUsd: 0,
      cashBs: 0,
      paymentsUsd: 0,
      paymentsBs: 0,
      changeUsd: 0,
      changeBs: 0,
      netUsd: 0,
      netBs: 0,
      exchangeRate: 0
    }
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [topDebtors, setTopDebtors] = useState<CustomerDebt[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Obtener productos
        const productsResponse = await api.get('/products');
        const products = productsResponse.data;

        // Obtener ventas
        const salesResponse = await api.get('/sales');
        const sales = salesResponse.data;

        // Obtener clientes
        const customersResponse = await api.get('/customers');
        const customers = customersResponse.data;

        // Obtener tasa de cambio actual
        let currentExchangeRate = 0;
        try {
          const currentRateResponse = await api.get('/exchange-rates/current');
          currentExchangeRate = Number(currentRateResponse.data.rate) || 0;
          console.log('Current Exchange Rate:', currentExchangeRate);
        } catch (error) {
          console.error('Error fetching current exchange rate:', error);
        }

        // Filtrar productos con stock bajo (menos de 10 unidades)
        const lowStock = products.filter((product: Product) => product.totalStock < 10);

        // Calcular fechas
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Filtrar ventas de este mes y de hoy
        const salesThisMonth = sales.filter((sale: Sale) =>
          new Date(sale.createdAt) >= firstDayOfMonth
        );

        const salesThisDay = sales.filter((sale: Sale) => {
          const saleDate = new Date(sale.createdAt);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === today.getTime();
        });

        // Filtrar solo ventas completadas del mes y de hoy
        const completedSalesThisMonth = salesThisMonth.filter((sale: Sale) =>
          sale.status === SaleStatus.COMPLETED
        );

        const completedSalesThisDay = salesThisDay.filter((sale: Sale) =>
          sale.status === SaleStatus.COMPLETED
        );

        // Calcular ingresos del mes (solo completadas)
        const revenue = completedSalesThisMonth.reduce((acc: { usd: number, bs: number }, sale: Sale) => {
          acc.usd += sale.totalAmountUsd;
          acc.bs += sale.totalAmountBs;
          return acc;
        }, { usd: 0, bs: 0 });

        // Calcular ingresos de hoy (solo completadas)
        const todayRevenue = completedSalesThisDay.reduce((acc: { usd: number, bs: number }, sale: Sale) => {
          acc.usd += sale.totalAmountUsd;
          acc.bs += sale.totalAmountBs;
          return acc;
        }, { usd: 0, bs: 0 });

        // Desglose de ventas de hoy por tipo (contado y crédito) - todas las ventas, no solo completadas
        const cashSalesToday = salesThisDay.filter((sale: any) => sale.saleType === 'cash');
        const creditSalesToday = salesThisDay.filter((sale: any) => sale.saleType === 'credit');
        
        const todaySalesBreakdown = {
          cashCount: cashSalesToday.length,
          creditCount: creditSalesToday.length,
          cashUsd: cashSalesToday.reduce((sum: number, sale: Sale) => sum + Number(sale.totalAmountUsd), 0),
          creditUsd: creditSalesToday.reduce((sum: number, sale: Sale) => sum + Number(sale.totalAmountUsd), 0)
        };

        console.log('Today Sales Breakdown:', {
          salesThisDay: salesThisDay.length,
          cashSalesToday: cashSalesToday.length,
          creditSalesToday: creditSalesToday.length,
          todaySalesBreakdown
        });

        // Ventas pendientes
        const pendingSales = sales.filter((sale: Sale) =>
          sale.status === SaleStatus.PENDING
        ).length;

        // Calcular ingresos desglosados por tipo y moneda
        let cashUsd = 0;
        let cashBs = 0;
        let changeUsd = 0;
        let changeBs = 0;
        let paymentsUsd = 0;
        let paymentsBs = 0;

        // Ingresos por ventas de contado completadas del mes
        completedSalesThisMonth.forEach((sale: any) => {
          if (sale.saleType === 'cash') {
            cashUsd += Number(sale.totalAmountUsd) || 0;
            cashBs += Number(sale.totalAmountBs) || 0;
            changeUsd += Number(sale.changeUsd) || 0;
            changeBs += Number(sale.changeBS) || 0;
          }
        });

        // Calcular ingresos desglosados de hoy (similar al del mes)
        let todayCashUsd = 0;
        let todayCashBs = 0;
        let todayChangeUsd = 0;
        let todayChangeBs = 0;
        let todayPaymentsUsd = 0;
        let todayPaymentsBs = 0;

        // Ingresos por ventas de contado completadas de hoy
        completedSalesThisDay.forEach((sale: any) => {
          if (sale.saleType === 'cash') {
            todayCashUsd += Number(sale.totalAmountUsd) || 0;
            todayCashBs += Number(sale.totalAmountBs) || 0;
            todayChangeUsd += Number(sale.changeUsd) || 0;
            todayChangeBs += Number(sale.changeBS) || 0;
          }
        });

        // Obtener deudas y pagos de todos los clientes en una sola pasada
        let totalDebtUsd = 0;
        const debtsByCustomer: { [key: string]: { name: string, debt: number } } = {};

        const processPayments = (accounts: any[], paymentVars: any) => {
          accounts.forEach((account: any) => {
            if (account.payments) {
              account.payments.forEach((payment: any) => {
                const paymentDate = new Date(payment.createdAt);
                if (paymentDate >= firstDayOfMonth) {
                  if (payment.paidInCurrency === 'usd') {
                    paymentVars.paymentsUsd += Number(payment.amountUsd) || 0;
                  } else if (payment.paidInCurrency === 'bs') {
                    paymentVars.paymentsBs += Number(payment.amountPaidInOriginalCurrency) || 0;
                  }

                  if (paymentDate >= today) {
                    if (payment.paidInCurrency === 'usd') {
                      paymentVars.todayPaymentsUsd += Number(payment.amountUsd) || 0;
                    } else if (payment.paidInCurrency === 'bs') {
                      paymentVars.todayPaymentsBs += Number(payment.amountPaidInOriginalCurrency) || 0;
                    }
                  }
                }
              });
            }
          });
        };

        const paymentVars = { paymentsUsd, paymentsBs, todayPaymentsUsd, todayPaymentsBs };

        for (const customer of customers) {
          try {
            const debtsResponse = await api.get(`/customers/${customer.id}/debts`);
            const debt = debtsResponse.data.totalDebtUsd || 0;
            const accounts = debtsResponse.data.accounts || [];
            
            // Sumar deuda total
            totalDebtUsd += debt;
            if (debt > 0) {
              debtsByCustomer[customer.id] = {
                name: `${customer.firstName} ${customer.lastName}`,
                debt
              };
            }

            // Sumar ingresos por abonos en esta misma iteración
            processPayments(accounts, paymentVars);
          } catch (error) {
            // Ignorar errores individuales de clientes
          }
        }

        paymentsUsd = paymentVars.paymentsUsd;
        paymentsBs = paymentVars.paymentsBs;
        todayPaymentsUsd = paymentVars.todayPaymentsUsd;
        todayPaymentsBs = paymentVars.todayPaymentsBs;

        // Calcular neto (ingresos - cambios retornados)
        const netUsd = cashUsd + paymentsUsd - changeUsd;
        const netBs = cashBs + paymentsBs - changeBs;

        // Calcular neto de hoy
        const todayNetUsd = todayCashUsd + todayPaymentsUsd - todayChangeUsd;
        const todayNetBs = todayCashBs + todayPaymentsBs - todayChangeBs;

        // Top 5 deudores
        const topDebtorsArray = Object.entries(debtsByCustomer)
          .map(([customerId, { name, debt }]) => ({
            customerId,
            customerName: name,
            totalDebtUsd: debt
          }))
          .sort((a, b) => b.totalDebtUsd - a.totalDebtUsd)
          .slice(0, 5);

        // Actualizar estado
        setStats({
          totalProducts: products.length,
          lowStockProducts: lowStock.length,
          salesThisMonth: salesThisMonth.length,
          salesThisDay: salesThisDay.length,
          pendingSales,
          totalDebtUsd,
          todaySalesBreakdown,
          revenue,
          todayRevenue,
          todayRevenueBreakdown: {
            cashUsd: todayCashUsd,
            cashBs: todayCashBs,
            paymentsUsd: todayPaymentsUsd,
            paymentsBs: todayPaymentsBs,
            changeUsd: todayChangeUsd,
            changeBs: todayChangeBs,
            netUsd: todayNetUsd,
            netBs: todayNetBs,
            exchangeRate: currentExchangeRate
          },
          revenueBreakdown: {
            cashUsd,
            cashBs,
            paymentsUsd,
            paymentsBs,
            changeUsd,
            changeBs,
            netUsd,
            netBs,
            exchangeRate: currentExchangeRate
          }
        });

        // Guardar datos para mostrar en listas
        setRecentSales(sales.slice(0, 5));
        setLowStockItems(lowStock.slice(0, 5));
        setTopDebtors(topDebtorsArray);

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number | null | undefined, isBs: boolean = false) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return isBs ? 'Bs. 0.00' : '$0.00';
    }
    
    const numValue = Number(value);
    
    return isBs
      ? `Bs. ${numValue.toFixed(2)}`
      : `$${numValue.toFixed(2)}`;
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <Grid container spacing={3}>
        {/* Fila 1: KPIs Pequeños */}
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <Typography component="h2" variant="h6" sx={{ color: '#1976d2' }} gutterBottom>
              💰 Ventas Hoy
            </Typography>
            <Typography component="p" variant="h5" sx={{ fontWeight: 'bold' }}>
              {stats.salesThisDay}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1, fontSize: '0.875rem' }}>
              {formatCurrency(stats.todaySalesBreakdown.cashUsd + stats.todaySalesBreakdown.creditUsd, false)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, backgroundColor: '#f3e5f5', borderLeft: '4px solid #7b1fa2' }}>
            <Typography component="h2" variant="h6" sx={{ color: '#7b1fa2' }} gutterBottom>
              📦 Productos
            </Typography>
            <Typography component="p" variant="h5" sx={{ fontWeight: 'bold' }}>
              {stats.totalProducts}
            </Typography>
            <Typography color="error" sx={{ flex: 1, fontSize: '0.875rem' }}>
              {stats.lowStockProducts} con stock bajo
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, backgroundColor: '#fce4ec', borderLeft: '4px solid #c2185b' }}>
            <Typography component="h2" variant="h6" sx={{ color: '#c2185b' }} gutterBottom>
              📈 Ventas Mes
            </Typography>
            <Typography component="p" variant="h5" sx={{ fontWeight: 'bold' }}>
              {stats.salesThisMonth}
            </Typography>
            <Typography color="warning.main" sx={{ flex: 1, fontSize: '0.875rem' }}>
              {stats.pendingSales} pendientes
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 120, backgroundColor: '#fff3e0', borderLeft: '4px solid #f57c00' }}>
            <Typography component="h2" variant="h6" sx={{ color: '#f57c00' }} gutterBottom>
              ⚠️ Deudas
            </Typography>
            <Typography component="p" variant="h5" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
              {formatCurrency(stats.totalDebtUsd, false)}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1, fontSize: '0.875rem' }}>
              Total adeudado
            </Typography>
          </Paper>
        </Grid>

        {/* Estado de Sincronización de Tasas */}
        <Grid size={{xs: 12}}>
          <ExchangeRateSyncStatus />
        </Grid>

        {/* Fila 2: Ingresos Hoy y Mes (Desglosado) */}
        <Grid size={{xs: 12, md: 6}}>
          <Card>
            <CardHeader title="✅ Ingresos Hoy (Desglosado)" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>USD</Typography>
                  <Box sx={{ fontSize: '0.875rem', mt: 1 }}>
                    <Typography variant="caption">Por Contado: <strong>{formatCurrency(stats.todayRevenueBreakdown.cashUsd, false)}</strong></Typography><br/>
                    <Typography variant="caption">Por Abonos: <strong>{formatCurrency(stats.todayRevenueBreakdown.paymentsUsd, false)}</strong></Typography><br/>
                    <Typography variant="caption" sx={{ color: '#d32f2f' }}>Cambios: <strong>-{formatCurrency(stats.todayRevenueBreakdown.changeUsd, false)}</strong></Typography><br/>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#388e3c' }}>Neto: <strong>{formatCurrency(stats.todayRevenueBreakdown.netUsd, false)}</strong></Typography>
                  </Box>
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f57c00' }}>BOLÍVARES</Typography>
                  <Box sx={{ fontSize: '0.875rem', mt: 1 }}>
                    <Typography variant="caption">Por Contado: <strong>{formatCurrency(stats.todayRevenueBreakdown.cashBs, true)}</strong></Typography><br/>
                    <Typography variant="caption">Por Abonos: <strong>{formatCurrency(stats.todayRevenueBreakdown.paymentsBs, true)}</strong></Typography><br/>
                    <Typography variant="caption" sx={{ color: '#d32f2f' }}>Cambios: <strong>-{formatCurrency(stats.todayRevenueBreakdown.changeBs, true)}</strong></Typography><br/>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#388e3c' }}>Neto: <strong>{formatCurrency(stats.todayRevenueBreakdown.netBs, true)}</strong></Typography>
                    <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                      ≈ {formatCurrency(stats.todayRevenueBreakdown.netBs / (stats.todayRevenueBreakdown.exchangeRate || 1), false)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Tasa del Día: <strong>1 USD = {stats.todayRevenueBreakdown.exchangeRate.toFixed(2)} Bs</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Card>
            <CardHeader title="✅ Ingresos Mes (Desglosado)" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>USD</Typography>
                  <Box sx={{ fontSize: '0.875rem', mt: 1 }}>
                    <Typography variant="caption">Por Contado: <strong>{formatCurrency(stats.revenueBreakdown.cashUsd, false)}</strong></Typography><br/>
                    <Typography variant="caption">Por Abonos: <strong>{formatCurrency(stats.revenueBreakdown.paymentsUsd, false)}</strong></Typography><br/>
                    <Typography variant="caption" sx={{ color: '#d32f2f' }}>Cambios: <strong>-{formatCurrency(stats.revenueBreakdown.changeUsd, false)}</strong></Typography><br/>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#388e3c' }}>Neto: <strong>{formatCurrency(stats.revenueBreakdown.netUsd, false)}</strong></Typography>
                  </Box>
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f57c00' }}>BOLÍVARES</Typography>
                  <Box sx={{ fontSize: '0.875rem', mt: 1 }}>
                    <Typography variant="caption">Por Contado: <strong>{formatCurrency(stats.revenueBreakdown.cashBs, true)}</strong></Typography><br/>
                    <Typography variant="caption">Por Abonos: <strong>{formatCurrency(stats.revenueBreakdown.paymentsBs, true)}</strong></Typography><br/>
                    <Typography variant="caption" sx={{ color: '#d32f2f' }}>Cambios: <strong>-{formatCurrency(stats.revenueBreakdown.changeBs, true)}</strong></Typography><br/>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#388e3c' }}>Neto: <strong>{formatCurrency(stats.revenueBreakdown.netBs, true)}</strong></Typography>
                    <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                      ≈ {formatCurrency(stats.revenueBreakdown.netBs / (stats.revenueBreakdown.exchangeRate || 1), false)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Tasa del Día: <strong>1 USD = {stats.revenueBreakdown.exchangeRate.toFixed(2)} Bs</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fila 3: Clientes con Mayor Deuda y Productos con Stock Bajo */}
        <Grid size={{xs: 12, md: 6}}>
          <Card>
            <CardHeader title="👥 Clientes con Mayor Deuda" />
            <Divider />
            <CardContent>
              {topDebtors.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Cliente</strong></TableCell>
                        <TableCell align="right"><strong>Deuda USD</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topDebtors.map((debtor) => (
                        <TableRow key={debtor.customerId} hover>
                          <TableCell>{debtor.customerName}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                            {formatCurrency(debtor.totalDebtUsd, false)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No hay deudas pendientes</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Productos con Stock Bajo */}
        <Grid size={{xs: 12, md: 6}}>
          <Card>
            <CardHeader title="⚠️ Productos con Stock Bajo" />
            <Divider />
            <CardContent>
              {lowStockItems.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Producto</strong></TableCell>
                        <TableCell align="right"><strong>Stock</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockItems.map((product) => (
                        <TableRow key={product.id} hover sx={{ backgroundColor: product.totalStock === 0 ? '#ffebee' : 'inherit' }}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={product.totalStock}
                              color={product.totalStock === 0 ? 'error' : 'warning'}
                              size="small"
                              variant="filled"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">✅ Todos los productos tienen stock suficiente</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ventas Recientes */}
        <Grid size={{xs: 12}}>
          <Card>
            <CardHeader title="📈 Últimas Ventas" />
            <Divider />
            <CardContent>
              {recentSales.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Fecha</strong></TableCell>
                        <TableCell><strong>Monto USD</strong></TableCell>
                        <TableCell><strong>Monto Bs</strong></TableCell>
                        <TableCell align="center"><strong>Estado</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentSales.map((sale) => (
                        <TableRow key={sale.id} hover>
                          <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{formatCurrency(sale.totalAmountUsd, false)}</TableCell>
                          <TableCell>{formatCurrency(sale.totalAmountBs, true)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={sale.status === SaleStatus.COMPLETED ? 'Completada' : 'Pendiente'}
                              color={sale.status === SaleStatus.COMPLETED ? 'success' : 'warning'}
                              size="small"
                              variant="filled"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No hay ventas registradas</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Dashboard;
