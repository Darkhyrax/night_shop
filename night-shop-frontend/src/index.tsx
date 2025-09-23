import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import api from './services/api';

// Configurar la URL base de la API según el entorno
const apiBaseUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000/api';
api.defaults.baseURL = apiBaseUrl;

// Configurar manejo global de errores
const errorHandler = (error: Error) => {
  console.error('Error no controlado:', error);
  // Aquí se podría implementar un servicio de registro de errores
};

// Configurar manejo global de errores no controlados
window.addEventListener('error', (event) => {
  errorHandler(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler(event.reason);
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
