import React, { useState, useEffect } from 'react';
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
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Customer, Sale } from '../../types';
import api from '../../services/api';
import SaleDetailsModal from '../sales/components/SaleDetailsModal';

interface CustomerDebtModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  onPaymentSuccess?: () => void;
}

const CustomerDebtModal: React.FC<CustomerDebtModalProps> = ({
  open,
  onClose,
  customer,
  onPaymentSuccess,
}) => {
  const [paymentAmountUsd, setPaymentAmountUsd] = useState(0);
  const [paymentAmountBs, setPaymentAmountBs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);
  const [debtsData, setDebtsData] = useState<any>(null);
  const [debtsLoading, setDebtsLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleDetailsModalOpen, setSaleDetailsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'usd' | 'bs' | 'mixed'>('usd');

  const fetchDebtsAndExchangeRate = React.useCallback(async () => {
    setDebtsLoading(true);
    setError(null);
    try {
      // Obtener deudas del cliente
      const debtsResponse = await api.get(`/customers/${customer.id}/debts`);
      setDebtsData(debtsResponse.data);

      // Obtener tasa de cambio actual
      try {
        const ratesResponse = await api.get('/exchange-rates/current');
        const rate = parseFloat(ratesResponse.data.rate);
        if (!isNaN(rate) && rate > 0) {
          setCurrentExchangeRate(rate);
        } else {
          console.error('Tasa de cambio inválida:', ratesResponse.data.rate);
          setCurrentExchangeRate(1);
        }
      } catch (error) {
        console.error('Error al obtener tasa de cambio:', error);
        setCurrentExchangeRate(1);
      }
    } catch (err) {
      console.error('Error al obtener deudas:', err);
      setError('Error al cargar las deudas del cliente');
    } finally {
      setDebtsLoading(false);
    }
  }, [customer.id]);

  useEffect(() => {
    if (!open) {
      setSuccess(false);
      setError(null);
      setPaymentAmountUsd(0);
      setPaymentAmountBs(0);
      setTabValue(0);
      setPaymentMethod('usd');
    } else {
      fetchDebtsAndExchangeRate();
    }
  }, [open, fetchDebtsAndExchangeRate]);

  // Función para pagar todo
  const handlePayAll = () => {
    const totalDebtUsd = debtsData?.totalDebtUsd || 0;
    const totalDebtBs = totalDebtUsd * currentExchangeRate;

    if (paymentMethod === 'usd') {
      setPaymentAmountUsd(totalDebtUsd);
      setPaymentAmountBs(0);
    } else if (paymentMethod === 'bs') {
      setPaymentAmountUsd(0);
      setPaymentAmountBs(totalDebtBs);
    } else if (paymentMethod === 'mixed') {
      setPaymentAmountUsd(totalDebtUsd);
      setPaymentAmountBs(0);
    }
  };

  // Auto-completar campo de Bs cuando se ingresa USD en modo mixto
  const handleUsdChange = (value: number) => {
    const totalDebtUsd = debtsData?.totalDebtUsd || 0;

    setPaymentAmountUsd(value);
    if (paymentMethod === 'mixed' && value > 0) {
      const remainingDebt = totalDebtUsd - value;
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
    const totalDebtUsd = debtsData?.totalDebtUsd || 0;
    const totalDebtBs = totalDebtUsd * currentExchangeRate;

    setPaymentAmountBs(value);
    if (paymentMethod === 'mixed' && value > 0) {
      const remainingDebt = totalDebtBs - value;
      if (remainingDebt > 0) {
        const remainingUsd = remainingDebt / currentExchangeRate;
        setPaymentAmountUsd(Math.round(remainingUsd * 100) / 100);
      } else {
        setPaymentAmountUsd(0);
      }
    }
  };

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

  const totalDebtUsd = debtsData?.totalDebtUsd || 0;
  const totalDebtBs = totalDebtUsd * currentExchangeRate;

  const handlePayment = async () => {
    try {
      if (paymentAmountUsd === 0 && paymentAmountBs === 0) {
        setError('Debes especificar un monto a abonar');
        return;
      }

      setLoading(true);
      setError(null);

      // Registrar abono usando el nuevo endpoint FIFO del backend
      await api.post(`/customers/${customer.id}/payments`, {
        amountUsd: paymentAmountUsd,
        amountBs: paymentAmountBs,
        exchangeRateId: currentExchangeRate, // Enviar la tasa de cambio actual
      });

      setSuccess(true);
      setPaymentAmountUsd(0);
      setPaymentAmountBs(0);

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

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
      <DialogTitle sx={{ backgroundColor: 'warning.main', color: 'white', fontWeight: 'bold' }}>
        Abonar Deudas - {customer.firstName} {customer.lastName}
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

        {debtsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : totalDebtUsd === 0 ? (
          <Alert severity="info">
            Este cliente no tiene deudas pendientes
          </Alert>
        ) : (
          <>
            {/* Pestañas */}
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab label="Registrar Abono" />
              <Tab label="Deudas Pendientes" />
            </Tabs>

            {/* Pestaña 1: Registrar Abono */}
            {tabValue === 0 && (
              <Box>
                {/* Deuda Total */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Deuda Total del Cliente
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
                        {formatCurrency(totalDebtUsd, false)}
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
                        label={`En USD - Deuda: $${totalDebtUsd.toFixed(2)}`}
                      />
                      <FormControlLabel
                        value="bs"
                        control={<Radio size="small" />}
                        label={`En Bs - Deuda: Bs. ${totalDebtBs.toFixed(2)}`}
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
                        inputProps={{ step: '0.01', min: '0', max: totalDebtUsd }}
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
                        inputProps={{ step: '0.01', min: '0', max: totalDebtBs }}
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
                        inputProps={{ step: '0.01', min: '0', max: totalDebtUsd }}
                        disabled={loading}
                      />
                      <TextField
                        fullWidth
                        label="Monto en Bs"
                        type="number"
                        value={paymentAmountBs === 0 ? '' : paymentAmountBs}
                        onChange={(e) => handleBsChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        inputProps={{ step: '0.01', min: '0', max: totalDebtBs }}
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
                      {formatCurrency(paymentAmountUsd, false)} + {formatCurrency(paymentAmountBs, true)} (
                      {formatCurrency(paymentAmountBs / currentExchangeRate, false)}) ={' '}
                      {formatCurrency(paymentAmountUsd + paymentAmountBs / currentExchangeRate, false)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Información de Deuda Total */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Resumen de Deuda
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0',
                      border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)'}`
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        Deuda Total USD
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(totalDebtUsd, false)}
                      </Typography>
                    </Paper>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0',
                      border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)'}`
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        Deuda Total Bs
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(totalDebtBs, true)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Pestaña 2: Deudas Pendientes */}
            {tabValue === 1 && (
              <Box>
                {debtsData?.accounts && debtsData.accounts.length > 0 ? (
                  <>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ 
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#f5f5f5'
                          }}>
                            <TableCell>Fecha de Venta</TableCell>
                            <TableCell align="right">Deuda USD</TableCell>
                            <TableCell align="right">Deuda Bs</TableCell>
                            <TableCell align="center">Pagos</TableCell>
                            <TableCell align="center">Acción</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {debtsData.accounts.map((account: any) => (
                            <TableRow key={account.id}>
                              <TableCell>{formatDate(account.createdAt)}</TableCell>
                              <TableCell align="right">{formatCurrency(account.debtUsd, false)}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(account.debtUsd * currentExchangeRate, true)}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${account.payments?.length || 0} abonos`}
                                  size="small"
                                  variant="outlined"
                                  color={account.payments?.length > 0 ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={async () => {
                                    try {
                                      // Obtener detalles de la venta
                                      const saleResponse = await api.get(`/sales/${account.saleId}`);
                                      setSelectedSale(saleResponse.data);
                                      setSaleDetailsModalOpen(true);
                                    } catch (err) {
                                      console.error('Error al obtener detalles de la venta:', err);
                                    }
                                  }}
                                >
                                  Ver Detalle
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                        Total de Deudas Pendientes:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        {formatCurrency(totalDebtUsd, false)} / {formatCurrency(totalDebtBs, true)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info">
                    No hay deudas pendientes para este cliente
                  </Alert>
                )}
              </Box>
            )}
          </>
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
        {totalDebtUsd > 0 && (
          <Button
            onClick={handlePayment}
            variant="contained"
            color="warning"
            disabled={loading || (paymentAmountUsd === 0 && paymentAmountBs === 0)}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Abono'}
          </Button>
        )}
      </DialogActions>
      {selectedSale && (
        <SaleDetailsModal
          open={saleDetailsModalOpen}
          onClose={() => setSaleDetailsModalOpen(false)}
          sale={selectedSale}
        />
      )}
    </Dialog>
  );
};

export default CustomerDebtModal;
