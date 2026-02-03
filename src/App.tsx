// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './app/landing/LandingPage';
import KapitalPage from './app/kapital/KapitalPage';
import { InternalLayout } from './components/layout/InternalLayout';
import { useAuthContext } from './hooks/useAuthContext';
import type { MenuItem } from './types';
import ValoraPage from './app/valora/ValoraPage';

const COMPANY = {
  id: 1,
  name: 'Plataforma Finanzas',
  host: 'https://kapitals.org',
  logos: [
    { id: 1, patch: '/images/logo.png', type: 'default' },
    { id: 2, patch: '/images/diseñador.png', type: 'sticky' },
  ],
};


function App() {
  const {
    user,
    logout,
    login,
    register,
    loading: authLoading,
  } = useAuthContext();

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page - sin layout, maneja todo internamente */}
      <Route 
        path="/" 
        element={
          <LandingPage 
            isAdmin={user?.role === 'admin'}
            company={COMPANY}
            user={user}
            onLogout={logout}
            onLogin={login}
            onRegister={register}
          />
        } 
      />

      {/* Páginas internas - con InternalLayout */}
      <Route element={<InternalLayout user={user} onLogout={logout} company={COMPANY} />}>
        <Route path="/kapital" element={<KapitalPage />} />
        <Route path="/valora" element={<ValoraPage />} />
      </Route>

   
    </Routes>
  );
}

export default App;