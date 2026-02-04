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
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../../../services/api';
import { ExchangeRate } from '../../../types';

const ExchangeRateSelector: React.FC = () => {
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

    useEffect(() => {
        fetchRateData();
    }, []);

    const fetchRateData = async () => {
        try {
            setLoading(true);
            const [typeRes, ratesRes] = await Promise.all([
                api.get('/exchange-rates/current-type'),
                api.get('/exchange-rates/available'),
            ]);

            setCurrentRateType(typeRes.data.rateType);
            setAvailableRates(ratesRes.data);
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
                <CardHeader title="Selector de Tasa de Cambio" />
                <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader title="Selector de Tasa de Cambio" />
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

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Selecciona el tipo de tasa a utilizar:
                    </Typography>

                    <RadioGroup
                        value={currentRateType}
                        onChange={(e) => handleSwitchRateType(e.target.value as 'BCV' | 'CUSTOM')}
                    >
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

                            {availableRates.bcv && (
                                <Box sx={{ ml: 4, mt: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Tasa actual
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                                    </Box>

                                    {currentRateType === 'BCV' && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<RefreshIcon />}
                                            onClick={handleSyncBCV}
                                            disabled={syncing}
                                            sx={{ mt: 1 }}
                                        >
                                            {syncing ? 'Sincronizando...' : 'Actualizar ahora'}
                                        </Button>
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
                                            Ingresa tu propia tasa de cambio
                                        </Typography>
                                    </Box>
                                }
                            />

                            {currentRateType === 'CUSTOM' && (
                                <Box sx={{ ml: 4, mt: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <TextField
                                            type="number"
                                            label="Tasa (Bs por USD)"
                                            value={customRate}
                                            onChange={(e) => setCustomRate(e.target.value)}
                                            placeholder="Ej: 45.50"
                                            size="small"
                                            inputProps={{ step: '0.01', min: '0' }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleCreateCustomRate}
                                            disabled={!customRate}
                                        >
                                            Guardar
                                        </Button>
                                    </Box>

                                    {availableRates.custom && (
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" color="textSecondary">
                                                    Tasa activa
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                                </Box>
                            )}
                        </Box>
                    </RadioGroup>
                </Box>

                <Alert severity="info">
                    <Typography variant="body2">
                        <strong>Nota:</strong> Cuando usas tasa{' '}
                        <strong>Personalizada</strong>, la sincronización automática con BCV se
                        pausa. Para volver a usar BCV, selecciona "Tasa BCV USD".
                    </Typography>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default ExchangeRateSelector;
