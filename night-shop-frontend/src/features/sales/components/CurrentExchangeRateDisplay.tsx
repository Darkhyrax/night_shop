import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import api from '../../../services/api';
import { ExchangeRate } from '../../../types';

const CurrentExchangeRateDisplay: React.FC = () => {
    const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null);
    const [rateType, setRateType] = useState<'BCV' | 'CUSTOM'>('BCV');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRateData();
    }, []);

    const fetchRateData = async () => {
        try {
            setLoading(true);
            const [typeRes, rateRes] = await Promise.all([
                api.get('/exchange-rates/current-type'),
                api.get('/exchange-rates/current'),
            ]);

            setRateType(typeRes.data.rateType);
            setCurrentRate(rateRes.data);
        } catch (err) {
            console.error('Error al obtener tasa de cambio:', err);
            setError('Error al cargar la tasa de cambio');
        } finally {
            setLoading(false);
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
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Card sx={{ 
          mb: 3, 
          backgroundColor: (theme) => rateType === 'BCV' 
            ? (theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9')
            : (theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0'),
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" color="textSecondary">
                            Tasa de cambio actual
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Bs. {currentRate ? Number(currentRate.rate).toFixed(2) : '0.00'}
                            </Typography>
                            <Chip
                                label={rateType === 'BCV' ? 'BCV' : 'Personalizada'}
                                size="small"
                                color={rateType === 'BCV' ? 'success' : 'warning'}
                                variant="outlined"
                            />
                        </Box>
                        {currentRate && (
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                Fecha: {formatDate(currentRate.effectiveDate)}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                        <InfoIcon sx={{ fontSize: 20, color: 'info.main', mb: 1 }} />
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            Configura la tasa en el
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontWeight: 600 }}>
                            Dashboard
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CurrentExchangeRateDisplay;
