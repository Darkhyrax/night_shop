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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
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
  const [fixStatusDialogOpen, setFixStatusDialogOpen] = useState(false);
  const [fixingStatuses, setFixingStatuses] = useState(false);
  const [fixStatusResult, setFixStatusResult] = useState<any>(null);

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

  const handleFixSaleStatuses = async () => {
    try {
      setFixingStatuses(true);
      const response = await api.post('/sales/fix/statuses');
      setFixStatusResult(response.data);
      // Refrescar las ventas después de la corrección
      await fetchSales();
    } catch (error) {
      console.error('Error al corregir estados de ventas:', error);
      setFixStatusResult({ error: 'Error al corregir estados de ventas' });
    } finally {
      setFixingStatuses(false);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Corregir estados de ventas con deuda completada">
            <Button 
              variant="outlined" 
              color="warning" 
              startIcon={<BuildIcon />}
              onClick={() => setFixStatusDialogOpen(true)}
              disabled={fixingStatuses}
            >
              Corregir Estados
            </Button>
          </Tooltip>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/sales/create')}
          >
            Nueva Venta
          </Button>
        </Box>
      </Box>

      {/* Dialog de confirmación para corregir estados */}
      <Dialog
        open={fixStatusDialogOpen}
        onClose={() => setFixStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Corregir Estados de Ventas</DialogTitle>
        <DialogContent>
          {!fixStatusResult ? (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Esta operación verificará todas las ventas PENDING y las marcará como COMPLETED si su deuda está completamente pagada.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ¿Deseas continuar?
              </Typography>
            </Box>
          ) : fixStatusResult.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {fixStatusResult.error}
            </Alert>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Corrección completada exitosamente
              </Alert>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Ventas verificadas:</strong> {fixStatusResult.totalChecked}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Ventas corregidas:</strong> {fixStatusResult.totalFixed}
              </Typography>
              {fixStatusResult.fixedSales && fixStatusResult.fixedSales.length > 0 && (
                <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                    Detalles de correcciones:
                  </Typography>
                  {fixStatusResult.fixedSales.map((sale: any, index: number) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      • Venta {sale.saleId.substring(0, 8)}... → COMPLETED
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!fixStatusResult ? (
            <>
              <Button 
                onClick={() => setFixStatusDialogOpen(false)}
                variant="outlined"
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleFixSaleStatuses}
                variant="contained"
                color="warning"
                disabled={fixingStatuses}
              >
                {fixingStatuses ? <CircularProgress size={24} /> : 'Corregir'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => {
                setFixStatusDialogOpen(false);
                setFixStatusResult(null);
              }}
              variant="contained"
              color="primary"
            >
              Cerrar
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
                  <TableRow sx={{ 
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}>
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
