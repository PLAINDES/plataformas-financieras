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
import PortadasPage from "./features/admin/pages/PortadasPage";
import PortadaCreatePage from "./features/admin/pages/PortadaCreatePage";
import PortadaEditPage from "./features/admin/pages/PortadaEditPage";
import { ConfiguracionPage } from "./features/admin/pages/ConfiguracionPage";
import ProyectosUsuarioPage from "./features/finance/components/ProyectosUsuarioPage";
import { ReporteKapitalEditor } from "./features/admin/components/ReporteKapitalEditor";
import { KapitalSettingsPage } from "./features/admin/pages/KapitalSettingsPage";
import { UsersPage } from "./features/admin/pages/UsersPage";
import AnalyticsPage from "./features/admin/pages/AnalyticsPage";
import { ToastProvider } from "./shared/components/common/ToastProvider";

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
    <ToastProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <LandingPage
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
        <Route element={<InternalLayout />}>
          <Route path="/kapital" element={<KapitalPage />} />
          <Route path="/kapital/:code" element={<KapitalPage />} />
          <Route path="/valora" element={<ValoraPage />} />
          <Route path="/valora/:code" element={<ValoraPage />} />
          <Route
            path="usuario/proyectos"
            element={<ProyectosUsuarioPage onOpenForm={() => { }} />}
          />
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
          <Route
            path="master/plantillas"
            element={<PlantillasMaestrasPage />}
          />
          <Route path="reportes" element={<ReportesKapitalPage />} />
          <Route path="reportes/nuevo" element={<ReporteKapitalEditor />} />
          <Route path="kapital" element={<KapitalSettingsPage />} />
          <Route path="portadas" element={<PortadasPage />} />
          <Route path="portadas/nuevo" element={<PortadaCreatePage />} />
          <Route path="portadas/:id/editar" element={<PortadaEditPage />} />
          <Route
            path="reportes/:id/editar"
            element={<ReporteKapitalEditor />}
          />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="metricas" element={<AnalyticsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="configuraciones" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
