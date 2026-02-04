import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface CompanyConfig {
  id?: string;
  name: string;
  logoData: string | null;
  logoMimeType: string | null;
  useImage: boolean;
}

interface CompanyContextType {
  company: CompanyConfig;
  updateCompany: (config: Omit<CompanyConfig, 'id'>) => Promise<void>;
  resetCompany: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const defaultCompany: CompanyConfig = {
  name: 'Night Shop',
  logoData: null,
  logoMimeType: null,
  useImage: false,
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyConfig>(defaultCompany);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyConfig();
  }, []);

  const fetchCompanyConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/company/config');
      const data = response.data;

      let logoData: string | null = null;
      if (data.logoData && data.logoMimeType) {
        // Backend ahora devuelve logoData como base64 string
        if (typeof data.logoData === 'string') {
          logoData = `data:${data.logoMimeType};base64,${data.logoData}`;
        }
      }

      setCompany({
        id: data.id,
        name: data.name,
        logoData,
        logoMimeType: data.logoMimeType,
        useImage: data.useImage,
      });
    } catch (err) {
      console.error('Error loading company config:', err);
      setCompany(defaultCompany);
      setError('Error al cargar configuración de empresa');
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (config: Omit<CompanyConfig, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      let logoDataToSend = config.logoData;
      if (logoDataToSend && logoDataToSend.startsWith('data:')) {
        logoDataToSend = logoDataToSend.split(',')[1];
      }

      const response = await api.post('/company/config', {
        name: config.name,
        useImage: config.useImage,
        logoData: logoDataToSend,
        logoMimeType: config.logoMimeType,
      });

      const data = response.data;
      let logoData: string | null = null;
      if (data.logoData && data.logoMimeType) {
        if (typeof data.logoData === 'string') {
          logoData = `data:${data.logoMimeType};base64,${data.logoData}`;
        }
      }

      setCompany({
        id: data.id,
        name: data.name,
        logoData,
        logoMimeType: data.logoMimeType,
        useImage: data.useImage,
      });
    } catch (err) {
      console.error('Error updating company config:', err);
      setError('Error al actualizar configuración de empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post('/company/config/reset');
      setCompany(defaultCompany);
    } catch (err) {
      console.error('Error resetting company config:', err);
      setError('Error al restaurar configuración de empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyContext.Provider value={{ company, updateCompany, resetCompany, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany debe ser usado dentro de CompanyProvider');
  }
  return context;
};
