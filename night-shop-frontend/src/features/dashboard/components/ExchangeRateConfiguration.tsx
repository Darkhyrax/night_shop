import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import { ExchangeRate } from '../../../types';

const ExchangeRateConfiguration: React.FC = () => {
    const [currentRateType, setCurrentRateType] = useState<'BCV' | 'CUSTOM'>('BCV');
    const [availableRates, setAvailableRates] = useState<{
        bcv: ExchangeRate | null;
        custom: ExchangeRate | null;
    }>({ bcv: null, custom: null });
    const [customRate, setCustomRate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchRateData();
    }, []);

    const fetchRateData = async () => {
        try {
            setLoading(true);
            const [typeRes, ratesRes, latestBcvRes] = await Promise.all([
                api.get('/exchange-rates/current-type'),
                api.get('/exchange-rates/available'),
                api.get('/exchange-rates/latest-bcv').catch(() => ({ data: null })),
            ]);

            setCurrentRateType(typeRes.data.rateType);
            const rates = ratesRes.data;
            
            // Si no hay tasa BCV activa, usar la última guardada
            if (!rates.bcv && latestBcvRes.data) {
                rates.bcv = latestBcvRes.data;
            }
            
            setAvailableRates(rates);
        } catch (err) {
            console.error('Error al obtener datos de tasas:', err);
            setError('Error al cargar las tasas de cambio');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncBCV = async () => {
        try {
            setSyncing(true);
            setError(null);
            setSuccess(null);
            await api.post('/exchange-rates/sync-bcv');
            await fetchRateData();
            setSuccess('Tasa BCV sincronizada exitosamente');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al sincronizar BCV';
            setError(errorMsg);
        } finally {
            setSyncing(false);
        }
    };

    const handleSwitchRateType = async (rateType: 'BCV' | 'CUSTOM') => {
        try {
            setError(null);
            setSuccess(null);
            await api.post('/exchange-rates/switch-rate-type', { rateType });
            setCurrentRateType(rateType);
            setSuccess(`Cambiado a tasa ${rateType === 'BCV' ? 'BCV' : 'Personalizada'}`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al cambiar tipo de tasa';
            setError(errorMsg);
        }
    };

    const handleCreateCustomRate = async () => {
        if (!customRate || isNaN(Number(customRate))) {
            setError('Ingresa un valor numérico válido');
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            const today = new Date().toISOString().split('T')[0];
            await api.post('/exchange-rates/custom', {
                rate: Number(customRate),
                effectiveDate: today,
                source: 'Manual',
                notes: 'Tasa personalizada del usuario',
            });
            await fetchRateData();
            setCustomRate('');
            setEditDialogOpen(false);
            setSuccess('Tasa personalizada creada y activada');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al crear tasa personalizada';
            setError(errorMsg);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-VE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader title="Configuración de Tasa de Cambio" />
                <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader title="Configuración de Tasa de Cambio" />
                <CardContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <RadioGroup value={currentRateType} onChange={(e) => handleSwitchRateType(e.target.value as 'BCV' | 'CUSTOM')}>
                        {/* Opción BCV */}
                        <Box
                            sx={{
                                p: 2,
                                mb: 2,
                                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`,
                                borderRadius: 1,
                                backgroundColor: (theme) => currentRateType === 'BCV' 
                                  ? (theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9')
                                  : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa'),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <FormControlLabel
                                value="BCV"
                                control={<Radio />}
                                label={
                                    <Box sx={{ ml: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            Tasa BCV USD
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Tasa oficial del Banco Central de Venezuela
                                        </Typography>
                                    </Box>
                                }
                            />

                            {currentRateType === 'BCV' && (
                                <Box sx={{ ml: 4, mt: 2 }}>
                                    {availableRates.bcv ? (
                                        <>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Tasa en uso
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        Bs. {Number(availableRates.bcv.rate).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Fecha
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDate(availableRates.bcv.effectiveDate)}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    icon={<CheckCircleIcon />}
                                                    label="Activa"
                                                    color="success"
                                                    size="small"
                                                />
                                            </Box>

                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<RefreshIcon />}
                                                onClick={handleSyncBCV}
                                                disabled={syncing}
                                                size="small"
                                            >
                                                {syncing ? 'Sincronizando...' : 'Actualizar ahora'}
                                            </Button>
                                        </>
                                    ) : (
                                        <Box>
                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                                No hay tasa BCV guardada. Sincroniza para obtenerla.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<RefreshIcon />}
                                                onClick={handleSyncBCV}
                                                disabled={syncing}
                                                size="small"
                                            >
                                                {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* Opción Personalizada */}
                        <Box
                            sx={{
                                p: 2,
                                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`,
                                borderRadius: 1,
                                backgroundColor: (theme) => currentRateType === 'CUSTOM' 
                                  ? (theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0')
                                  : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa'),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <FormControlLabel
                                value="CUSTOM"
                                control={<Radio />}
                                label={
                                    <Box sx={{ ml: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            Tasa Personalizada
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Usa tu propia tasa de cambio
                                        </Typography>
                                    </Box>
                                }
                            />

                            {currentRateType === 'CUSTOM' && (
                                <Box sx={{ ml: 4, mt: 2 }}>
                                    {availableRates.custom && (
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="textSecondary">
                                                    Tasa actual
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    Bs. {Number(availableRates.custom.rate).toFixed(2)}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={<CheckCircleIcon />}
                                                label="Activa"
                                                color="warning"
                                                size="small"
                                            />
                                        </Box>
                                    )}

                                    <Button
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={() => setEditDialogOpen(true)}
                                        size="small"
                                    >
                                        {availableRates.custom ? 'Cambiar tasa' : 'Establecer tasa'}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </RadioGroup>

                    <Alert severity="info" sx={{ 
                      mt: 3,
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.05)',
                      border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'}`
                    }}>
                        <Typography variant="body2">
                            <strong>Nota:</strong> Cuando usas tasa <strong>Personalizada</strong>, la
                            sincronización automática con BCV se pausa. Para volver a usar BCV, selecciona
                            "Tasa BCV USD".
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>

            {/* Dialog para cambiar tasa personalizada */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Cambiar Tasa Personalizada</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Nueva tasa (Bs por USD)"
                        value={customRate}
                        onChange={(e) => setCustomRate(e.target.value)}
                        placeholder="Ej: 50.00"
                        inputProps={{ step: '0.01', min: '0' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                      onClick={() => setEditDialogOpen(false)}
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
                    <Button
                        onClick={handleCreateCustomRate}
                        variant="contained"
                        disabled={!customRate || isNaN(Number(customRate))}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExchangeRateConfiguration;
