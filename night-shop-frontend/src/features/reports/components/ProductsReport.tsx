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
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../../../services/api';

interface Product {
    id: string;
    name: string;
    totalQuantitySold: number;
    totalRevenueUsd: number;
    totalRevenueBs: number;
    averagePrice: number;
}

const ProductsReport: React.FC = () => {
    const [limit, setLimit] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await api.get(`/reports/products/top?${params.toString()}`);
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

    const formatCurrency = (value: number, isBs: boolean = false) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: isBs ? 'VES' : 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
                <CardHeader title="🔍 Filtros" />
                <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
                        <TextField
                            label="Límite"
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                            fullWidth
                            inputProps={{ min: 1, max: 100 }}
                        />
                        <TextField
                            label="Fecha Inicio"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{
                              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                filter: (theme) => theme.palette.mode === 'dark' ? 'invert(0.8)' : 'invert(0)',
                                cursor: 'pointer',
                              }
                            }}
                        />
                        <TextField
                            label="Fecha Fin"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{
                              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                filter: (theme) => theme.palette.mode === 'dark' ? 'invert(0.8)' : 'invert(0)',
                                cursor: 'pointer',
                              }
                            }}
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
                    <CardHeader title={`📦 Top ${limit} Productos Más Vendidos`} />
                    <CardContent>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ 
                                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#f5f5f5'
                                    }}>
                                        <TableCell><strong>Producto</strong></TableCell>
                                        <TableCell align="right"><strong>Cantidad Vendida</strong></TableCell>
                                        <TableCell align="right"><strong>Ingresos USD</strong></TableCell>
                                        <TableCell align="right"><strong>Ingresos Bs</strong></TableCell>
                                        <TableCell align="right"><strong>Precio Promedio</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product, index) => (
                                        <TableRow key={product.id} hover>
                                            <TableCell sx={{ fontSize: '0.85rem' }}>
                                                <strong>{index + 1}.</strong> {product.name}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                {product.totalQuantitySold}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                {formatCurrency(product.totalRevenueUsd, false)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                {formatCurrency(product.totalRevenueBs, true)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                {formatCurrency(product.averagePrice, false)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default ProductsReport;
