import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useCompany } from '../context/CompanyContext';

interface CompanyConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const CompanyConfigDialog: React.FC<CompanyConfigDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { company, updateCompany, resetCompany } = useCompany();
  const [name, setName] = useState(company.name);
  const [useImage, setUseImage] = useState(company.useImage);
  const [logoData, setLogoData] = useState(company.logoData || '');
  const [preview, setPreview] = useState<string | null>(company.logoData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(company.name);
      setUseImage(company.useImage);
      setLogoData(company.logoData || '');
      setPreview(company.logoData);
      setError(null);
    }
  }, [open, company]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe exceder 5MB');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Comprimir imagen antes de convertir a base64
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      img.onload = () => {
        // Limitar tamaño máximo a 150x150px
        const maxSize = 150;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convertir a base64 con compresión (calidad 0.6)
          let compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          
          // Si sigue siendo muy grande, reducir más la calidad
          if (compressedBase64.length > 50000) {
            compressedBase64 = canvas.toDataURL('image/jpeg', 0.4);
          }
          
          setLogoData(compressedBase64);
          setPreview(compressedBase64);
          setUseImage(true);
          setLoading(false);
        }
      };
      
      img.onerror = () => {
        setError('Error al procesar la imagen');
        setLoading(false);
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        setError('Error al leer el archivo');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al cargar la imagen');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre de la empresa es requerido');
      return;
    }

    if (useImage && !logoData) {
      setError('Por favor carga una imagen o selecciona usar texto');
      return;
    }

    try {
      setLoading(true);
      await updateCompany({
        name: name.trim(),
        logoData: useImage ? logoData : null,
        logoMimeType: useImage && logoData ? logoData.split(';')[0].split(':')[1] : null,
        useImage,
      });
      onClose();
    } catch (err) {
      setError('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetCompany();
      setName('Night Shop');
      setUseImage(false);
      setLogoData('');
      setPreview(null);
    } catch (err) {
      setError('Error al restaurar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setLogoData('');
    setPreview(null);
    setUseImage(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuración de Empresa</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Nombre de Empresa */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Nombre de Empresa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Mi Tienda"
            helperText="Este nombre se mostrará en la barra lateral"
          />
        </Box>

        {/* Selector de Logo */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Logo de Empresa
          </Typography>
          <RadioGroup
            value={useImage ? 'image' : 'text'}
            onChange={(e) => setUseImage(e.target.value === 'image')}
          >
            <FormControlLabel
              value="text"
              control={<Radio />}
              label="Usar texto (nombre de empresa)"
            />
            <FormControlLabel
              value="image"
              control={<Radio />}
              label="Usar imagen/logo"
            />
          </RadioGroup>
        </Box>

        {/* Carga de Imagen */}
        {useImage && (
          <Box sx={{ mb: 3 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : theme.palette.grey[100],
                border: (theme) =>
                  `2px dashed ${theme.palette.primary.main}`,
                borderRadius: 1,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : theme.palette.grey[200],
                  borderColor: (theme) => theme.palette.primary.light,
                },
              }}
              component="label"
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImageUpload}
                disabled={loading}
              />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 40, mb: 1, opacity: 0.6 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Haz clic para cargar una imagen
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    PNG, JPG, GIF (máximo 5MB)
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Alerta de Recomendación */}
            <Alert severity="info" sx={{ mt: 2 }}>
              Se recomienda usar imágenes cuadradas o rectangulares con altura máxima de 60px
            </Alert>

            {/* Preview de Imagen */}
            {preview && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Vista Previa
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : theme.palette.grey[100],
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 120,
                    borderRadius: 1,
                    border: (theme) =>
                      `1px solid ${
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : theme.palette.grey[300]
                      }`,
                  }}
                >
                  <img
                    src={preview}
                    alt="Logo preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 120,
                      objectFit: 'contain',
                    }}
                  />
                </Paper>
                <Button
                  fullWidth
                  startIcon={<DeleteIcon />}
                  color="error"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={handleRemoveImage}
                >
                  Eliminar Imagen
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Preview del Logo en Sidebar */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Vista Previa en Barra Lateral
          </Typography>
          <Paper
            sx={{
              p: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : theme.palette.grey[100],
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minHeight: 70,
              border: (theme) =>
                `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : theme.palette.grey[300]
                }`,
            }}
          >
            {useImage && preview ? (
              <img
                src={preview}
                alt="Logo"
                style={{
                  height: 60,
                  maxWidth: 60,
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: (theme) => theme.palette.text.primary,
                }}
              >
                {name || 'Night Shop'}
              </Typography>
            )}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ gap: 1, p: 2 }}>
        <Button 
          onClick={handleReset} 
          variant="outlined"
          sx={{
            color: (theme) => theme.palette.warning.main,
            borderColor: (theme) => theme.palette.warning.main,
            '&:hover': {
              backgroundColor: (theme) => `${theme.palette.warning.main}15`,
              borderColor: (theme) => theme.palette.warning.dark,
            },
          }}
        >
          Restaurar
        </Button>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            color: (theme) => theme.palette.text.secondary,
            borderColor: (theme) => theme.palette.divider,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyConfigDialog;
