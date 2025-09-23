import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, LoginCredentials, AuthResponse } from '../types';
import { AUTH_CONFIG } from '../config/appConfig';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Usar la configuración centralizada para la clave del token

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_CONFIG.tokenKey));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem(AUTH_CONFIG.tokenKey);
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Llamada al endpoint para verificar el token
        const response = await api.get('/auth/profile');
        // Adaptamos la respuesta del backend
        setUser(response.data.user);
        setToken(storedToken);
      } catch (err) {
        console.error('Error al verificar token:', err);
        // Si el token no es válido, limpiar el almacenamiento
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Enviando credenciales:', { ...credentials, password: '***' });
      console.log('URL de la API:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', credentials);
      console.log('Respuesta del servidor:', response.data);
      
      // Adaptamos la respuesta del backend que usa access_token en lugar de token
      const { user, access_token } = response.data;
      
      localStorage.setItem(AUTH_CONFIG.tokenKey, access_token);
      setUser(user);
      setToken(access_token);
    } catch (err: any) {
      console.error('Error de login detallado:', err);
      
      if (err.response) {
        console.error('Respuesta de error:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Credenciales inválidas'}`);
      } else {
        setError('Error de conexión con el servidor');
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
