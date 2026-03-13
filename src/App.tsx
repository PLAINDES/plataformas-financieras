// src/App.tsx

import { Routes, Route, Outlet } from "react-router-dom";
import { LandingPage } from "@features/landing/LandingPage";
import KapitalPage from "./features/finance/kapital/KapitalPage";
import { InternalLayout } from "@shared/components/layout/InternalLayout";
import { useAuthContext } from "@features/auth/hooks/useAuthContext";
import ValoraPage from "./features/finance/valora/ValoraPage";
import { PublicLayout } from "@shared/components/layout/PublicLayout";
import DashboardPage from "@features/admin/DashboardPage";
import { ProtectedRoute } from "@features/auth/components/ProtectedRoute";
import MainLayout from "@features/admin/MainLayout";
import { PlantillasMaestrasPage } from "./features/admin/pages/PlantillasMaestrasPage";
import { ReportesKapitalPage } from "./features/admin/pages/ReportesKapitalPage";
import { ReportesValoraPage } from "./features/admin/pages/ReportesValoraPage";
import { ConfiguracionPage } from "./features/admin/pages/ConfiguracionPage";
import ProyectosUsuarioPage from "./features/finance/components/ProyectosUsuarioPage";

const COMPANY = {
  id: 1,
  name: "Plataforma Finanzas",
  host: "https://kapitals.org",
  logos: [
    { id: 1, patch: "/images/logo.png", type: "default" as const },
    { id: 2, patch: "/images/diseñador.png", type: "sticky" as const },
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
  console.log("REGISTRO", register);

  if (authLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route element={<PublicLayout />}>
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
          <InternalLayout user={user} onLogout={logout} company={COMPANY} />
        }
      >
        <Route path="/kapital" element={<KapitalPage />} />
        <Route path="/valora" element={<ValoraPage />} />
        <Route path="usuario/proyectos" element={<ProyectosUsuarioPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="master/plantillas" element={<PlantillasMaestrasPage />} />
        <Route path="kapital/reportes" element={<ReportesKapitalPage />} />
        <Route path="valora/reportes" element={<ReportesValoraPage />} />
        <Route path="configuraciones" element={<ConfiguracionPage />} />
      </Route>
    </Routes>
  );
}

export default App;
