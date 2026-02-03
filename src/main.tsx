// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/auth.context';
import './styles/global.css';

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
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
