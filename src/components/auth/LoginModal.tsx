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
    <div className="fixed inset-0 z-[1050] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Content - Fullscreen en móviles, Centrado en desktop */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-[450px] bg-white sm:rounded-2xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-300">
        
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
          <div className="sm:hidden bg-gray-50 text-center py-10 px-6 border-b border-gray-100">
            <img
              src="/assets/media/images/logo-pro-finance.png"
              alt="Logo Pro Finance"
              className="h-12 mx-auto mb-3 object-contain"
            />
            <h5 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Análisis Financiero</h5>
            <p className="text-gray-500 text-xs font-medium">Toma las mejores decisiones</p>
          </div>

          {/* Form Section */}
          <div className="flex-1 px-8 py-12 sm:p-12">
            <div className="max-w-[340px] mx-auto w-full">
              
              {/* Heading */}
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Ingresa tus credenciales para acceder
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-in slide-in-from-top-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold leading-tight">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all text-[16px]"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label htmlFor="login-password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Contraseña
                    </label>
                    <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all text-[16px]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 mt-4 group"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <span>Ingresar al sistema</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Switch to Register */}
                <div className="text-center pt-6">
                  <p className="text-gray-500 text-sm font-medium">
                    ¿No tienes una cuenta?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-4 transition-all"
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
  );
}