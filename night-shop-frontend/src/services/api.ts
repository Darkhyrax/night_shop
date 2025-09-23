import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/appConfig';

// Crear una instancia de axios con la configuración base
const api = axios.create({
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// La URL base se configura en index.tsx

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Solo redirigir si NO estamos ya en la página de login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Exportar tanto como default como named export para mayor flexibilidad
export { api };
export default api;
