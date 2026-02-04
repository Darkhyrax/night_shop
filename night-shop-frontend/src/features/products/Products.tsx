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
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MainLayout from '../../components/layout/MainLayout';
import { productsApi } from '../../services/productsApi';
import { Product } from '../../types';
import ProductFormDialog from './ProductFormDialog';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para filtrar productos según el término de búsqueda
  const filterProducts = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term))
    );

    setFilteredProducts(filtered);
    setPage(0); // Resetear a la primera página cuando se filtra
  }, [searchTerm, products, setPage]);

  // Efecto para filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Función para cargar productos
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error al cargar productos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir formulario para crear producto
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  // Abrir formulario para editar producto
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Eliminar producto
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      await productsApi.delete(selectedProduct.id);
      setProducts(products.filter(product => product.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      setSuccessMessage(`Producto ${selectedProduct.name} eliminado exitosamente`);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar producto');
      console.error('Error al eliminar producto:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar producto (crear o actualizar)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    setIsLoading(true);
    setFormError(null); // Limpiar error del formulario
    setError(null); // Limpiar error general
    setSuccessMessage(null); // Limpiar mensaje de éxito
    setShowSuccess(false); // Ocultar alerta de éxito

    try {
      if (selectedProduct) {
        // Actualizar producto existente
        const updatedProduct = await productsApi.update(selectedProduct.id, productData);
        setProducts(products.map(product => product.id === selectedProduct.id ? updatedProduct : product));
        // Mostrar mensaje de éxito
        setSuccessMessage(`Producto ${updatedProduct.name} actualizado exitosamente`);
      } else {
        // Crear nuevo producto
        const newProduct = await productsApi.create(productData);
        setProducts([...products, newProduct]);
        // Mostrar mensaje de éxito
        setSuccessMessage(`Producto ${newProduct.name} creado exitosamente`);
      }
      setIsFormOpen(false); // Cerrar el diálogo inmediatamente
      setShowSuccess(true); // Mostrar la alerta de éxito
    } catch (err: any) {
      // Establecer el error en el estado del formulario, no en el estado general
      setFormError(err.message || 'Error al guardar producto');
      console.error('Error al guardar producto:', err);
      // Propagar el error para que el componente del formulario pueda manejarlo
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '$0.00';
    }
    return `$${Number(value).toFixed(2)}`;
  };

  return (
    <MainLayout title="Gestión de Productos">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Gestión de Productos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProduct}
          disabled={isLoading}
        >
          Nuevo Producto
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre o descripción"
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <TableRow hover key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell align="right">{formatCurrency(product.currentSellingPrice)}</TableCell>
                        <TableCell align="right">{product.totalStock}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditProduct(product)}
                              disabled={isLoading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(product)}
                              disabled={isLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {products.length === 0 ? 'No hay productos disponibles' : 'No se encontraron resultados para la búsqueda'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}
      </Paper>

      {/* Diálogo de formulario para crear/editar producto */}
      <ProductFormDialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormError(null); // Limpiar errores al cerrar
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        isLoading={isLoading}
        error={formError}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        content={`¿Estás seguro de que deseas eliminar el producto ${selectedProduct?.name}? Esta acción no se puede deshacer.`}
        isLoading={isLoading}
      />

      {/* Alerta de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default Products;
