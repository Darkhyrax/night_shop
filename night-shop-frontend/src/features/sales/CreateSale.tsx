import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Product, Customer, SaleType, ChangePaymentMethod } from '../../types';
import ProductSelector from './components/ProductSelector';
import CustomerSelector from './components/CustomerSelector';

interface SaleItem {
  productId: string;
  product?: Product;
  quantity: number;
  unitPriceUsd: number;
  unitPriceBs: number;
  subtotalUsd: number;
  subtotalBs: number;
}

const CreateSale: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirigir al login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Estado del tipo de venta
  const [saleType, setSaleType] = useState<SaleType>(SaleType.CASH);

  // Estado del formulario
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer> | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [paidAmountUsd, setPaidAmountUsd] = useState(0);
  const [paidAmountBs, setPaidAmountBs] = useState(0);
  const [changePaymentMethod, setChangePaymentMethod] = useState<ChangePaymentMethod>(
    ChangePaymentMethod.USD
  );
  const [changeReturnUsd, setChangeReturnUsd] = useState(0);
  const [changeReturnBs, setChangeReturnBs] = useState(0);

  // Estado para abonos en ventas a crédito
  const [creditPaymentUsd, setCreditPaymentUsd] = useState(0);
  const [creditPaymentBs, setCreditPaymentBs] = useState(0);

  // Estado para datos
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [productsLoading, setProductsLoading] = useState(true);

  // Diálogo para agregar producto
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchExchangeRate();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos');
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await api.get('/exchange-rates/current');
      setExchangeRate(Number(response.data.rate));
    } catch (error) {
      console.error('Error al cargar tasa de cambio:', error);
    }
  };

  const handleAddProduct = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const unitPriceUsd = Number(product.currentSellingPrice);
    const unitPriceBs = unitPriceUsd * exchangeRate;

    const newItem: SaleItem = {
      productId,
      product,
      quantity,
      unitPriceUsd,
      unitPriceBs,
      subtotalUsd: unitPriceUsd * quantity,
      subtotalBs: unitPriceBs * quantity,
    };

    setSaleItems([...saleItems, newItem]);
    setProductDialogOpen(false);
  };

  const handleRemoveProduct = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    const updated = [...saleItems];
    updated[index].quantity = newQuantity;
    updated[index].subtotalUsd = updated[index].unitPriceUsd * newQuantity;
    updated[index].subtotalBs = updated[index].unitPriceBs * newQuantity;
    setSaleItems(updated);
  };

  const calculateTotals = () => {
    return {
      totalUsd: saleItems.reduce((sum, item) => sum + item.subtotalUsd, 0),
      totalBs: saleItems.reduce((sum, item) => sum + item.subtotalBs, 0),
    };
  };

  const calculateChange = () => {
    const totals = calculateTotals();
    const changeFromUsd = Math.max(0, paidAmountUsd - totals.totalUsd);
    const changeFromBs = Math.max(0, paidAmountBs - totals.totalBs);
    
    // Guardar los cambios originales en cada moneda
    return { 
      changeUsd: changeFromUsd,
      changeBS: changeFromBs,
      // Equivalentes para información del vendedor
      changeUsdEquivalent: changeFromUsd + (changeFromBs / exchangeRate),
      changeBsEquivalent: changeFromBs + (changeFromUsd * exchangeRate)
    };
  };

  const totals = calculateTotals();
  const change = calculateChange();
  const hasChange = change.changeUsd > 0 || change.changeBS > 0;

  const handleSubmit = async () => {
    try {
      // Validaciones
      if (saleItems.length === 0) {
        setError('Debes agregar al menos un producto');
        return;
      }

      if (saleType === SaleType.CREDIT && !customerId && !newCustomer) {
        setError('Las ventas a crédito requieren un cliente');
        return;
      }

      // Validar datos del nuevo cliente si se está creando uno
      if (newCustomer) {
        if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.dni || !newCustomer.phone) {
          setError('Completa los campos requeridos del cliente (Nombre, Apellido, DNI, Teléfono)');
          return;
        }
      }

      if (saleType === SaleType.CASH && paidAmountUsd === 0 && paidAmountBs === 0) {
        setError('Debes especificar un monto pagado');
        return;
      }

      setLoading(true);
      setError(null);

      // Determinar cambio a retornar según el método seleccionado
      let finalChangeUsd = 0;
      let finalChangeBS = 0;

      if (changePaymentMethod === ChangePaymentMethod.USD) {
        // Todo el cambio en USD
        finalChangeUsd = change.changeUsd;
        finalChangeBS = 0;
      } else if (changePaymentMethod === ChangePaymentMethod.BS) {
        // Todo el cambio en Bs
        finalChangeUsd = 0;
        finalChangeBS = change.changeBS;
      } else if (changePaymentMethod === ChangePaymentMethod.MIXED) {
        // Cambio mixto según lo especificado por el usuario
        finalChangeUsd = changeReturnUsd;
        finalChangeBS = changeReturnBs;
      }

      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const saleData = {
        userId: user.id,
        saleType,
        customerId: customerId || undefined,
        newCustomer: newCustomer || undefined,
        notes,
        paidAmountUsd: saleType === SaleType.CASH ? paidAmountUsd : 0,
        paidAmountBs: saleType === SaleType.CASH ? paidAmountBs : 0,
        changeUsd: finalChangeUsd,
        changeBS: finalChangeBS,
        changePaymentMethod: hasChange ? changePaymentMethod : undefined,
        creditPaymentUsd: saleType === SaleType.CREDIT ? creditPaymentUsd : undefined,
        creditPaymentBs: saleType === SaleType.CREDIT ? creditPaymentBs : undefined,
        saleDetails: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await api.post('/sales', saleData);
      setSuccessMessage('Venta registrada exitosamente');

      // Limpiar el formulario para una nueva venta
      setTimeout(() => {
        setSaleType(SaleType.CASH);
        setCustomerId(null);
        setNewCustomer(null);
        setSaleItems([]);
        setNotes('');
        setPaidAmountUsd(0);
        setPaidAmountBs(0);
        setChangePaymentMethod(ChangePaymentMethod.USD);
        setChangeReturnUsd(0);
        setChangeReturnBs(0);
        setCreditPaymentUsd(0);
        setCreditPaymentBs(0);
        setSuccessMessage(null);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, isBs: boolean = false) => {
    return isBs ? `Bs. ${value.toFixed(2)}` : `$${value.toFixed(2)}`;
  };

  return (
    <MainLayout title="Nueva Venta - Checkout">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/sales')}
            variant="outlined"
          >
            Volver
          </Button>
          <ShoppingCartIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">Checkout - Nueva Venta</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {authLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {!authLoading && (
        <Grid container spacing={3}>
          {/* Sección Principal - Carrito */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Tipo de Venta */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Tipo de Venta" />
              <CardContent>
                <RadioGroup
                  row
                  value={saleType}
                  onChange={(e) => setSaleType(e.target.value as SaleType)}
                >
                  <FormControlLabel
                    value={SaleType.CASH}
                    control={<Radio />}
                    label="Venta de Contado"
                  />
                  <FormControlLabel
                    value={SaleType.CREDIT}
                    control={<Radio />}
                    label="Venta a Crédito"
                  />
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Cliente */}
            {saleType === SaleType.CREDIT && (
              <>
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Seleccionar Cliente" />
                  <CardContent>
                    <CustomerSelector
                      selectedCustomerId={customerId}
                      newCustomer={newCustomer}
                      onCustomerSelect={setCustomerId}
                      onCustomerSelectFull={setSelectedCustomer}
                      onNewCustomer={setNewCustomer}
                    />
                  </CardContent>
                </Card>

                {/* Abonos Parciales para Crédito */}
                {saleItems.length > 0 && (
                  <Card sx={{ mb: 3 }}>
                    <CardHeader title="Abono Parcial (Opcional)" />
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Puedes abonar una parte ahora y el resto quedará pendiente.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Abono en USD ($)"
                            type="number"
                            value={creditPaymentUsd}
                            onChange={(e) => setCreditPaymentUsd(parseFloat(e.target.value) || 0)}
                            inputProps={{ step: '0.01', min: '0' }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                            Total: {formatCurrency(totals.totalUsd, false)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Abono en Bs (Bs)"
                            type="number"
                            value={creditPaymentBs}
                            onChange={(e) => setCreditPaymentBs(parseFloat(e.target.value) || 0)}
                            inputProps={{ step: '0.01', min: '0' }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                            Total: {formatCurrency(totals.totalBs, true)}
                          </Typography>
                        </Grid>
                      </Grid>
                      {(creditPaymentUsd > 0 || creditPaymentBs > 0) && (
                        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            ✓ Abono registrado
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              Abonado: {formatCurrency(creditPaymentUsd, false)} + {formatCurrency(creditPaymentBs, true)} ({formatCurrency(Math.round((creditPaymentBs / exchangeRate) * 100) / 100, false)})
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Total: {formatCurrency(creditPaymentUsd + Math.round((creditPaymentBs / exchangeRate) * 100) / 100, false)}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Pendiente: {formatCurrency(totals.totalUsd - creditPaymentUsd - (creditPaymentBs / exchangeRate), false)}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Carrito de Productos */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Productos"
                action={
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setProductDialogOpen(true)}
                    disabled={productsLoading}
                  >
                    + Agregar Producto
                  </Button>
                }
              />
              <CardContent>
                {saleItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography color="textSecondary">
                      No hay productos en el carrito. Haz clic en "Agregar Producto" para comenzar.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Producto</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Precio USD</TableCell>
                          <TableCell align="right">Subtotal USD</TableCell>
                          <TableCell align="right">Subtotal Bs</TableCell>
                          <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {saleItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product?.name}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(index, parseInt(e.target.value) || 0)
                                }
                                inputProps={{ min: 1 }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.unitPriceUsd, false)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.subtotalUsd, false)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.subtotalBs, true)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveProduct(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Pagos */}
            {saleType === SaleType.CASH && saleItems.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Forma de Pago" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Pagado en USD ($)"
                        type="number"
                        value={paidAmountUsd}
                        onChange={(e) => setPaidAmountUsd(parseFloat(e.target.value) || 0)}
                        inputProps={{ step: '0.01', min: '0' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Pagado en Bs (Bs)"
                        type="number"
                        value={paidAmountBs}
                        onChange={(e) => setPaidAmountBs(parseFloat(e.target.value) || 0)}
                        inputProps={{ step: '0.01', min: '0' }}
                      />
                    </Grid>
                  </Grid>

                  {/* Mostrar cambio si aplica */}
                  {hasChange && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                        💰 Cambio a Retornar:
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            USD:
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'success.main' }}>
                            {formatCurrency(change.changeUsdEquivalent, false)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            Bs:
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'success.main' }}>
                            {formatCurrency(change.changeBsEquivalent, true)}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        ¿Cómo retornar el cambio?
                      </Typography>
                      <RadioGroup
                        row
                        value={changePaymentMethod}
                        onChange={(e) => {
                          setChangePaymentMethod(e.target.value as ChangePaymentMethod);
                          // Resetear valores cuando cambia el método
                          if (e.target.value !== ChangePaymentMethod.MIXED) {
                            setChangeReturnUsd(0);
                            setChangeReturnBs(0);
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
                                value={changeReturnUsd}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const limitedVal = Math.min(val, change.changeUsdEquivalent);
                                  setChangeReturnUsd(limitedVal);
                                  
                                  // Calcular automáticamente el restante en Bs
                                  const remainingUsd = change.changeUsdEquivalent - limitedVal;
                                  const remainingBs = remainingUsd * exchangeRate;
                                  setChangeReturnBs(Math.round(remainingBs * 100) / 100);
                                }}
                                inputProps={{ step: '0.01', min: '0', max: change.changeUsdEquivalent }}
                                size="small"
                              />
                              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                Máximo: {formatCurrency(change.changeUsdEquivalent, false)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Cambio en Bs"
                                type="number"
                                value={changeReturnBs}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const limitedVal = Math.min(val, change.changeBsEquivalent);
                                  setChangeReturnBs(limitedVal);
                                  
                                  // Calcular automáticamente el restante en USD
                                  const remainingBs = change.changeBsEquivalent - limitedVal;
                                  const remainingUsd = remainingBs / exchangeRate;
                                  setChangeReturnUsd(Math.round(remainingUsd * 100) / 100);
                                }}
                                inputProps={{ step: '0.01', min: '0', max: change.changeBsEquivalent }}
                                size="small"
                              />
                              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                Máximo: {formatCurrency(change.changeBsEquivalent, true)}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                            ⚠️ Total a retornar: {formatCurrency(changeReturnUsd, false)} + {formatCurrency(changeReturnBs, true)} ({formatCurrency(Math.round(((changeReturnBs / exchangeRate)) * 100) / 100, false)})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notas */}
            <Card>
              <CardHeader title="Notas (Opcional)" />
              <CardContent>
                <TextField
                  fullWidth
                  label="Agregar notas sobre la venta..."
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Entrega a domicilio, cliente VIP, etc."
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen Lateral - Sticky */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardHeader
                title="Resumen"
                sx={{ backgroundColor: 'primary.main', color: 'white' }}
              />
              <CardContent>
                {/* Tasa del día */}
                <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    📊 TASA DEL DÍA
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      1 USD = {exchangeRate.toFixed(2)} Bs
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Totales */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Total USD:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totals.totalUsd, false)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Bs:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totals.totalBs, true)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Pagos */}
                {saleType === SaleType.CASH && (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Pagado USD:
                        </Typography>
                        <Typography variant="body2">
                          {formatCurrency(paidAmountUsd, false)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">
                          Pagado Bs:
                        </Typography>
                        <Typography variant="body2">
                          {formatCurrency(paidAmountBs, true)}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Cambio */}
                    {hasChange && (
                      <Box sx={{ mb: 3, p: 1.5, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          CAMBIO A RETORNAR
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2">USD:</Typography>
                          <Chip
                            label={formatCurrency(change.changeUsdEquivalent, false)}
                            color="success"
                            size="small"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2">Bs:</Typography>
                          <Chip
                            label={formatCurrency(change.changeBsEquivalent, true)}
                            color="success"
                            size="small"
                          />
                        </Box>

                        {/* Mostrar desglose si es mixto */}
                        {changePaymentMethod === ChangePaymentMethod.MIXED && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                              Desglose del retorno:
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">Retornar en USD:</Typography>
                              <Chip
                                label={formatCurrency(changeReturnUsd, false)}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption">Retornar en Bs:</Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                  label={formatCurrency(changeReturnBs, true)}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="textSecondary">
                                  ({formatCurrency(Math.round((changeReturnBs / exchangeRate) * 100) / 100, false)})
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </>
                )}

                {/* Deuda (para crédito) */}
                {saleType === SaleType.CREDIT && (
                  <Box sx={{ mb: 3, p: 1.5, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      VENTA A CRÉDITO
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Deuda USD:</Typography>
                      <Chip
                        label={formatCurrency(totals.totalUsd, false)}
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </Box>
                )}

                {/* Información de cliente */}
                {(customerId || newCustomer) && (
                  <Box sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      CLIENTE
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {selectedCustomer
                        ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                        : newCustomer?.firstName && newCustomer?.lastName
                        ? `${newCustomer.firstName} ${newCustomer.lastName}`
                        : 'Cliente seleccionado'}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Botones de Registrar y Nueva Pestaña */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading || saleItems.length === 0}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                    ) : (
                      '✓ Registrar Venta'
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => window.open('/sales/create', '_blank')}
                    title="Abrir nueva pestaña para atender otra venta"
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <OpenInNewIcon />
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}
      </Container>

      {/* Diálogo para agregar producto */}
      <ProductSelector
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onAddProduct={handleAddProduct}
        products={products}
        loading={productsLoading}
      />
    </MainLayout>
  );
};

export default CreateSale;
