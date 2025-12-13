import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Autocomplete,
} from '@mui/material';
import { Product } from '../../../types';

interface ProductSelectorProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (productId: string, quantity: number) => void;
  products: Product[];
  loading: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  open,
  onClose,
  onAddProduct,
  products,
  loading,
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleAdd = () => {
    if (!selectedProductId) {
      setError('Debes seleccionar un producto');
      return;
    }

    if (quantity < 1) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (selectedProduct && selectedProduct.totalStock < quantity) {
      setError(`Stock insuficiente. Disponible: ${selectedProduct.totalStock}`);
      return;
    }

    onAddProduct(selectedProductId, quantity);
    setSelectedProductId('');
    setQuantity(1);
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedProductId('');
    setQuantity(1);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Producto</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Autocomplete
              options={products}
              getOptionLabel={(option) => `${option.name} (Stock: ${option.totalStock})`}
              value={products.find(p => p.id === selectedProductId) || null}
              onChange={(event, value) => {
                if (value) {
                  setSelectedProductId(value.id);
                } else {
                  setSelectedProductId('');
                }
                setError(null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Producto"
                  placeholder="Nombre del producto..."
                />
              )}
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.toLowerCase();
                return options.filter(option =>
                  option.name.toLowerCase().includes(inputValue)
                );
              }}
              noOptionsText="No hay productos disponibles"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              type="number"
              label="Cantidad"
              value={quantity}
              onChange={(e) => {
                setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                setError(null);
              }}
              inputProps={{ min: 1 }}
              sx={{ mb: 3 }}
            />

            {selectedProduct && (
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Precio Unitario
                    </Typography>
                    <Typography variant="body1">
                      ${Number(selectedProduct.currentSellingPrice).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body1">
                      ${(Number(selectedProduct.currentSellingPrice) * quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={!selectedProductId || loading}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelector;
