// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@features/landing/LandingPage';
import KapitalPage from './features/finance/kapital/KapitalPage';
import { InternalLayout } from '@shared/components/layout/InternalLayout';
import { useAuthContext } from '@features/auth/hooks/useAuthContext';
import ValoraPage from './features/finance/valora/ValoraPage';
import { PublicLayout } from '@shared/components/layout/PublicLayout';

const COMPANY = {
  id: 1,
  name: 'Plataforma Finanzas',
  host: 'https://kapitals.org',
  logos: [
    { id: 1, patch: '/images/logo.png', type: 'default' as const },
    { id: 2, patch: '/images/diseñador.png', type: 'sticky' as const },
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

      {/* Rutas públicas */}
      <Route element={
        <PublicLayout
          user={user}
          logout={logout}
          login={login}
          register={register}
          company={COMPANY}
        />
      }>
        <Route
          path="/"
          element={
            <LandingPage
              isAdmin={user?.role === "admin"}
              company={COMPANY}
              user={user}
              onLogout={logout}
              onLogin={login}
              onRegister={register}
            />
          }
        />
      </Route>

      {/* Rutas internas */}
      <Route
        element={
          <InternalLayout
            user={user}
            onLogout={logout}
            company={COMPANY}
          />
        }
      >
        <Route path="/kapital" element={<KapitalPage />} />
        <Route path="/valora" element={<ValoraPage />} />
      </Route>

    </Routes>
  );
}

export default App;