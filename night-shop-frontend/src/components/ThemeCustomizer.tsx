import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { useThemeContext, ThemeColors } from '../context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ThemeCustomizer: React.FC = () => {
  const { preferences, setMode, setColors, resetTheme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const [tempColors, setTempColors] = useState<ThemeColors>(preferences.colors);

  const handleOpen = () => {
    setTempColors(preferences.colors);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setTempColors((prev) => ({
      ...prev,
      [colorKey]: value,
    }));
  };

  const handleSave = () => {
    setColors(tempColors);
    setOpen(false);
  };

  const handleReset = () => {
    resetTheme();
    setTempColors(preferences.colors);
    setOpen(false);
  };

  const colorLabels: Record<keyof ThemeColors, string> = {
    primary: 'Color Primario',
    secondary: 'Color Secundario',
    success: 'Color de Éxito',
    warning: 'Color de Advertencia',
    error: 'Color de Error',
    info: 'Color de Información',
  };

  return (
    <>
      <Tooltip title="Personalizar Tema">
        <IconButton
          onClick={handleOpen}
          sx={{
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Brightness4Icon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Personalizar Tema</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Selector de Modo */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Modo de Tema
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.mode === 'dark'}
                  onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
                />
              }
              label={preferences.mode === 'dark' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Selector de Colores */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Personalizar Colores
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {Object.entries(colorLabels).map(([colorKey, label]) => (
                <Paper
                  key={colorKey}
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={tempColors[colorKey as keyof ThemeColors]}
                      onChange={(e) =>
                        handleColorChange(colorKey as keyof ThemeColors, e.target.value)
                      }
                      style={{
                        width: 50,
                        height: 40,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        flex: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {tempColors[colorKey as keyof ThemeColors]}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Preview de Colores */}
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Vista Previa
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(tempColors).map(([key, color]) => (
                <Box
                  key={key}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: 'divider',
                    title: colorLabels[key as keyof ThemeColors],
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Tooltip title="Restaurar valores por defecto">
            <Button
              onClick={handleReset}
              startIcon={<RestartAltIcon />}
              variant="outlined"
              color="warning"
            >
              Restaurar
            </Button>
          </Tooltip>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ThemeCustomizer;
