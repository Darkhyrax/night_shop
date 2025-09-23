import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Typography,
    FormHelperText,
    InputAdornment,
    Divider,
    Alert,
    Box,
    Stepper,
    Step,
    StepLabel,
    Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Product, CurrencyType } from '../../types';
import api from '../../services/api';

interface InventoryBatchFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => Promise<void>;
}

const steps = ['Seleccionar producto', 'Información del lote', 'Precios y cálculos'];

const InventoryBatchFormDialog: React.FC<InventoryBatchFormDialogProps> = ({
    open,
    onClose,
    onSave
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [exchangeRate, setExchangeRate] = useState<number>(0);
    const [exchangeRateId, setExchangeRateId] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            }
        };

        const fetchExchangeRate = async () => {
            try {
                const response = await api.get('/exchange-rates/current');
                setExchangeRate(response.data.rate);
                setExchangeRateId(response.data.id);
            } catch (error) {
                console.error('Error al cargar tasa de cambio:', error);
            }
        };

        if (open) {
            fetchProducts();
            fetchExchangeRate();
        }
    }, [open]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const formik = useFormik({
        initialValues: {
            productId: '',
            batchCode: '',
            costCurrency: CurrencyType.USD,
            totalCost: '',
            initialQuantity: '',
            profitPercentage: '',
            purchaseDate: new Date(),
            expirationDate: null,
            purchaseExchangeRateId: exchangeRateId
        },
        validationSchema: Yup.object({
            productId: Yup.string().required('El producto es requerido'),
            batchCode: Yup.string().required('El código del lote es requerido'),
            costCurrency: Yup.string().required('La moneda es requerida'),
            totalCost: Yup.number()
                .required('El costo total es requerido')
                .positive('El costo debe ser positivo'),
            initialQuantity: Yup.number()
                .required('La cantidad es requerida')
                .positive('La cantidad debe ser positiva')
                .integer('La cantidad debe ser un número entero'),
            profitPercentage: Yup.number()
                .required('El porcentaje de ganancia es requerido')
                .min(0, 'El porcentaje no puede ser negativo')
                .max(100, 'El porcentaje no puede ser mayor a 100'),
            purchaseDate: Yup.date().required('La fecha de compra es requerida')
        }),
        onSubmit: async (values) => {
            setFormError(null);
            setLoading(true);
            try {
                // Asegurarse de que purchaseExchangeRateId esté actualizado
                values.purchaseExchangeRateId = exchangeRateId;
                await onSave(values);
                onClose();
            } catch (err: any) {
                setFormError(err.message || 'Error al guardar el lote');
            } finally {
                setLoading(false);
            }
        },
        enableReinitialize: true,
    });

    // Resetear el formulario y errores cuando se cierra el diálogo
    useEffect(() => {
        if (!open) {
            formik.resetForm();
            setFormError(null);
            setActiveStep(0);
        }
    }, [open]);

    // Actualizar el ID de la tasa de cambio cuando cambia
    useEffect(() => {
        if (exchangeRateId) {
            formik.setFieldValue('purchaseExchangeRateId', exchangeRateId);
        }
    }, [exchangeRateId]);

    // Cálculos automáticos
    const calculateUnitCost = () => {
        const totalCost = Number(formik.values.totalCost);
        const quantity = Number(formik.values.initialQuantity);

        if (totalCost && quantity && quantity > 0) {
            return totalCost / quantity;
        }
        return 0;
    };

    const calculateSellingPrice = () => {
        const unitCost = calculateUnitCost();
        const profitPercentage = Number(formik.values.profitPercentage);

        if (unitCost && profitPercentage >= 0) {
            return unitCost * (1 + profitPercentage / 100);
        }
        return 0;
    };

    // Conversión de moneda
    const convertCurrency = (amount: number, fromCurrency: string) => {
        if (fromCurrency === CurrencyType.USD) {
            return {
                usd: amount,
                bs: amount * exchangeRate
            };
        } else {
            return {
                usd: amount / exchangeRate,
                bs: amount
            };
        }
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth error={formik.touched.productId && Boolean(formik.errors.productId)}>
                                <InputLabel id="product-select-label">Producto</InputLabel>
                                <Select
                                    labelId="product-select-label"
                                    id="productId"
                                    name="productId"
                                    value={formik.values.productId}
                                    onChange={formik.handleChange}
                                    label="Producto"
                                >
                                    {products.map((product) => (
                                        <MenuItem key={product.id} value={product.id}>
                                            {product.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.productId && formik.errors.productId && (
                                    <FormHelperText>{formik.errors.productId}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                id="batchCode"
                                name="batchCode"
                                label="Código del Lote"
                                value={formik.values.batchCode}
                                onChange={formik.handleChange}
                                error={formik.touched.batchCode && Boolean(formik.errors.batchCode)}
                                helperText={formik.touched.batchCode && formik.errors.batchCode}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                id="initialQuantity"
                                name="initialQuantity"
                                label="Cantidad"
                                type="number"
                                value={formik.values.initialQuantity}
                                onChange={formik.handleChange}
                                error={formik.touched.initialQuantity && Boolean(formik.errors.initialQuantity)}
                                helperText={formik.touched.initialQuantity && formik.errors.initialQuantity}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel id="currency-select-label">Moneda</InputLabel>
                                <Select
                                    labelId="currency-select-label"
                                    id="costCurrency"
                                    name="costCurrency"
                                    value={formik.values.costCurrency}
                                    onChange={formik.handleChange}
                                    label="Moneda"
                                >
                                    <MenuItem value={CurrencyType.USD}>USD</MenuItem>
                                    <MenuItem value={CurrencyType.BS}>Bs</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                id="totalCost"
                                name="totalCost"
                                label={`Costo Total (${formik.values.costCurrency === CurrencyType.USD ? 'USD' : 'Bs'})`}
                                type="number"
                                value={formik.values.totalCost}
                                onChange={formik.handleChange}
                                error={formik.touched.totalCost && Boolean(formik.errors.totalCost)}
                                helperText={formik.touched.totalCost && formik.errors.totalCost}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {formik.values.costCurrency === CurrencyType.USD ? '$' : 'Bs.'}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                id="profitPercentage"
                                name="profitPercentage"
                                label="Porcentaje de Ganancia"
                                type="number"
                                value={formik.values.profitPercentage}
                                onChange={formik.handleChange}
                                error={formik.touched.profitPercentage && Boolean(formik.errors.profitPercentage)}
                                helperText={formik.touched.profitPercentage && formik.errors.profitPercentage}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Fecha de Compra"
                                    value={formik.values.purchaseDate}
                                    onChange={(date) => formik.setFieldValue('purchaseDate', date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: formik.touched.purchaseDate && Boolean(formik.errors.purchaseDate),
                                            helperText: formik.touched.purchaseDate && formik.errors.purchaseDate as string,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Fecha de Vencimiento (opcional)"
                                    value={formik.values.expirationDate}
                                    onChange={(date) => formik.setFieldValue('expirationDate', date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                );
            case 2:
                const unitCost = calculateUnitCost();
                const sellingPrice = calculateSellingPrice();
                const { usd: totalCostUsd, bs: totalCostBs } = convertCurrency(
                    Number(formik.values.totalCost),
                    formik.values.costCurrency
                );

                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Tasa de cambio actual: 1 USD = {exchangeRate.toFixed(2)} Bs
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Divider />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper elevation={2} sx={{ p: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Costo Total
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="body1">USD:</Typography>
                                    <Typography variant="body1">${totalCostUsd.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="body1">Bs:</Typography>
                                    <Typography variant="body1">Bs. {totalCostBs.toFixed(2)}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper elevation={2} sx={{ p: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Costo Unitario
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="body1">USD:</Typography>
                                    <Typography variant="body1">${unitCost.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="body1">Bs:</Typography>
                                    <Typography variant="body1">Bs. {(unitCost * exchangeRate).toFixed(2)}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid

                            size={{ xs: 12 }}>
                            <Divider />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Paper elevation={3} sx={{ p: 2, bgcolor: 'success.light' }}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                    Precio de Venta en USD (con {formik.values.profitPercentage}% de ganancia)
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="body1" fontWeight="bold">USD:</Typography>
                                    <Typography variant="body1" fontWeight="bold">${sellingPrice.toFixed(2)}</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                    El precio de venta siempre se establece en dólares para proteger contra la inflación
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                );
            default:
                return 'Paso desconocido';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {activeStep === steps.length ? 'Resumen del Lote' : 'Registrar Nuevo Lote'}
            </DialogTitle>
            <DialogContent>
                {formError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {formError}
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <form onSubmit={formik.handleSubmit}>
                    {getStepContent(activeStep)}
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                {activeStep > 0 && (
                    <Button onClick={handleBack} disabled={loading}>
                        Atrás
                    </Button>
                )}
                {activeStep < steps.length - 1 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={
                            (activeStep === 0 && (!formik.values.productId || !formik.values.batchCode)) ||
                            (activeStep === 1 && (!formik.values.initialQuantity || !formik.values.totalCost || !formik.values.profitPercentage))
                        }
                    >
                        Siguiente
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => formik.handleSubmit()}
                        disabled={!formik.isValid || loading}
                    >
                        Guardar
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default InventoryBatchFormDialog;
