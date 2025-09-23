/**
 * Configuración centralizada de la aplicación
 * Lee variables de entorno y proporciona valores por defecto
 */

// API y autenticación
export const API_CONFIG = {
  baseUrl: process.env.BACKEND_API_URL || 'http://localhost:3001/api',
  timeout: Number(process.env.REACT_APP_API_TIMEOUT_MS || 30000),
  retryCount: Number(process.env.REACT_APP_RETRY_COUNT || 3),
};

// Autenticación
export const AUTH_CONFIG = {
  tokenKey: process.env.REACT_APP_AUTH_TOKEN_KEY || 'night_shop_token',
  tokenExpiryWarningMinutes: Number(process.env.REACT_APP_TOKEN_EXPIRY_WARNING_MINUTES || 5),
  inactivityTimeoutMinutes: Number(process.env.REACT_APP_INACTIVITY_TIMEOUT_MINUTES || 30),
};

// UI y UX
export const UI_CONFIG = {
  defaultTheme: process.env.REACT_APP_THEME || 'light',
  defaultLanguage: process.env.REACT_APP_LANGUAGE || 'es',
  defaultPageSize: Number(process.env.REACT_APP_DEFAULT_PAGE_SIZE || 10),
};

// Características
export const FEATURES = {
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
};

// Caché
export const CACHE_CONFIG = {
  ttlMinutes: Number(process.env.REACT_APP_CACHE_TTL_MINUTES || 15),
};

// Logs
export const LOG_CONFIG = {
  level: process.env.REACT_APP_LOG_LEVEL || 'error',
};

// Versión de la aplicación
export const APP_VERSION = process.env.REACT_APP_VERSION || '0.1.0';

// Entorno
export const IS_DEVELOPMENT = process.env.REACT_APP_ENV === 'development';
export const IS_PRODUCTION = process.env.REACT_APP_ENV === 'production';
export const IS_TEST = process.env.REACT_APP_ENV === 'test';
