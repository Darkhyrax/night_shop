import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { InventoryBatch } from '../../types';
import api from '../../services/api';
import { useSnackbar } from 'notistack';

interface InventoryBatchEditDialogProps {
  open: boolean;
  batch: InventoryBatch | null;
  onClose: () => void;
  onSave: () => void;
}

const InventoryBatchEditDialog: React.FC<InventoryBatchEditDialogProps> = ({
  open,
  batch,
  onClose,
  onSave,
}) => {
  const [batchCode, setBatchCode] = useState('');
  const [profitPercentage, setProfitPercentage] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (batch && open) {
      setBatchCode(batch.batchCode || '');
      setProfitPercentage(batch.profitPercentage?.toString() || '');
      setExpirationDate(batch.expirationDate ? new Date(batch.expirationDate as string) : null);
      setError(null);
    }
  }, [batch, open]);

  const handleSave = async () => {
    if (!batch) return;

    try {
      setLoading(true);
      setError(null);

      const updateData: any = {};
      if (batchCode !== batch.batchCode) {
        updateData.batchCode = batchCode || null;
      }
      if (profitPercentage !== batch.profitPercentage?.toString()) {
        updateData.profitPercentage = profitPercentage ? Number(profitPercentage) : batch.profitPercentage;
      }
      const batchExpDate = batch.expirationDate ? new Date(batch.expirationDate as string) : null;
      if (expirationDate?.getTime() !== batchExpDate?.getTime()) {
        updateData.expirationDate = expirationDate;
      }

      // Solo enviar si hay cambios
      if (Object.keys(updateData).length === 0) {
        enqueueSnackbar('No hay cambios para guardar', { variant: 'info' });
        onClose();
        return;
      }

      await api.patch(`/inventory/batches/${batch.id}`, updateData);
      enqueueSnackbar('Lote actualizado exitosamente', { variant: 'success' });
      onSave();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar lote';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Lote de Inventario</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Código del Lote"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            placeholder="Dejar vacío si no tiene código"
            helperText="Opcional"
          />

          <TextField
            fullWidth
            label="Porcentaje de Ganancia"
            type="number"
            value={profitPercentage}
            onChange={(e) => setProfitPercentage(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha de Vencimiento"
              value={expirationDate}
              onChange={(date) => setExpirationDate(date)}
              format="dd-MM-yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'Opcional',
                },
                openPickerButton: {
                  sx: {
                    color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                    '&:hover': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                    }
                  }
                }
              }}
            />
          </LocalizationProvider>

          {batch && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', 
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                Información del Lote
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Producto:</strong> {batch.productId}
              </Typography>
              <Typography variant="body2">
                <strong>Cantidad Actual:</strong> {batch.currentQuantity} unidades
              </Typography>
              <Typography variant="body2">
                <strong>Costo Unitario:</strong> ${Number(batch.unitCostUsd).toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Precio de Venta:</strong> ${Number(batch.sellingPriceUsd).toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
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
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryBatchEditDialog;
