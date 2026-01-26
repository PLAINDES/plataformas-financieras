// src/components/auth/ProtectedRoute.tsx

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * @param requireAdmin - Si true, solo admins pueden acceder
 * @param redirectTo - Ruta a la que redirigir si no está autenticado
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ minHeight: '100vh' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // No autenticado - redirigir
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Requiere admin pero el usuario no lo es
  if (requireAdmin && user.role !== 'admin' && user.perfil !== 1) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            Acceso Denegado
          </h4>
          <p>
            No tienes permisos para acceder a esta sección.
            Solo los administradores pueden ver este contenido.
          </p>
          <hr />
          <p className="mb-0">
            <a href="/" className="btn btn-primary">
              Volver al inicio
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Usuario autenticado con permisos correctos
  return <>{children}</>;
}