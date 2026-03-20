// src/components/auth/ProtectedRoute.tsx

import type { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="mt-4 text-gray-500 font-medium animate-pulse">
          Verificando credenciales...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 shadow-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>

          <p className="text-gray-600 mb-8">
            Lo sentimos, no tienes permisos para acceder a esta sección. Esta
            área está restringida exclusivamente para administradores.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-lg"
            >
              Volver al inicio
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full py-3 px-4 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Reintentar acceso
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
