import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import { CompanyProvider } from './context/CompanyContext';
import AppRoutes from './routes/AppRoutes';
import LoadingScreen from './components/LoadingScreen';
import DocumentTitleUpdater from './components/DocumentTitleUpdater';
import './App.css';

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <Suspense fallback={<LoadingScreen />}>
        <AuthProvider>
          <CompanyProvider>
            <DocumentTitleUpdater />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CompanyProvider>
        </AuthProvider>
      </Suspense>
    </ThemeContextProvider>
  );
}

export default App;
