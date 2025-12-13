import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { Sale, SaleType } from '../../../types';

interface SaleDetailsModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ open, onClose, sale }) => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
        Detalles de la Venta
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {/* Información General */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Información General
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Fecha
              </Typography>
              <Typography variant="body2">{formatDate(sale.createdAt)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Tipo de Venta
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={sale.saleType === SaleType.CREDIT ? 'Crédito' : 'Contado'}
                  color={sale.saleType === SaleType.CREDIT ? 'warning' : 'success'}
                  size="small"
                />
              </Box>
            </Box>
            {sale.customer && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="caption" color="textSecondary">
                  Cliente
                </Typography>
                <Typography variant="body2">
                  {sale.customer.firstName} {sale.customer.lastName}
                </Typography>
              </Box>
            )}
          </Box>
          {sale.exchangeRate && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                TASA DE CAMBIO DEL DÍA
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  1 USD = {formatCurrency(sale.exchangeRate.rate, true)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(sale.exchangeRate.effectiveDate).toLocaleDateString('es-ES')}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Productos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Productos
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio USD</TableCell>
                  <TableCell align="right">Subtotal USD</TableCell>
                  <TableCell align="right">Subtotal Bs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sale.saleDetails?.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.product?.name}</TableCell>
                    <TableCell align="right">{detail.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(detail.unitPriceUsd, false)}</TableCell>
                    <TableCell align="right">{formatCurrency(detail.subtotalUsd, false)}</TableCell>
                    <TableCell align="right">{formatCurrency(detail.subtotalBs, true)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Totales */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Resumen de Pago
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="caption" color="textSecondary">
                Total USD
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(sale.totalAmountUsd, false)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="caption" color="textSecondary">
                Total Bs
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(sale.totalAmountBs, true)}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Pagos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Pagos Realizados
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
              <Typography variant="caption" color="textSecondary">
                Pagado USD
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {formatCurrency(sale.paidAmountUsd, false)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
              <Typography variant="caption" color="textSecondary">
                Pagado Bs
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {formatCurrency(sale.paidAmountBs, true)}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Abonos Iniciales (para ventas a crédito) */}
        {sale.saleType === 'credit' && sale.customerPayments && sale.customerPayments.filter((p) => p.isInitialPayment).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Abonos Realizados al Crear la Venta
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Moneda</TableCell>
                    <TableCell align="right">Monto Pagado</TableCell>
                    <TableCell align="right">Equivalente USD</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.customerPayments.filter((p) => p.isInitialPayment).map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {payment.paidInCurrency === 'usd' ? 'USD' : 'Bolívares'}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payment.amountPaidInOriginalCurrency, payment.paidInCurrency === 'bs')}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payment.amountUsd, false)}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString('es-ES')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Abonos Posteriores (para ventas a crédito) */}
        {sale.saleType === 'credit' && sale.customerPayments && sale.customerPayments.filter((p) => !p.isInitialPayment).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Abonos Posteriores
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Moneda</TableCell>
                    <TableCell align="right">Monto Pagado</TableCell>
                    <TableCell align="right">Equivalente USD</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.customerPayments.filter((p) => !p.isInitialPayment).map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {payment.paidInCurrency === 'usd' ? 'USD' : 'Bolívares'}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payment.amountPaidInOriginalCurrency, payment.paidInCurrency === 'bs')}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payment.amountUsd, false)}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString('es-ES')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Cambio */}
        {(sale.changeUsd > 0 || sale.changeBS > 0) && sale.exchangeRate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Cambio Retornado
            </Typography>
            
            {/* Total a Retornar en USD */}
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 2 }}>
                TOTAL A RETORNAR
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Total en USD
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(sale.changeTotalUsd, false)}
                </Typography>
              </Box>

              {/* Desglose */}
              <Box sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 0.5 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                  Desglose:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">En USD:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(sale.changeUsd, false)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">En Bs (equivalente):</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(sale.changeBS, true)} = {formatCurrency(sale.changeBS / sale.exchangeRate.rate, false)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Notas */}
        {sale.notes && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Notas
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
              <Typography variant="body2">{sale.notes}</Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaleDetailsModal;
