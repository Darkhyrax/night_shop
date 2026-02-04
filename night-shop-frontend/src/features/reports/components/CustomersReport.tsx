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
    Tabs,
    Tab,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../../../services/api';

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    totalPurchases?: number;
    totalSpentUsd?: number;
    totalSpentBs?: number;
    totalDebtUsd?: number;
    accountsCount?: number;
}

const CustomersReport: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [limit, setLimit] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
    const [topDebtors, setTopDebtors] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const [topRes, debtorsRes] = await Promise.all([
                api.get(`/reports/customers/top?${params.toString()}`),
                api.get(`/reports/customers/top-debtors?limit=${limit}`),
            ]);

            setTopCustomers(topRes.data);
            setTopDebtors(debtorsRes.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
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
                            onClick={fetchReports}
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
                <>
                    <Card>
                        <Tabs
                            value={tabValue}
                            onChange={(e, v) => setTabValue(v)}
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label="👥 Clientes Más Activos" />
                            <Tab label="💳 Mayor Deuda" />
                        </Tabs>
                    </Card>

                    {tabValue === 0 && (
                        <Card>
                            <CardHeader title={`👥 Top ${limit} Clientes Más Activos`} />
                            <CardContent>
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ 
                                              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#f5f5f5'
                                            }}>
                                                <TableCell><strong>Cliente</strong></TableCell>
                                                <TableCell><strong>Email</strong></TableCell>
                                                <TableCell align="right"><strong>Compras</strong></TableCell>
                                                <TableCell align="right"><strong>Gastado USD</strong></TableCell>
                                                <TableCell align="right"><strong>Gastado Bs</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topCustomers.map((customer, index) => (
                                                <TableRow key={customer.id} hover>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>
                                                        <strong>{index + 1}.</strong> {customer.firstName} {customer.lastName}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>
                                                        {customer.email || '-'}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {customer.totalPurchases}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {formatCurrency(customer.totalSpentUsd || 0, false)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {formatCurrency(customer.totalSpentBs || 0, true)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}

                    {tabValue === 1 && (
                        <Card>
                            <CardHeader title={`💳 Top ${limit} Clientes con Mayor Deuda`} />
                            <CardContent>
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ 
                                              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#f5f5f5'
                                            }}>
                                                <TableCell><strong>Cliente</strong></TableCell>
                                                <TableCell><strong>Teléfono</strong></TableCell>
                                                <TableCell align="right"><strong>Deuda USD</strong></TableCell>
                                                <TableCell align="right"><strong>Cuentas Pendientes</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topDebtors.map((customer, index) => (
                                                <TableRow key={customer.id} hover>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>
                                                        <strong>{index + 1}.</strong> {customer.firstName} {customer.lastName}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>
                                                        {customer.phone || '-'}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {formatCurrency(customer.totalDebtUsd || 0, false)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {customer.accountsCount}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </Box>
    );
};

export default CustomersReport;
