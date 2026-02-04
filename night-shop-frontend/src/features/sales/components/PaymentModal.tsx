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
  RadioGroup,
  FormControlLabel,
  Radio,
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
  const [paymentMethod, setPaymentMethod] = useState<'usd' | 'bs' | 'mixed'>('usd');

  // Resetear estado cuando se abre/cierra el modal
  React.useEffect(() => {
    if (!open) {
      setSuccess(false);
      setError(null);
      setPaymentAmountUsd(0);
      setPaymentAmountBs(0);
      setTabValue(0);
      setPaymentMethod('usd');
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

  // Función para pagar todo
  const handlePayAll = () => {
    if (paymentMethod === 'usd') {
      setPaymentAmountUsd(debtUsd);
      setPaymentAmountBs(0);
    } else if (paymentMethod === 'bs') {
      setPaymentAmountUsd(0);
      setPaymentAmountBs(debtBs);
    } else if (paymentMethod === 'mixed') {
      setPaymentAmountUsd(debtUsd);
      setPaymentAmountBs(0);
    }
  };

  // Auto-completar campo de Bs cuando se ingresa USD en modo mixto
  const handleUsdChange = (value: number) => {
    setPaymentAmountUsd(value);
    if (paymentMethod === 'mixed' && value > 0) {
      const remainingDebt = debtUsd - value;
      if (remainingDebt > 0) {
        const remainingBs = remainingDebt * currentExchangeRate;
        setPaymentAmountBs(Math.round(remainingBs * 100) / 100);
      } else {
        setPaymentAmountBs(0);
      }
    }
  };

  // Auto-completar campo de USD cuando se ingresa Bs en modo mixto
  const handleBsChange = (value: number) => {
    setPaymentAmountBs(value);
    if (paymentMethod === 'mixed' && value > 0) {
      const remainingDebt = debtBs - value;
      if (remainingDebt > 0) {
        const remainingUsd = remainingDebt / currentExchangeRate;
        setPaymentAmountUsd(Math.round(remainingUsd * 100) / 100);
      } else {
        setPaymentAmountUsd(0);
      }
    }
  };

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
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)'}`
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Deuda USD
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {formatCurrency(debtUsd, false)}
                  </Typography>
                </Paper>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.15)' : '#e3f2fd',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'}`
                }}>
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

              {/* Selector de método de pago */}
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', 
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                  ¿Cómo paga?
                </Typography>
                <RadioGroup
                  row
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value as 'usd' | 'bs' | 'mixed');
                    setPaymentAmountUsd(0);
                    setPaymentAmountBs(0);
                  }}
                >
                  <FormControlLabel
                    value="usd"
                    control={<Radio size="small" />}
                    label={`En USD - Deuda: $${debtUsd.toFixed(2)}`}
                  />
                  <FormControlLabel
                    value="bs"
                    control={<Radio size="small" />}
                    label={`En Bs - Deuda: Bs. ${debtBs.toFixed(2)}`}
                  />
                  <FormControlLabel
                    value="mixed"
                    control={<Radio size="small" />}
                    label="Mixto (USD + Bs)"
                  />
                </RadioGroup>
              </Box>

              {/* Campos de pago según método seleccionado */}
              {paymentMethod === 'usd' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Monto en USD"
                    type="number"
                    value={paymentAmountUsd === 0 ? '' : paymentAmountUsd}
                    onChange={(e) => setPaymentAmountUsd(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    inputProps={{ step: '0.01', min: '0', max: debtUsd }}
                    disabled={loading}
                  />
                </Box>
              )}

              {paymentMethod === 'bs' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Monto en Bolívares"
                    type="number"
                    value={paymentAmountBs === 0 ? '' : paymentAmountBs}
                    onChange={(e) => setPaymentAmountBs(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    inputProps={{ step: '0.01', min: '0', max: debtBs }}
                    disabled={loading}
                  />
                </Box>
              )}

              {paymentMethod === 'mixed' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Monto en USD"
                    type="number"
                    value={paymentAmountUsd === 0 ? '' : paymentAmountUsd}
                    onChange={(e) => handleUsdChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    inputProps={{ step: '0.01', min: '0', max: debtUsd }}
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Monto en Bs"
                    type="number"
                    value={paymentAmountBs === 0 ? '' : paymentAmountBs}
                    onChange={(e) => handleBsChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    inputProps={{ step: '0.01', min: '0', max: debtBs }}
                    disabled={loading}
                  />
                </Box>
              )}

              {/* Botón Pagar Todo */}
              <Button
                fullWidth
                variant="outlined"
                color="success"
                onClick={handlePayAll}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                💰 Pagar Todo
              </Button>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f0f0f0', 
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
              }}>
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
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Total Original USD
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(sale.totalAmountUsd, false)}
                  </Typography>
                </Paper>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Total Original Bs
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(sale.totalAmountBs, true)}
                  </Typography>
                </Paper>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Total Abonado USD
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totalPaidUsd, false)}
                  </Typography>
                </Paper>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0',
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)'}`
                }}>
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
                          <TableRow sx={{ 
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : '#e8f5e9'
                          }}>
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
                    <Box sx={{ 
                      mt: 1, 
                      p: 2, 
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9', 
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
                    }}>
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
                          <TableRow sx={{ 
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : '#e3f2fd'
                          }}>
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
                    <Box sx={{ 
                      mt: 1, 
                      p: 2, 
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.15)' : '#e3f2fd', 
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'}`
                    }}>
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
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', 
                  borderRadius: 1, 
                  border: (theme) => theme.palette.mode === 'dark' ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid #ddd'
                }}>
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
