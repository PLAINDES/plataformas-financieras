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
    <div className="fixed inset-0 z-[1050] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-[480px] bg-white sm:rounded-2xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        {/* Close button */}
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10 disabled:opacity-30"
          onClick={handleClose}
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col min-h-full">
          {/* Logo Section - Solo en móviles (sm:hidden) */}
          <div className="sm:hidden bg-gray-50 text-center py-8 px-6 border-b border-gray-100">
            <img
              src="/assets/media/images/logo-pro-finance.png"
              alt="Logo Pro Finance"
              className="h-12 mx-auto mb-3 object-contain"
            />
            <h5 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Análisis Financiero</h5>
            <p className="text-gray-500 text-xs">Toma las mejores decisiones</p>
          </div>

          {/* Form Section */}
          <div className="flex-1 px-6 py-10 sm:p-12">
            <div className="max-w-[360px] mx-auto w-full">
              
              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  Crea tu cuenta
                </h1>
                <p className="text-gray-500 text-sm sm:text-base font-medium">
                  Registra tus credenciales para acceder
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium leading-tight">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                    />
                  </div>
                  {/* Lastname */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={formData.lastname}
                      onChange={(e) => handleChange('lastname', e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Contraseña (mín. 6 caracteres)"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    'Crear mi cuenta'
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-500 text-sm font-medium">
                    ¿Ya tienes una cuenta?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-4 transition-all"
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
  );
}