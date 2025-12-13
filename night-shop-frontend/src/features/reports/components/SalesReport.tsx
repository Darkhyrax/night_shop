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
    Typography,
    Chip,
    Alert,
} from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshIcon, Clear as ClearIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import api from '../../../services/api';
import SaleDetailsModal from '../../sales/components/SaleDetailsModal';
import { Sale } from '../../../types';

interface SalesData {
    data: any[];
    total: number;
    limit: number;
    offset: number;
    pages: number;
}

interface SalesSummary {
    totalSales: number;
    completedSales: number;
    pendingSales: number;
    cashSales: number;
    creditSales: number;
    totalUsd: number;
    totalBs: number;
    paidUsd: number;
    paidBs: number;
    pendingUsd: number;
}

const SalesReport: React.FC = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentExchangeRate, setCurrentExchangeRate] = useState<number>(1);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const [salesRes, summaryRes, rateRes] = await Promise.all([
                api.get(`/reports/sales?${params.toString()}`),
                api.get(`/reports/sales/summary?${params.toString()}`),
                api.get('/exchange-rates/current'),
            ]);

            setSalesData(salesRes.data);
            setSummary(summaryRes.data);
            setCurrentExchangeRate(Number(rateRes.data.rate) || 1);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchReports();
    }, []);

    const formatCurrency = (value: number | null | undefined, isBs: boolean = false) => {
        if (value === null || value === undefined || isNaN(Number(value))) {
            return isBs ? 'Bs. 0.00' : '$0.00';
        }

        const numValue = Number(value);

        return isBs
            ? `Bs. ${numValue.toFixed(2)}`
            : `$${numValue.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE');
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSalesData(null);
        setSummary(null);
    };

    const handleDownloadExcel = () => {
        if (!salesData || !summary) {
            alert('No hay datos para descargar');
            return;
        }

        // Crear HTML para Excel con estilos
        let html = `
            <html xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; }
                    .header { background-color: #1976d2; color: white; font-weight: bold; padding: 10px; font-size: 16px; }
                    .subheader { background-color: #e3f2fd; font-weight: bold; padding: 8px; font-size: 12px; border-bottom: 2px solid #1976d2; }
                    .summary-label { background-color: #f5f5f5; font-weight: bold; padding: 6px; border-right: 1px solid #ddd; }
                    .summary-value { background-color: #fafafa; padding: 6px; }
                    .summary-highlight { background-color: #fff3e0; font-weight: bold; }
                    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
                    th { background-color: #1976d2; color: white; padding: 8px; text-align: left; border: 1px solid #1565c0; }
                    td { padding: 6px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    tr:hover { background-color: #f0f0f0; }
                    .total-row { background-color: #e8f5e9; font-weight: bold; }
                    .cash { background-color: #c8e6c9; }
                    .credit { background-color: #ffccbc; }
                </style>
            </head>
            <body>
                <div class="header">📊 REPORTE DE VENTAS</div>
                <br>
                <table>
                    <tr>
                        <td><strong>Período:</strong></td>
                        <td>${startDate || 'Inicio'} a ${endDate || 'Fin'}</td>
                    </tr>
                    <tr>
                        <td><strong>Fecha de generación:</strong></td>
                        <td>${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}</td>
                    </tr>
                </table>
                
                <br><br>
                <div class="subheader">📈 RESUMEN</div>
                <table>
                    <tr>
                        <td class="summary-label">Total de Ventas</td>
                        <td class="summary-value">${summary.totalSales}</td>
                    </tr>
                    <tr>
                        <td class="summary-label">Completadas</td>
                        <td class="summary-value">${summary.completedSales}</td>
                    </tr>
                    <tr>
                        <td class="summary-label">Pendientes</td>
                        <td class="summary-value">${summary.pendingSales}</td>
                    </tr>
                    <tr>
                        <td class="summary-label">Contado</td>
                        <td class="summary-value cash">${summary.cashSales}</td>
                    </tr>
                    <tr>
                        <td class="summary-label">Crédito</td>
                        <td class="summary-value credit">${summary.creditSales}</td>
                    </tr>
                    <tr>
                        <td class="summary-label">Ingresos USD Esperado</td>
                        <td class="summary-value summary-highlight">$${summary.totalUsd.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="summary-label">Pagado USD</td>
                        <td class="summary-value">$${summary.paidUsd.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="summary-label">Pagado Bs</td>
                        <td class="summary-value">Bs. ${summary.paidBs.toFixed(2)}</td>
                    </tr>
                </table>
                
                <br><br>
                <div class="subheader">📋 DETALLE DE VENTAS</div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Total USD</th>
                            <th>Total Bs</th>
                            <th>Pagado USD</th>
                            <th>Pagado Bs</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${salesData.data.map((sale) => `
                            <tr>
                                <td>${sale.id.substring(0, 8)}</td>
                                <td>${formatDate(sale.createdAt)}</td>
                                <td>$${Number(sale.totalAmountUsd).toFixed(2)}</td>
                                <td>Bs. ${Number(sale.totalAmountBs).toFixed(2)}</td>
                                <td>$${Number(sale.paidAmountUsd).toFixed(2)}</td>
                                <td>Bs. ${Number(sale.paidAmountBs).toFixed(2)}</td>
                                <td class="${sale.saleType === 'cash' ? 'cash' : 'credit'}">${sale.saleType === 'cash' ? 'Contado' : 'Crédito'}</td>
                                <td>${sale.status === 'completed' ? '✓ Completada' : '⏳ Pendiente'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        // Descargar
        const element = document.createElement('a');
        element.setAttribute('href', 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(html));
        element.setAttribute('download', `reporte-ventas-${new Date().getTime()}.xls`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Filtros */}
            <Card>
                <CardHeader title="🔍 Filtros" />
                <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
                        <TextField
                            label="Fecha Inicio"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="Fecha Fin"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
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
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters}
                            fullWidth
                            sx={{ height: '56px' }}
                        >
                            Limpiar
                        </Button>
                        <Button
                            variant="outlined"
                            color="success"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadExcel}
                            fullWidth
                            sx={{ height: '56px' }}
                        >
                            Excel
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
                    {/* Resumen */}
                    {summary && (
                        <Card>
                            <CardHeader title="📈 Resumen de Ventas" />
                            <CardContent>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                                <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Total de Ventas
                                    </Typography>
                                    <Typography variant="h6">{summary.totalSales}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {summary.completedSales} completadas, {summary.pendingSales} pendientes
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, backgroundColor: '#f3e5f5', borderRadius: 1 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Ventas por Tipo
                                    </Typography>
                                    <Typography variant="h6">
                                        {summary.cashSales} / {summary.creditSales}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Contado / Crédito
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                        Ingresos USD Esperado
                                    </Typography>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        {formatCurrency(summary.totalUsd, false)}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                                        Ingreso Real en USD:
                                    </Typography>
                                    <Box sx={{ pl: 1, borderLeft: '3px solid #2e7d32' }}>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                                            En USD: {formatCurrency(summary.paidUsd, false)}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                                            En Bs: {formatCurrency(summary.paidBs, true)} = {formatCurrency(summary.paidBs / currentExchangeRate, false)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', fontWeight: 'bold', color: '#2e7d32', mt: 0.5 }}>
                                            Total: {formatCurrency(summary.paidUsd + (summary.paidBs / currentExchangeRate), false)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 1, fontStyle: 'italic' }}>
                                        Tasa actual: 1 USD = {currentExchangeRate.toFixed(2)} Bs
                                    </Typography>
                                </Box>
                            </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabla de Ventas */}
                    {salesData && (
                        <Card>
                            <CardHeader
                                title={`📋 Detalle de Ventas (${salesData.total} total)`}
                            />
                            <CardContent>
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableCell><strong>ID</strong></TableCell>
                                                <TableCell><strong>Fecha</strong></TableCell>
                                                <TableCell align="right"><strong>Total USD</strong></TableCell>
                                                <TableCell align="right"><strong>Total Bs</strong></TableCell>
                                                <TableCell align="right"><strong>Pagado USD</strong></TableCell>
                                                <TableCell align="right"><strong>Pagado Bs</strong></TableCell>
                                                <TableCell align="center"><strong>Tipo</strong></TableCell>
                                                <TableCell align="center"><strong>Estado</strong></TableCell>
                                                <TableCell align="center"><strong>Acciones</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {salesData.data.map((sale) => (
                                                <TableRow key={sale.id} hover>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>
                                                        {sale.id.substring(0, 8)}...
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>
                                                        {formatDate(sale.createdAt)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {formatCurrency(Number(sale.totalAmountUsd), false)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {formatCurrency(Number(sale.totalAmountBs), true)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {formatCurrency(Number(sale.paidAmountUsd), false)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                                        {formatCurrency(Number(sale.paidAmountBs), true)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={sale.saleType === 'cash' ? 'Contado' : 'Crédito'}
                                                            size="small"
                                                            color={sale.saleType === 'cash' ? 'success' : 'warning'}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={sale.status === 'completed' ? 'Completada' : 'Pendiente'}
                                                            size="small"
                                                            color={sale.status === 'completed' ? 'success' : 'warning'}
                                                            variant="filled"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="primary"
                                                            startIcon={<VisibilityIcon />}
                                                            onClick={async () => {
                                                                try {
                                                                    const response = await api.get(`/sales/${sale.id}`);
                                                                    setSelectedSale(response.data);
                                                                    setDetailsModalOpen(true);
                                                                } catch (err) {
                                                                    console.error('Error al obtener detalles:', err);
                                                                }
                                                            }}
                                                        >
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Página {salesData.offset / salesData.limit + 1} de {salesData.pages}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
            {selectedSale && (
                <SaleDetailsModal
                    open={detailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    sale={selectedSale}
                />
            )}
        </Box>
    );
};

export default SalesReport;
