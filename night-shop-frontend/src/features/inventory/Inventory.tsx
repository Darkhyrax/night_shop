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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { InventoryBatch, CurrencyType, Product } from '../../types';
import InventoryBatchFormDialog from './InventoryBatchFormDialog';
import { useSnackbar } from 'notistack';

const Inventory: React.FC = () => {
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<InventoryBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await api.post('/inventory', values);
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
      await api.delete(`/inventory/${selectedBatch.id}`);
      enqueueSnackbar('Lote eliminado exitosamente', { variant: 'success' });
      fetchInventory();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error al eliminar lote', { variant: 'error' });
    }
  };

  // Manejar visualización de detalles
  const handleViewDetails = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setDetailsDialogOpen(true);
  };

  // Obtener nombre del producto
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'N/A';
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
                        <TableCell>{batch.batchCode}</TableCell>
                        <TableCell>{getProductName(batch.productId)}</TableCell>
                        <TableCell align="right">{batch.currentQuantity}</TableCell>
                        <TableCell align="right">{formatCurrency(batch.unitCostUsd, CurrencyType.USD)}</TableCell>
                        <TableCell align="right">{formatCurrency(batch.sellingPriceUsd, CurrencyType.USD)}</TableCell>
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
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(batch)}
                              disabled={loading}
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
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este lote? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
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
        <DialogTitle>Detalles del Lote</DialogTitle>
        <DialogContent>
          {selectedBatch && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Información General</Typography>
                    <Typography><strong>Código:</strong> {selectedBatch.batchCode}</Typography>
                    <Typography><strong>Producto:</strong> {getProductName(selectedBatch.productId)}</Typography>
                    <Typography><strong>Fecha de Compra:</strong> {formatDate(selectedBatch.purchaseDate)}</Typography>
                    {selectedBatch.expirationDate && (
                      <Typography><strong>Fecha de Vencimiento:</strong> {formatDate(selectedBatch.expirationDate)}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Cantidades</Typography>
                    <Typography><strong>Cantidad Inicial:</strong> {selectedBatch.initialQuantity}</Typography>
                    <Typography><strong>Cantidad Actual:</strong> {selectedBatch.currentQuantity}</Typography>
                    <Typography><strong>% de Ganancia:</strong> {selectedBatch.profitPercentage}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Costos</Typography>
                    <Typography><strong>Costo Total USD:</strong> {formatCurrency(selectedBatch.totalCostUsd, CurrencyType.USD)}</Typography>
                    <Typography><strong>Costo Total Bs:</strong> {formatCurrency(selectedBatch.totalCostBs, CurrencyType.BS)}</Typography>
                    <Typography><strong>Costo Unitario USD:</strong> {formatCurrency(selectedBatch.unitCostUsd, CurrencyType.USD)}</Typography>
                    <Typography><strong>Costo Unitario Bs:</strong> {formatCurrency(selectedBatch.unitCostBs, CurrencyType.BS)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Precio de Venta</Typography>
                    <Typography><strong>Precio USD:</strong> {formatCurrency(selectedBatch.sellingPriceUsd, CurrencyType.USD)}</Typography>
                    <Typography><strong>Precio Bs (referencial):</strong> {formatCurrency(selectedBatch.sellingPriceUsd * (selectedBatch.totalCostBs / selectedBatch.totalCostUsd), CurrencyType.BS)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Inventory;
