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
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { Product, Sale, SaleStatus, CurrencyType } from '../../types';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    salesThisMonth: 0,
    pendingSales: 0,
    revenue: {
      usd: 0,
      bs: 0
    }
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // En un escenario real, estas serían llamadas a endpoints específicos del dashboard
        // Por ahora simulamos con llamadas a los endpoints básicos

        // Obtener productos
        const productsResponse = await api.get('/products');
        const products = productsResponse.data;

        // Obtener ventas
        const salesResponse = await api.get('/sales');
        const sales = salesResponse.data;

        // Filtrar productos con stock bajo (menos de 10 unidades)
        const lowStock = products.filter((product: Product) => product.totalStock < 10);

        // Filtrar ventas de este mes
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const salesThisMonth = sales.filter((sale: Sale) =>
          new Date(sale.createdAt) >= firstDayOfMonth
        );

        // Calcular ingresos
        const revenue = salesThisMonth.reduce((acc: { usd: number, bs: number }, sale: Sale) => {
          if (sale.status === SaleStatus.COMPLETED) {
            if (sale.currency === CurrencyType.USD) {
              acc.usd += sale.totalAmountUsd;
            } else {
              acc.bs += sale.totalAmountBs;
            }
          }
          return acc;
        }, { usd: 0, bs: 0 });

        // Ventas pendientes
        const pendingSales = sales.filter((sale: Sale) =>
          sale.status === SaleStatus.PENDING
        ).length;

        // Actualizar estado
        setStats({
          totalProducts: products.length,
          lowStockProducts: lowStock.length,
          salesThisMonth: salesThisMonth.length,
          pendingSales,
          revenue
        });

        // Guardar ventas recientes y productos con bajo stock para mostrar en listas
        setRecentSales(sales.slice(0, 5)); // Últimas 5 ventas
        setLowStockItems(lowStock.slice(0, 5)); // 5 productos con stock bajo

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number | null | undefined, currency?: string) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return currency?.toLowerCase() === CurrencyType.USD ? '$0.00' : 'Bs. 0.00';
    }
    
    const numValue = Number(value);
    
    if (!currency) {
      return `$${numValue.toFixed(2)}`;
    }
    
    return currency.toLowerCase() === CurrencyType.USD
      ? `$${numValue.toFixed(2)}`
      : `Bs. ${numValue.toFixed(2)}`;
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
        {/* Tarjetas de estadísticas */}
        <Grid size={{xs: 12, md: 3}}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Productos
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalProducts}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              {stats.lowStockProducts} con stock bajo
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 3}}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Ventas del Mes
            </Typography>
            <Typography component="p" variant="h4">
              {stats.salesThisMonth}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              {stats.pendingSales} pendientes
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 3}}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Ingresos USD
            </Typography>
            <Typography component="p" variant="h4">
              {formatCurrency(stats.revenue.usd, CurrencyType.USD)}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Este mes
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 3}}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Ingresos Bs
            </Typography>
            <Typography component="p" variant="h4">
              {formatCurrency(stats.revenue.bs, CurrencyType.BS)}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Este mes
            </Typography>
          </Paper>
        </Grid>

        {/* Ventas recientes */}
        <Grid size={{xs: 12, md: 6}}>
          <Card>
            <CardHeader title="Ventas Recientes" />
            <Divider />
            <CardContent>
              <List>
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <React.Fragment key={sale.id}>
                      <ListItem>
                        <ListItemText
                          primary={`Venta #${sale.id}`}
                          secondary={`${new Date(sale.createdAt).toLocaleDateString()} - ${formatCurrency(sale.currency === CurrencyType.USD ? sale.totalAmountUsd : sale.totalAmountBs, sale.currency)}`}
                        />
                        <Typography variant="body2" color={
                          sale.status === SaleStatus.COMPLETED ? 'success.main' :
                            sale.status === SaleStatus.PENDING ? 'warning.main' : 'error.main'
                        }>
                          {sale.status}
                        </Typography>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay ventas recientes" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Productos con stock bajo */}
        <Grid size={{xs: 12, md: 6}}>
          <Card>
            <CardHeader title="Productos con Stock Bajo" />
            <Divider />
            <CardContent>
              <List>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((product) => (
                    <React.Fragment key={product.id}>
                      <ListItem>
                        <ListItemText
                          primary={product.name}
                          secondary={`Precio: ${formatCurrency(product.currentSellingPrice)}`}
                        />
                        <Typography variant="body2" color="error">
                          Stock: {product.totalStock}
                        </Typography>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay productos con stock bajo" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Dashboard;
