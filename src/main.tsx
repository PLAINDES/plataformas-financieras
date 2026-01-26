// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Importar estilos globales/*  */
import './styles/global.css';

// Configurar variables globales del window (equivalente al script original)
declare global {
  interface Window {
    AppFinanceWeb: {
      api: string;
      margarita: string;
    };
  }
}

window.AppFinanceWeb = {
  api: import.meta.env.VITE_API_URL_FINANCE || '',
  margarita: import.meta.env.VITE_API_URL_MARGARITA || '',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);