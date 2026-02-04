import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import { SyncStatus, ExchangeRateSyncLog } from '../../../types';

const ExchangeRateSyncStatus: React.FC = () => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
    const [syncHistory, setSyncHistory] = useState<ExchangeRateSyncLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentRateType, setCurrentRateType] = useState<'BCV' | 'CUSTOM'>('BCV');

    useEffect(() => {
        fetchSyncStatus();
        fetchCurrentRateType();
    }, []);

    const fetchSyncStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/exchange-rates/sync-status');
            setSyncStatus(response.data);
        } catch (err) {
            console.error('Error al obtener estado de sincronización:', err);
            setError('Error al cargar el estado de sincronización');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentRateType = async () => {
        try {
            const response = await api.get('/exchange-rates/current-type');
            setCurrentRateType(response.data.rateType);
        } catch (err) {
            console.error('Error al obtener tipo de tasa actual:', err);
        }
    };

    const fetchSyncHistory = async () => {
        try {
            const response = await api.get('/exchange-rates/sync-history?limit=5');
            setSyncHistory(response.data);
        } catch (err) {
            console.error('Error al obtener historial de sincronización:', err);
        }
    };

    const handleOpenHistory = async () => {
        await fetchSyncHistory();
        setHistoryModalOpen(true);
    };

    const handleManualSync = async () => {
        try {
            setSyncing(true);
            setError(null);
            await api.post('/exchange-rates/sync-bcv');
            await fetchSyncStatus();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al sincronizar';
            setError(errorMsg);
        } finally {
            setSyncing(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-VE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'hace unos segundos';
        if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader title="Estado de Sincronización de Tasas" />
                <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    const isFailedSync = syncStatus && !syncStatus.success;

    return (
        <>
            <Card
                sx={{
                    backgroundColor: isFailedSync ? '#fff3e0' : '#f5f5f5',
                    borderLeft: isFailedSync ? '4px solid #ff9800' : '4px solid #4caf50',
                }}
            >
                <CardHeader
                    title="Estado de Sincronización de Tasas"
                    subheader={`Tipo activo: ${currentRateType === 'BCV' ? 'BCV USD' : 'Personalizada'}`}
                    avatar={
                        isFailedSync ? (
                            <ErrorIcon sx={{ color: '#ff9800' }} />
                        ) : (
                            <CheckCircleIcon sx={{ color: '#4caf50' }} />
                        )
                    }
                />
                <CardContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {syncStatus && syncStatus.syncedAt ? (
                        <Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Última sincronización
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {getTimeAgo(syncStatus.syncedAt)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {formatDate(syncStatus.syncedAt)}
                                </Typography>
                            </Box>

                            {isFailedSync ? (
                                <Box sx={{ mb: 2 }}>
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                            ⚠️ Sincronización automática falló
                                        </Typography>
                                        <Typography variant="caption">
                                            {syncStatus.errorMessage}
                                        </Typography>
                                    </Alert>
                                </Box>
                            ) : (
                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Sincronización exitosa"
                                        color="success"
                                        variant="outlined"
                                        sx={{ mb: 2 }}
                                    />
                                    {syncStatus.rate && (
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Tasa actual
                                            </Typography>
                                            <Typography variant="h6">
                                                Bs. {Number(syncStatus.rate).toFixed(2)} por USD
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleManualSync}
                                    disabled={syncing}
                                    size="small"
                                >
                                    {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<HistoryIcon />}
                                    onClick={handleOpenHistory}
                                    size="small"
                                >
                                    Historial
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                No hay registros de sincronización. Realiza una sincronización manual.
                            </Alert>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<RefreshIcon />}
                                onClick={handleManualSync}
                                disabled={syncing}
                            >
                                {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Historial de Sincronización (Últimos 5 intentos)</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {syncHistory.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell align="center">Estado</TableCell>
                                        <TableCell>Detalles</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {syncHistory.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell sx={{ fontSize: '0.85rem' }}>
                                                {formatDate(log.syncedAt)}
                                            </TableCell>
                                            <TableCell align="center">
                                                {log.success ? (
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        label="Exitosa"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<ErrorIcon />}
                                                        label="Falló"
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.85rem' }}>
                                                {log.success ? (
                                                    <Typography variant="caption">
                                                        Tasa: Bs. {Number(log.rate).toFixed(2)}
                                                    </Typography>
                                                ) : (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: '#d32f2f' }}
                                                    >
                                                        {log.errorMessage}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="textSecondary">
                            No hay historial disponible
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryModalOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExchangeRateSyncStatus;
