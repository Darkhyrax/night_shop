import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { Sale, SaleStatus } from '../../types';
import SaleDetailsModal from './components/SaleDetailsModal';
import PaymentModal from './components/PaymentModal';

const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      setSales(response.data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePaymentSuccess = async () => {
    // Refrescar todas las ventas
    await fetchSales();
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Actualizar selectedSale cuando cambia la lista de ventas
  useEffect(() => {
    if (selectedSale && sales.length > 0) {
      const updatedSale = sales.find((s: Sale) => s.id === selectedSale.id);
      if (updatedSale && JSON.stringify(updatedSale) !== JSON.stringify(selectedSale)) {
        setSelectedSale(updatedSale);
      }
    }
  }, [sales, selectedSale?.id]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value: number | null | undefined, isBs: boolean = false) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return isBs ? 'Bs. 0.00' : '$0.00';
    }
    
    const numValue = Number(value);
    
    return isBs 
      ? `Bs. ${numValue.toFixed(2)}` 
      : `$${numValue.toFixed(2)}`;
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
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.COMPLETED:
        return 'Completado';
      case SaleStatus.PENDING:
        return 'Pendiente';
      default:
        return status;
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
          onClick={() => navigate('/sales/create')}
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
                    <TableCell>Cliente</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Total USD</TableCell>
                    <TableCell align="right">Total Bs</TableCell>
                    <TableCell align="right">Pagado USD</TableCell>
                    <TableCell align="right">Pagado Bs</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sale) => (
                      <TableRow hover key={sale.id}>
                        <TableCell>{sale.customerId ? `${sale.customer?.firstName} ${sale.customer?.lastName}` : 'Cliente General'}</TableCell>
                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.totalAmountUsd, false)}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.totalAmountBs, true)}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.paidAmountUsd, false)}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.paidAmountBs, true)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(sale.status)} 
                            color={getStatusColor(sale.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Ver Detalles">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setDetailsModalOpen(true);
                                }}
                              >
                                <SearchIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {sale.customerId && sale.saleType === 'credit' && sale.status === SaleStatus.PENDING && (sale.totalAmountUsd - (sale.paidAmountUsd || 0)) > 0 && (
                              <Tooltip title="Abonar">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => {
                                    setSelectedSale(sale);
                                    setPaymentModalOpen(true);
                                  }}
                                >
                                  <AttachMoneyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  {sales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
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
      {selectedSale && (
        <>
          <SaleDetailsModal 
            open={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            sale={selectedSale}
          />
          <PaymentModal 
            open={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            sale={selectedSale}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </>
      )}
    </MainLayout>
  );
};

export default Sales;
