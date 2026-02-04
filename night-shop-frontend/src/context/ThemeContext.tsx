import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemePreferences {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

interface ThemeContextType {
  preferences: ThemePreferences;
  setMode: (mode: 'light' | 'dark') => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
  theme: Theme;
}

const DEFAULT_LIGHT_COLORS: ThemeColors = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

const DEFAULT_DARK_COLORS: ThemeColors = {
  primary: '#90caf9',
  secondary: '#f48fb1',
  success: '#81c784',
  warning: '#ffb74d',
  error: '#ef5350',
  info: '#64b5f6',
};

const DEFAULT_PREFERENCES: ThemePreferences = {
  mode: 'light',
  colors: DEFAULT_LIGHT_COLORS,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext debe usarse dentro de ThemeContextProvider');
  }
  return context;
};

const createCustomTheme = (preferences: ThemePreferences): Theme => {
  const isDark = preferences.mode === 'dark';
  const colors = preferences.colors;

  return createTheme({
    palette: {
      mode: preferences.mode,
      primary: {
        main: colors.primary,
        light: isDark ? colors.primary : `${colors.primary}20`,
        dark: isDark ? `${colors.primary}80` : colors.primary,
      },
      secondary: {
        main: colors.secondary,
        light: isDark ? colors.secondary : `${colors.secondary}20`,
        dark: isDark ? `${colors.secondary}80` : colors.secondary,
      },
      success: {
        main: colors.success,
      },
      warning: {
        main: colors.warning,
      },
      error: {
        main: colors.error,
      },
      info: {
        main: colors.info,
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? '#b0b0b0' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(255, 255, 255, 0.15)'
                : '0 8px 24px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          contained: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
          head: {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
            '& .MuiTableCell-head': {
              color: isDark ? '#ffffff' : '#000000',
              fontWeight: 700,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            color: isDark ? '#ffffff' : '#000000',
            fontWeight: 700,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
          filled: {
            '&.MuiChip-colorPrimary': {
              backgroundColor: colors.primary,
              color: '#ffffff',
            },
            '&.MuiChip-colorSuccess': {
              backgroundColor: colors.success,
              color: '#ffffff',
            },
            '&.MuiChip-colorWarning': {
              backgroundColor: colors.warning,
              color: '#ffffff',
            },
            '&.MuiChip-colorError': {
              backgroundColor: colors.error,
              color: '#ffffff',
            },
            '&.MuiChip-colorDefault': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              color: isDark ? '#ffffff' : '#000000',
            },
          },
        },
      },
    },
  });
};

interface ThemeContextProviderProps {
  children: React.ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const saved = localStorage.getItem('themePreferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const theme = createCustomTheme(preferences);

  useEffect(() => {
    localStorage.setItem('themePreferences', JSON.stringify(preferences));
  }, [preferences]);

  const setMode = (mode: 'light' | 'dark') => {
    setPreferences((prev) => ({
      ...prev,
      mode,
      colors: mode === 'light' ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS,
    }));
  };

  const setColors = (colors: Partial<ThemeColors>) => {
    setPreferences((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...colors,
      },
    }));
  };

  const resetTheme = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const value: ThemeContextType = {
    preferences,
    setMode,
    setColors,
    resetTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
