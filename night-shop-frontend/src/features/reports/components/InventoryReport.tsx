import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import { Refresh as RefreshIcon, Warning as WarningIcon } from '@mui/icons-material';
import api from '../../../services/api';

interface Product {
    id: string;
    name: string;
    currentStock: number;
    threshold: number;
    sellingPrice: number;
}

const InventoryReport: React.FC = () => {
    const [threshold, setThreshold] = useState(10);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get(`/reports/inventory/low-stock?threshold=${threshold}`);
            setProducts(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const getStockColor = (current: number, threshold: number) => {
        if (current === 0) return 'error';
        if (current <= threshold / 2) return 'error';
        if (current <= threshold) return 'warning';
        return 'success';
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
                <CardHeader title="🔍 Filtros" />
                <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                        <TextField
                            label="Umbral de Stock"
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(parseInt(e.target.value))}
                            fullWidth
                            inputProps={{ min: 1, max: 1000 }}
                            helperText="Mostrar productos con stock menor o igual a este valor"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={fetchProducts}
                            fullWidth
                            sx={{ height: '56px' }}
                        >
                            Buscar
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Card>
                    <CardHeader
                        title={`📈 Productos con Stock Bajo (${products.length} total)`}
                        avatar={products.length > 0 ? <WarningIcon sx={{ color: '#ff9800' }} /> : undefined}
                    />
                    <CardContent>
                        {products.length === 0 ? (
                            <Alert severity="success">
                                ✅ No hay productos con stock bajo. Todos los productos tienen stock suficiente.
                            </Alert>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ 
                                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#f5f5f5'
                                        }}>
                                            <TableCell><strong>Producto</strong></TableCell>
                                            <TableCell align="right"><strong>Stock Actual</strong></TableCell>
                                            <TableCell align="right"><strong>Umbral</strong></TableCell>
                                            <TableCell align="center"><strong>Estado</strong></TableCell>
                                            <TableCell align="right"><strong>Precio Venta</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id} hover>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>
                                                    {product.name}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                    <Chip
                                                        label={product.currentStock}
                                                        size="small"
                                                        color={getStockColor(product.currentStock, product.threshold)}
                                                        variant="filled"
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                    {product.threshold}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {product.currentStock === 0 ? (
                                                        <Chip
                                                            label="AGOTADO"
                                                            size="small"
                                                            color="error"
                                                            variant="filled"
                                                        />
                                                    ) : product.currentStock <= product.threshold / 2 ? (
                                                        <Chip
                                                            label="CRÍTICO"
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="BAJO"
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                    {formatCurrency(product.sellingPrice)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default InventoryReport;
