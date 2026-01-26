// src/components/auth/LoginModal.tsx

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { LoginCredentials, User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onSwitchToRegister: () => void;
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onSwitchToRegister 
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onLogin({ email, password });
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setPassword('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show"
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040,
        }}
      />

      {/* Modal - Fullscreen en móviles */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-labelledby="loginModalLabel"
        aria-hidden={!isOpen}
      >
        <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
          <div className="modal-content" style={{ minHeight: '100vh'}}>
            
            {/* Close button */}
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={handleClose}
              aria-label="Close"
              disabled={loading}
              style={{ zIndex: 1 }}
            />

            <div className="modal-body p-0 d-flex align-items-center">
              <div className="w-100">
                
                {/* Logo Section - Solo en móviles */}
                <div className="d-lg-none bg-light text-center py-4 px-3">
                  <img
                    src="/assets/media/images/logo-pro-finance.png"
                    alt="Logo Pro Finance"
                    className="mb-2"
                    style={{ height: '50px', maxWidth: '100%' }}
                  />
                  <h5 className="text-dark mb-1 fs-6">Análisis Financiero</h5>
                  <p className="text-muted small mb-0">
                    Toma las mejores decisiones
                  </p>
                </div>

                {/* Form Section */}
                <div className="w-100 px-4 py-5 px-lg-10 py-lg-8">
                  <div className="w-100" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    
                    {/* Heading */}
                    <div className="text-center mb-5 mb-lg-8">
                      <h1 className="text-dark fw-bolder mb-2 fs-3 fs-lg-1" id="loginModalLabel">
                        Iniciar Sesión
                      </h1>
                      <div className="text-gray-500 fw-semibold fs-7 fs-lg-6">
                        Ingresa tus credenciales para acceder
                      </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <div className="alert alert-danger d-flex align-items-center mb-4 py-2 px-3" role="alert">
                        <i className="fa-solid fa-circle-exclamation me-2 fs-6"></i>
                        <div className="fs-7 fs-lg-6">{error}</div>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-100" noValidate>
                      
                      {/* Email */}
                      <div className="fv-row mb-3 mb-lg-4">
                        <label htmlFor="login-email" className="visually-hidden">
                          Email
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          placeholder="Email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                          className="form-control form-control-lg bg-transparent"
                          disabled={loading}
                          style={{ fontSize: '16px' }} // Previene zoom en iOS
                        />
                      </div>

                      {/* Password */}
                      <div className="fv-row mb-4 mb-lg-5">
                        <label htmlFor="login-password" className="visually-hidden">
                          Contraseña
                        </label>
                        <input
                          id="login-password"
                          type="password"
                          placeholder="Contraseña"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          required
                          minLength={6}
                          className="form-control form-control-lg bg-transparent"
                          disabled={loading}
                          style={{ fontSize: '16px' }} // Previene zoom en iOS
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="d-grid mb-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={loading}
                          style={{ 
                            minHeight: '48px', // Tamaño táctil recomendado
                            fontSize: '16px'
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Cargando...</span>
                              </span>
                              Espere por favor...
                            </>
                          ) : (
                            'Ingresar'
                          )}
                        </button>
                      </div>

                      {/* Register Link */}
                      <div className="text-center">
                        <p className="text-gray-500 mb-0 fs-7 fs-lg-6">
                          ¿No tienes una cuenta?{' '}
                          <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="btn btn-link p-0 text-primary fs-7 fs-lg-6"
                            disabled={loading}
                            style={{ 
                              textDecoration: 'underline',
                              minHeight: '44px', // Área táctil
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            Regístrate gratis
                          </button>
                        </p>
                      </div>

                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}