import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  CircularProgress,
  TablePagination,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { Sale, SaleStatus, CurrencyType } from '../../types';

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const response = await api.get('/sales');
        setSales(response.data);
      } catch (error) {
        console.error('Error al cargar ventas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value: number | null | undefined, currency: string) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return currency.toLowerCase() === CurrencyType.USD ? '$0.00' : 'Bs. 0.00';
    }
    
    const numValue = Number(value);
    
    return currency.toLowerCase() === CurrencyType.USD 
      ? `$${numValue.toFixed(2)}` 
      : `Bs. ${numValue.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.COMPLETED:
        return 'success';
      case SaleStatus.PENDING:
        return 'warning';
      case SaleStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <MainLayout title="Ventas">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Gestión de Ventas
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
        >
          Nueva Venta
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Moneda</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sale) => (
                      <TableRow hover key={sale.id}>
                        <TableCell>{sale.id}</TableCell>
                        <TableCell>{sale.customerId ? `Cliente ID: ${sale.customerId}` : 'Cliente General'}</TableCell>
                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.currency.toLowerCase() === CurrencyType.USD ? sale.totalAmountUsd : sale.totalAmountBs, sale.currency)}</TableCell>
                        <TableCell>{sale.currency}</TableCell>
                        <TableCell>
                          <Chip 
                            label={sale.status} 
                            color={getStatusColor(sale.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button size="small" color="primary">
                            Detalles
                          </Button>
                          {sale.status === SaleStatus.PENDING && (
                            <>
                              <Button size="small" color="success">
                                Completar
                              </Button>
                              <Button size="small" color="error">
                                Cancelar
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {sales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay ventas disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sales.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}
      </Paper>
    </MainLayout>
  );
};

export default Sales;
