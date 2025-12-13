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
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import { Sale } from '../../../types';
import api from '../../../services/api';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale;
  onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, sale, onPaymentSuccess }) => {
  const [paymentAmountUsd, setPaymentAmountUsd] = useState(0);
  const [paymentAmountBs, setPaymentAmountBs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);

  // Resetear estado cuando se abre/cierra el modal
  React.useEffect(() => {
    if (!open) {
      setSuccess(false);
      setError(null);
      setPaymentAmountUsd(0);
      setPaymentAmountBs(0);
      setTabValue(0);
    } else {
      // Obtener la tasa de cambio actual cuando se abre el modal
      const fetchCurrentRate = async () => {
        try {
          const response = await api.get('/exchange-rates/current');
          setCurrentExchangeRate(response.data.rate);
        } catch (err) {
          console.error('Error al obtener tasa de cambio:', err);
        }
      };
      fetchCurrentRate();
    }
  }, [open]);

  const formatCurrency = (value: number | string, isBs: boolean = false) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isBs ? `Bs. ${numValue.toFixed(2)}` : `$${numValue.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcular total abonado al crear la venta (solo abonos iniciales)
  const initialPaymentsUsd = React.useMemo(() => {
    if (!sale.customerPayments || sale.customerPayments.length === 0) {
      return 0;
    }
    const total = sale.customerPayments
      .filter((payment) => payment.isInitialPayment)
      .reduce((sum, payment) => {
        const amount = typeof payment.amountUsd === 'string' 
          ? parseFloat(payment.amountUsd) 
          : Number(payment.amountUsd);
        const validAmount = isNaN(amount) ? 0 : amount;
        return sum + validAmount;
      }, 0);
    return total;
  }, [sale.customerPayments]);

  // Calcular total abonado en abonos posteriores
  const subsequentPaymentsUsd = React.useMemo(() => {
    if (!sale.customerPayments || sale.customerPayments.length === 0) {
      return 0;
    }
    const total = sale.customerPayments
      .filter((payment) => !payment.isInitialPayment)
      .reduce((sum, payment) => {
        const amount = typeof payment.amountUsd === 'string' 
          ? parseFloat(payment.amountUsd) 
          : Number(payment.amountUsd);
        const validAmount = isNaN(amount) ? 0 : amount;
        return sum + validAmount;
      }, 0);
    return total;
  }, [sale.customerPayments]);

  const totalPaidUsd = initialPaymentsUsd + subsequentPaymentsUsd;
  
  // Calcular deuda pendiente
  const debtUsd = Math.max(0, sale.totalAmountUsd - totalPaidUsd);
  const debtBs = Math.max(0, sale.totalAmountBs - (totalPaidUsd * (sale.exchangeRate?.rate || 1)));

  const handlePayment = async () => {
    try {
      if (paymentAmountUsd === 0 && paymentAmountBs === 0) {
        setError('Debes especificar un monto a abonar');
        return;
      }

      setLoading(true);
      setError(null);

      // Registrar el abono en el backend
      await api.post(`/sales/${sale.id}/payments`, {
        amountUsd: paymentAmountUsd,
        amountBs: paymentAmountBs,
      });

      setSuccess(true);
      setPaymentAmountUsd(0);
      setPaymentAmountBs(0);

      // Llamar al callback para refrescar los datos
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

      // Cerrar después de 1.5 segundos
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el abono');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: 'info.main', color: 'white', fontWeight: 'bold' }}>
        Abonar Deuda - {sale.customer?.firstName} {sale.customer?.lastName}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Abono registrado exitosamente
          </Alert>
        )}

        {/* Pestañas */}
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Registrar Abono" />
          <Tab label="Historial de Abonos" />
        </Tabs>

        {/* Pestaña 1: Registrar Abono */}
        {tabValue === 0 && (
          <Box>
            {/* Deuda Pendiente */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Deuda Pendiente
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                  <Typography variant="caption" color="textSecondary">
                    Deuda USD
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {formatCurrency(debtUsd, false)}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                  <Typography variant="caption" color="textSecondary">
                    Tasa del Día
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    1 USD = {currentExchangeRate} Bs
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Formulario de Abono */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Registrar Abono
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Abonar en USD"
                  type="number"
                  value={paymentAmountUsd}
                  onChange={(e) => setPaymentAmountUsd(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: '0.01', min: '0', max: debtUsd }}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Abonar en Bs"
                  type="number"
                  value={paymentAmountBs}
                  onChange={(e) => setPaymentAmountBs(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: '0.01', min: '0', max: debtBs }}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                  Total a abonar:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(paymentAmountUsd, false)} + {formatCurrency(paymentAmountBs, true)} ({formatCurrency((paymentAmountBs / currentExchangeRate), false)}) = {formatCurrency(paymentAmountUsd + (paymentAmountBs / currentExchangeRate), false)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Información de Venta Original */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Información de la Venta
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                  <Typography variant="caption" color="textSecondary">
                    Total Original USD
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(sale.totalAmountUsd, false)}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                  <Typography variant="caption" color="textSecondary">
                    Total Original Bs
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(sale.totalAmountBs, true)}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
                  <Typography variant="caption" color="textSecondary">
                    Total Abonado USD
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatCurrency(totalPaidUsd, false)}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                  <Typography variant="caption" color="textSecondary">
                    Deuda Pendiente USD
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {formatCurrency(debtUsd, false)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}

        {/* Pestaña 2: Historial de Abonos */}
        {tabValue === 1 && (
          <Box>
            {sale.customerPayments && sale.customerPayments.length > 0 ? (
              <>
                {/* Abonos Realizados al Crear la Venta */}
                {initialPaymentsUsd > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                      Abonos Realizados al Crear la Venta
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                            <TableCell>Fecha</TableCell>
                            <TableCell align="right">Moneda</TableCell>
                            <TableCell align="right">Monto Pagado</TableCell>
                            <TableCell align="right">Equivalente USD</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sale.customerPayments
                            .filter((payment) => payment.isInitialPayment)
                            .map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                <TableCell align="right">
                                  {payment.paidInCurrency === 'usd' ? 'USD' : 'Bolívares'}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(payment.amountPaidInOriginalCurrency, payment.paidInCurrency === 'bs')}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(payment.amountUsd, false)}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ mt: 1, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        Subtotal Abonado al Crear:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(initialPaymentsUsd, false)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Abonos Posteriores */}
                {subsequentPaymentsUsd > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'info.main' }}>
                      Abonos Posteriores
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                            <TableCell>Fecha</TableCell>
                            <TableCell align="right">Moneda</TableCell>
                            <TableCell align="right">Monto Pagado</TableCell>
                            <TableCell align="right">Equivalente USD</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sale.customerPayments
                            .filter((payment) => !payment.isInitialPayment)
                            .map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                <TableCell align="right">
                                  {payment.paidInCurrency === 'usd' ? 'USD' : 'Bolívares'}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(payment.amountPaidInOriginalCurrency, payment.paidInCurrency === 'bs')}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(payment.amountUsd, false)}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ mt: 1, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        Subtotal Abonado Posteriormente:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        {formatCurrency(subsequentPaymentsUsd, false)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Total General */}
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, border: '2px solid #ddd' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                    Total Abonado en esta Compra:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(totalPaidUsd, false)}
                  </Typography>
                </Box>
              </>
            ) : (
              <Alert severity="info">
                No hay abonos registrados aún en esta compra
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handlePayment}
          variant="contained"
          color="success"
          disabled={loading || (paymentAmountUsd === 0 && paymentAmountBs === 0)}
        >
          {loading ? <CircularProgress size={24} /> : 'Registrar Abono'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
