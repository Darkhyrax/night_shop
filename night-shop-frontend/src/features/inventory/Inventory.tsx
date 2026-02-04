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
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { InventoryBatch, Product } from '../../types';
import InventoryBatchFormDialog from './InventoryBatchFormDialog';
import InventoryBatchEditDialog from './InventoryBatchEditDialog';
import { useSnackbar } from 'notistack';

const Inventory: React.FC = () => {
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<InventoryBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/inventory/batches');
      setInventoryBatches(response.data);
      setFilteredBatches(response.data);
    } catch (error: any) {
      console.error('Error al cargar inventario:', error);
      setError(error.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredBatches(inventoryBatches);
      return;
    }

    const filtered = inventoryBatches.filter(batch => {
      const product = products.find(p => p.id === batch.productId);
      return (
        batch.batchCode.toLowerCase().includes(searchValue) ||
        (product && product.name.toLowerCase().includes(searchValue))
      );
    });

    setFilteredBatches(filtered);
    setPage(0);
  };

  // Manejar apertura del formulario
  const handleOpenFormDialog = () => {
    setSelectedBatch(null);
    setFormDialogOpen(true);
  };

  // Manejar cierre del formulario
  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
  };

  // Manejar guardado de lote
  const handleSaveBatch = async (values: any) => {
    try {
      await api.post('/inventory/batches', values);
      enqueueSnackbar('Lote registrado exitosamente', { variant: 'success' });
      fetchInventory();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error al registrar lote', { variant: 'error' });
      throw error;
    }
  };

  // Manejar eliminación de lote
  const handleDeleteClick = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBatch) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      await api.delete(`/inventory/batches/${selectedBatch.id}`);
      enqueueSnackbar('Lote eliminado exitosamente', { variant: 'success' });
      fetchInventory();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      // Intentar obtener el mensaje de error del servidor
      let errorMessage = 'Error al eliminar lote';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setDeleteError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Manejar visualización de detalles
  const handleViewDetails = async (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setDetailsDialogOpen(true);
    
    // Cargar la tasa de cambio actual
    try {
      const response = await api.get('/exchange-rates/current');
      setExchangeRate(Number(response.data.rate));
    } catch (error) {
      console.error('Error al cargar tasa de cambio:', error);
      setExchangeRate(1); // Valor por defecto
    }
  };

  // Manejar edición de lote
  const handleEditClick = async (batch: InventoryBatch) => {
    // Verificar si el lote tiene ventas asociadas
    try {
      const response = await api.get(`/inventory/batches/${batch.id}`);
      // Si llegamos aquí, el lote existe
      // Abrimos el diálogo de edición con los datos del lote
      setSelectedBatch(batch);
      setEditDialogOpen(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar el lote';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Obtener nombre del producto
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'N/A';
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

  return (
    <MainLayout title="Inventario">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Gestión de Inventario
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenFormDialog}
          disabled={loading}
        >
          Nuevo Lote
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por código de lote o nombre de producto"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
                    <TableCell>Código</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Costo Unitario</TableCell>
                    <TableCell align="right">Precio Venta</TableCell>
                    <TableCell>Fecha de Compra</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBatches
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((batch) => (
                      <TableRow hover key={batch.id}>
                        <TableCell>{batch.batchCode || <em style={{ color: '#999' }}>Sin código</em>}</TableCell>
                        <TableCell>{getProductName(batch.productId)}</TableCell>
                        <TableCell align="right">{batch.currentQuantity}</TableCell>
                        <TableCell align="right">{formatCurrency(batch.unitCostUsd, false)}</TableCell>
                        <TableCell align="right">{formatCurrency(batch.sellingPriceUsd, false)}</TableCell>
                        <TableCell>{formatDate(batch.purchaseDate)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(batch)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleEditClick(batch)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(batch)}
                              disabled={deleting}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredBatches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay lotes de inventario disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBatches.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}
      </Paper>

      {/* Diálogo de formulario para nuevo lote */}
      <InventoryBatchFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSave={handleSaveBatch}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteError(null);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            ¿Está seguro que desea eliminar este lote? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteError(null);
            }} 
            disabled={deleting}
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
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles del lote */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
          Detalles del Lote de Compra
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedBatch && (
            <Grid container spacing={3}>
              {/* Información General */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : '#f5f5f5', 
                  borderLeft: (theme) => `4px solid ${theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.6)' : '#1976d2'}`,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      📋 Información General
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Código del Lote</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedBatch.batchCode}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Producto</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{getProductName(selectedBatch.productId)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Fecha de Compra</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatDate(selectedBatch.purchaseDate)}</Typography>
                      </Box>
                      {selectedBatch.expirationDate && (
                        <Box>
                          <Typography variant="caption" color="textSecondary">Fecha de Vencimiento</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            {formatDate(selectedBatch.expirationDate)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Moneda de Pago y Tasa de Cambio */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ 
                  backgroundColor: (theme) => selectedBatch.costCurrency === 'usd' 
                    ? (theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.15)' : '#e3f2fd')
                    : (theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0'),
                  borderLeft: (theme) => selectedBatch.costCurrency === 'usd' 
                    ? `4px solid ${theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.6)' : '#1976d2'}`
                    : `4px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.6)' : '#f57c00'}`,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      💳 Moneda de Pago
                    </Typography>
                    <Chip
                      label={selectedBatch.costCurrency === 'usd' ? 'Pagado en USD' : 'Pagado en Bolívares'}
                      color={selectedBatch.costCurrency === 'usd' ? 'primary' : 'warning'}
                      variant="filled"
                      sx={{ mt: 1, fontSize: '1rem', padding: '20px 10px' }}
                    />
                    {selectedBatch.purchaseExchangeRate && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">Tasa de Cambio del Día</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          1 USD = {Number(selectedBatch.purchaseExchangeRate.rate).toFixed(2)} Bs
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Cantidades */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.15)' : '#f3e5f5',
                  borderLeft: (theme) => `4px solid ${theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.6)' : '#7b1fa2'}`,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.8)' : '#7b1fa2' }}>
                      📦 Cantidades
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Cantidad Inicial</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedBatch.initialQuantity}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Cantidad Actual</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedBatch.currentQuantity}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">Porcentaje de Ganancia</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {selectedBatch.profitPercentage}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Costos */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(194, 24, 91, 0.15)' : '#fce4ec',
                  borderLeft: (theme) => `4px solid ${theme.palette.mode === 'dark' ? 'rgba(194, 24, 91, 0.6)' : '#c2185b'}`,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(194, 24, 91, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? 'rgba(194, 24, 91, 0.8)' : '#c2185b' }}>
                      💰 Costo Total
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">USD</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formatCurrency(selectedBatch.totalCostUsd, false)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Bolívares</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formatCurrency(selectedBatch.totalCostBs, true)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Costo Unitario */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.15)' : '#e8f5e9',
                  borderLeft: (theme) => `4px solid ${theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.6)' : '#388e3c'}`,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.8)' : '#388e3c' }}>
                      🏷️ Costo Unitario
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">USD</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formatCurrency(selectedBatch.unitCostUsd, false)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Bolívares</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formatCurrency(selectedBatch.unitCostBs, true)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Precio de Venta */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : '#c8e6c9',
                  borderLeft: (theme) => `4px solid ${theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.6)' : '#2e7d32'}`,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.8)' : '#2e7d32' }}>
                      ✅ Precio de Venta (con {selectedBatch.profitPercentage}% de ganancia)
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Precio en USD</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                          {formatCurrency(selectedBatch.sellingPriceUsd, false)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Precio en Bs</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                          {formatCurrency(selectedBatch.sellingPriceUsd * (exchangeRate || 1), true)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición de lote */}
      <InventoryBatchEditDialog
        open={editDialogOpen}
        batch={selectedBatch}
        onClose={() => setEditDialogOpen(false)}
        onSave={fetchInventory}
      />
    </MainLayout>
  );
};

export default Inventory;
