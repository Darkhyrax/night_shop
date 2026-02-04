import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

// Esquema de validación con Yup
const validationSchema = yup.object({
  username: yup
    .string()
    .required('El nombre de usuario es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { company } = useCompany();
  const [error, setError] = useState<string | null>(null);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      try {
        await login({ username: values.username, password: values.password });
        // La redirección se maneja en el useEffect
      } catch (err: any) {
        console.error('Error detallado:', err);
        // Mostrar mensajes de error amigables según el tipo de error
        if (err.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          const status = err.response.status;
          const message = err.response.data?.message;
          
          // Personalizar mensajes según el código y mensaje
          if (status === 401) {
            if (message === 'Invalid credentials') {
              setError('Las credenciales ingresadas no son válidas. Por favor verifica tu usuario y contraseña.');
            } else {
              setError('No tienes autorización para acceder. Por favor inicia sesión nuevamente.');
            }
          } else if (status === 404 && message?.includes('not found')) {
            setError('El usuario ingresado no existe en nuestro sistema.');
          } else if (status === 429) {
            setError('Has realizado demasiados intentos. Por favor espera unos minutos antes de intentar nuevamente.');
          } else {
            setError(`Error al iniciar sesión: ${message || 'Ocurrió un problema con el servidor'}`);
          }
        } else if (err.request) {
          // La solicitud se hizo pero no se recibió respuesta
          setError('No se pudo conectar con el servidor. Por favor verifica tu conexión a internet.');
        } else {
          // Algo ocurrió al configurar la solicitud
          setError(`Error: ${err.message || 'Ocurrió un error inesperado. Por favor intenta nuevamente.'}`);
        }
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 0.5s ease-in',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : '#ffffff',
          }}
        >
          {company.useImage && company.logoData ? (
            <Box
              sx={{
                mt: 2,
                mb: 3,
                width: 120,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={company.logoData}
                alt={company.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          ) : (
            <>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 80, height: 80 }}>
                <LockOutlinedIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
                {company.name}
              </Typography>
            </>
          )}
          <Typography component="h2" variant="subtitle1" sx={{ mt: 2, mb: 3, fontWeight: 600, color: 'text.primary' }}>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2, width: '100%' }}>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Usuario *"
              name="username"
              autoComplete="username"
              autoFocus
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}33`,
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Contraseña *"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}33`,
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
