// src/components/auth/RegisterModal.tsx

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { RegisterData, User } from '../../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: RegisterData) => Promise<User>;
  onSwitchToLogin: () => void;
}

export function RegisterModal({
  isOpen,
  onClose,
  onRegister,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    lastname: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.name.trim() || !formData.lastname.trim()) {
      setError('El nombre y apellido son requeridos');
      return;
    }

    setLoading(true);

    try {
      await onRegister(formData);
      setFormData({ name: '', lastname: '', email: '', password: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', lastname: '', email: '', password: '' });
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
        aria-labelledby="registerModalLabel"
        aria-hidden={!isOpen}
      >
        <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
          <div className="modal-content" style={{ minHeight: '100vh' }}>
            
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
                    <div className="text-center mb-4 mb-lg-6">
                      <h1 className="text-dark fw-bolder mb-2 fs-3 fs-lg-1" id="registerModalLabel">
                        Crea tu cuenta
                      </h1>
                      <div className="text-gray-500 fw-semibold fs-7 fs-lg-6">
                        Registra tus credenciales para acceder
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
                      
                      {/* Name */}
                      <div className="fv-row mb-3">
                        <label htmlFor="register-name" className="visually-hidden">
                          Nombres
                        </label>
                        <input
                          id="register-name"
                          type="text"
                          placeholder="Nombres"
                          name="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          autoComplete="given-name"
                          required
                          className="form-control form-control-lg bg-transparent"
                          disabled={loading}
                          style={{ fontSize: '16px' }} // Previene zoom en iOS
                        />
                      </div>

                      {/* Lastname */}
                      <div className="fv-row mb-3">
                        <label htmlFor="register-lastname" className="visually-hidden">
                          Apellidos
                        </label>
                        <input
                          id="register-lastname"
                          type="text"
                          placeholder="Apellidos"
                          name="lastname"
                          value={formData.lastname}
                          onChange={(e) => handleChange('lastname', e.target.value)}
                          autoComplete="family-name"
                          required
                          className="form-control form-control-lg bg-transparent"
                          disabled={loading}
                          style={{ fontSize: '16px' }}
                        />
                      </div>

                      {/* Email */}
                      <div className="fv-row mb-3">
                        <label htmlFor="register-email" className="visually-hidden">
                          Email
                        </label>
                        <input
                          id="register-email"
                          type="email"
                          placeholder="Email"
                          name="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          autoComplete="email"
                          required
                          className="form-control form-control-lg bg-transparent"
                          disabled={loading}
                          style={{ fontSize: '16px' }}
                        />
                      </div>

                      {/* Password */}
                      <div className="fv-row mb-4">
                        <label htmlFor="register-password" className="visually-hidden">
                          Contraseña
                        </label>
                        <input
                          id="register-password"
                          type="password"
                          placeholder="Contraseña (mín. 6 caracteres)"
                          name="password"
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          autoComplete="new-password"
                          required
                          minLength={6}
                          className="form-control form-control-lg bg-transparent"
                          disabled={loading}
                          style={{ fontSize: '16px' }}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="d-grid mb-3 mb-lg-4">
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
                            'Registrarme'
                          )}
                        </button>
                      </div>

                      {/* Login Link */}
                      <div className="text-center">
                        <p className="text-gray-500 mb-0 fs-7 fs-lg-6">
                          ¿Ya tienes una cuenta?{' '}
                          <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="btn btn-link p-0 text-primary fs-7 fs-lg-6"
                            disabled={loading}
                            style={{ 
                              textDecoration: 'underline',
                              minHeight: '44px', // Área táctil
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            Inicia sesión
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