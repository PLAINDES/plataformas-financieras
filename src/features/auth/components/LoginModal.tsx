import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LoginCredentials, User } from '../types/user.types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onLogin, onSwitchToRegister }: LoginModalProps) {
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
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />

      <div className="relative w-full h-full sm:h-auto sm:max-w-[450px] bg-white sm:rounded-2xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-300">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          onClick={handleClose}
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex flex-col min-h-full">
          <div className="sm:hidden bg-gray-50 text-center py-10 px-6 border-b border-gray-100">
            <img
              src="images/logo.png"
              alt="Logo Pro Finance"
              className="h-12 mx-auto mb-3 object-contain"
            />
      
          </div>

          <div className="flex-1 px-8 py-12 sm:p-12">
            <div className="max-w-[340px] mx-auto w-full">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Iniciar Sesión</h1>
                <p className="text-gray-500 text-sm font-medium">Ingresa tus credenciales para acceder</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-50 border-red-100 text-red-600 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label htmlFor="login-password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Contraseña
                    </label>
                    <Button
                      type="button"
                      variant="link"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 h-auto p-0"
                    >
                      ¿Olvidaste tu clave?
                    </Button>
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 mt-4 group h-auto"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                  ) : (
                    <>
                      <span>Ingresar al sistema</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-6">
                  <p className="text-gray-500 text-sm font-medium">
                    ¿No tienes una cuenta?{' '}
                    <Button
                      type="button"
                      variant="link"
                      onClick={onSwitchToRegister}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-4 h-auto p-0"
                    >
                      Regístrate gratis
                    </Button>
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