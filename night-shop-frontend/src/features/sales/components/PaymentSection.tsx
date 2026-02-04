import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  Alert,
} from '@mui/material';

interface PaymentSectionProps {
  totalUsd: number;
  totalBs: number;
  paidAmountUsd: number;
  paidAmountBs: number;
  onPaidUsdChange: (value: number) => void;
  onPaidBsChange: (value: number) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  totalUsd,
  totalBs,
  paidAmountUsd,
  paidAmountBs,
  onPaidUsdChange,
  onPaidBsChange,
}) => {
  const debtUsd = Math.max(0, totalUsd - paidAmountUsd);
  const debtBs = Math.max(0, totalBs - paidAmountBs);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Información de Pagos
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Totales */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper sx={{ 
            p: 2, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Total a Pagar
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              USD: ${totalUsd.toFixed(2)}
            </Typography>
            <Typography variant="h6">
              Bs: Bs. {totalBs.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        {/* Pagado */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper sx={{ 
            p: 2, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
          }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Pagado
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              USD: ${paidAmountUsd.toFixed(2)}
            </Typography>
            <Typography variant="h6">
              Bs: Bs. {paidAmountBs.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Campos de entrada */}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Registrar Pagos
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Pagado en USD"
            value={paidAmountUsd}
            onChange={(e) => onPaidUsdChange(Math.max(0, parseFloat(e.target.value) || 0))}
            inputProps={{ step: '0.01', min: 0 }}
            helperText={`Deuda: $${debtUsd.toFixed(2)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Pagado en Bs"
            value={paidAmountBs}
            onChange={(e) => onPaidBsChange(Math.max(0, parseFloat(e.target.value) || 0))}
            inputProps={{ step: '0.01', min: 0 }}
            helperText={`Deuda: Bs. ${debtBs.toFixed(2)}`}
          />
        </Grid>
      </Grid>

      {/* Resumen de deuda */}
      <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Resumen de Deuda
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="textSecondary">
              Deuda en USD
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: debtUsd > 0 ? 'error.main' : 'success.main',
                fontWeight: 600,
              }}
            >
              ${debtUsd.toFixed(2)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="textSecondary">
              Deuda en Bs
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: debtBs > 0 ? 'error.main' : 'success.main',
                fontWeight: 600,
              }}
            >
              Bs. {debtBs.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Advertencias */}
      {paidAmountUsd > totalUsd && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          El pago en USD excede el total. Diferencia: ${(paidAmountUsd - totalUsd).toFixed(2)}
        </Alert>
      )}

      {paidAmountBs > totalBs && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          El pago en Bs excede el total. Diferencia: Bs. {(paidAmountBs - totalBs).toFixed(2)}
        </Alert>
      )}

      {debtUsd > 0 || debtBs > 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Esta venta tiene deuda pendiente. Se creará una cuenta de cliente para registrar el saldo.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mt: 2 }}>
          Venta completamente pagada.
        </Alert>
      )}
    </Box>
  );
};

export default PaymentSection;
