import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
} from '@mui/material';
import { ChangePaymentMethod } from '../../../types';

interface CashPaymentSectionProps {
  totalUsd: number;
  totalBs: number;
  exchangeRate: number;
  paidAmountUsd: number;
  paidAmountBs: number;
  changePaymentMethod: ChangePaymentMethod;
  changeReturnUsd: number;
  changeReturnBs: number;
  onPaymentMethodChange: (method: 'usd' | 'bs' | 'mixed') => void;
  onPaidAmountUsdChange: (amount: number) => void;
  onPaidAmountBsChange: (amount: number) => void;
  onChangePaymentMethodChange: (method: ChangePaymentMethod) => void;
  onChangeReturnUsdChange: (amount: number) => void;
  onChangeReturnBsChange: (amount: number) => void;
}

const USD_DENOMINATIONS = [1, 5, 10, 20, 50, 100];

const CashPaymentSection: React.FC<CashPaymentSectionProps> = ({
  totalUsd,
  totalBs,
  exchangeRate,
  paidAmountUsd,
  paidAmountBs,
  changePaymentMethod,
  changeReturnUsd,
  changeReturnBs,
  onPaymentMethodChange,
  onPaidAmountUsdChange,
  onPaidAmountBsChange,
  onChangePaymentMethodChange,
  onChangeReturnUsdChange,
  onChangeReturnBsChange,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'usd' | 'bs' | 'mixed'>('usd');

  // Calcular cambio
  const changeUsd = Math.max(0, paidAmountUsd - totalUsd);
  const changeBs = Math.max(0, paidAmountBs - totalBs);
  
  // Equivalentes para información del vendedor
  const changeUsdEquivalent = changeUsd + (changeBs / exchangeRate);
  const changeBsEquivalent = changeBs + (changeUsd * exchangeRate);
  
  const hasChange = changeUsd > 0 || changeBs > 0;

  // Auto-llenar cuando cambia el método de pago
  useEffect(() => {
    if (paymentMethod === 'bs') {
      // Auto-llenar con el total en BS (redondeado a 2 decimales)
      const roundedTotal = Math.round(totalBs * 100) / 100;
      onPaidAmountBsChange(roundedTotal);
      onPaidAmountUsdChange(0);
    } else if (paymentMethod === 'usd') {
      // Auto-llenar con el billete mínimo que cubra el total
      const minBilletNeeded = USD_DENOMINATIONS.find(denom => denom >= totalUsd) || 100;
      onPaidAmountUsdChange(minBilletNeeded);
      onPaidAmountBsChange(0);
    } else if (paymentMethod === 'mixed') {
      // Resetear para pago mixto
      onPaidAmountUsdChange(0);
      onPaidAmountBsChange(0);
    }
  }, [paymentMethod, totalUsd, totalBs, onPaidAmountUsdChange, onPaidAmountBsChange]);

  const handlePaymentMethodChange = (method: 'usd' | 'bs' | 'mixed') => {
    setPaymentMethod(method);
    onPaymentMethodChange(method);
  };

  return (
    <Card>
      <CardHeader title="Forma de Pago" />
      <CardContent>
        {/* Selector de método de pago */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            ¿Cómo paga el cliente?
          </Typography>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => handlePaymentMethodChange(e.target.value as 'usd' | 'bs' | 'mixed')}
          >
            <FormControlLabel
              value="usd"
              control={<Radio />}
              label={`En Dólares (USD) - Total: $${totalUsd.toFixed(2)}`}
            />
            <FormControlLabel
              value="bs"
              control={<Radio />}
              label={`En Bolívares (Bs) - Total: Bs. ${totalBs.toFixed(2)}`}
            />
            <FormControlLabel
              value="mixed"
              control={<Radio />}
              label="Mixto (USD + Bs)"
            />
          </RadioGroup>
        </Box>

        {/* Pago en USD - Billete */}
        {paymentMethod === 'usd' && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Billete USD"
              value={paidAmountUsd === 0 ? '' : paidAmountUsd}
              onChange={(e) => onPaidAmountUsdChange(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, step: 1 }}
              helperText="Ingresa el valor del billete (1, 5, 10, 20, 50, 100)"
            />
          </Box>
        )}

        {/* Pago en BS */}
        {paymentMethod === 'bs' && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Monto pagado en Bolívares"
              value={paidAmountBs === 0 ? '' : paidAmountBs}
              onChange={(e) => onPaidAmountBsChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
              inputProps={{ step: '0.01', min: 0 }}
            />
          </Box>
        )}

        {/* Pago Mixto */}
        {paymentMethod === 'mixed' && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Monto en USD"
                  value={paidAmountUsd === 0 ? '' : paidAmountUsd}
                  onChange={(e) => onPaidAmountUsdChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Monto en Bs"
                  value={paidAmountBs === 0 ? '' : paidAmountBs}
                  onChange={(e) => onPaidAmountBsChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Resumen de cambio - solo si hay cambio real */}
        {hasChange && changeUsdEquivalent > 0.01 && (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              💰 Cambio a retornar
            </Typography>

            {/* Mostrar cambio según método de pago */}
            <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    USD
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                    ${changeUsdEquivalent.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Bs
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                    Bs. {changeBsEquivalent.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Opciones de cómo retornar el cambio */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                ¿Cómo retornar el cambio?
              </Typography>
              <RadioGroup
                row
                value={changePaymentMethod}
                onChange={(e) => {
                  onChangePaymentMethodChange(e.target.value as ChangePaymentMethod);
                  // Resetear valores cuando cambia el método
                  if (e.target.value !== ChangePaymentMethod.MIXED) {
                    onChangeReturnUsdChange(0);
                    onChangeReturnBsChange(0);
                  }
                }}
              >
                <FormControlLabel
                  value={ChangePaymentMethod.USD}
                  control={<Radio size="small" />}
                  label="Todo en USD"
                />
                <FormControlLabel
                  value={ChangePaymentMethod.BS}
                  control={<Radio size="small" />}
                  label="Todo en Bs"
                />
                <FormControlLabel
                  value={ChangePaymentMethod.MIXED}
                  control={<Radio size="small" />}
                  label="Mixto"
                />
              </RadioGroup>

              {/* Campos para desglose de cambio mixto */}
              {changePaymentMethod === ChangePaymentMethod.MIXED && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff9e6', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Especificar desglose del cambio:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Cambio en USD"
                        type="number"
                        value={changeReturnUsd === 0 ? '' : changeReturnUsd}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                          const limitedVal = Math.min(val, changeUsd);
                          onChangeReturnUsdChange(limitedVal);
                          
                          // Calcular automáticamente el restante en Bs
                          const remainingUsd = changeUsd - limitedVal;
                          const remainingBs = remainingUsd * exchangeRate;
                          onChangeReturnBsChange(Math.round(remainingBs * 100) / 100);
                        }}
                        inputProps={{ step: '0.01', min: '0', max: changeUsd }}
                        size="small"
                      />
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        Máximo: ${changeUsd.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Cambio en Bs"
                        type="number"
                        value={changeReturnBs === 0 ? '' : changeReturnBs}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                          const limitedVal = Math.min(val, changeBs);
                          onChangeReturnBsChange(limitedVal);
                          
                          // Calcular automáticamente el restante en USD
                          const remainingBs = changeBs - limitedVal;
                          const remainingUsd = remainingBs / exchangeRate;
                          onChangeReturnUsdChange(Math.round(remainingUsd * 100) / 100);
                        }}
                        inputProps={{ step: '0.01', min: '0', max: changeBs }}
                        size="small"
                      />
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        Máximo: Bs. {changeBs.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                    ⚠️ Total a retornar: ${changeReturnUsd.toFixed(2)} + Bs. {changeReturnBs.toFixed(2)} (${(changeReturnBs / exchangeRate).toFixed(2)})
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CashPaymentSection;
