import { useState } from "react";
import type { FormEvent } from "react";
import { useEffect } from "react";
import { X, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LoginCredentials, User } from "../types/user.types";

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
  onSwitchToRegister,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
      setIsEntering(true);
      const timeout = window.setTimeout(() => setIsEntering(false), 300);
      return () => window.clearTimeout(timeout);
    }
    if (!shouldRender) return;
    setIsExiting(true);
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
      setIsExiting(false);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem("remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin({ email, password });
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }
      setEmail("");
      setPassword("");
      setShowPassword(false);
      onClose();
    } catch (err: any) {
      setError(
        err.message || "Error al iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setError(null);
      onClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-1050 flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-250 ease-out ${isExiting ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      <div className={`relative flex w-full h-auto sm:h-[36rem] sm:max-h-[calc(100vh-2rem)] sm:max-w-[64rem] bg-white rounded-2xl shadow-2xl overflow-hidden transition-[opacity,transform] duration-250 ease-out ${isExiting ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"} ${isEntering ? "animate-in fade-in zoom-in duration-300 ease-out" : ""}`}>
        <div className="hidden md:flex md:w-[34%] h-full relative overflow-hidden bg-slate-900">
          <img
            src="/images/login-design.jpg"
            alt="Ilustración de crecimiento financiero"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-950/20" />
        </div>
        <div className="relative flex-1 overflow-y-auto">
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

        <div className="flex flex-col h-full">
          <div className="flex h-full items-center px-6 py-12 sm:px-12 sm:py-14">
            <div className="w-full">
              <div className="text-center sm:text-left mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Ingresa tus credenciales para acceder
                </p>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 bg-red-50 border-red-100 text-red-600 animate-in slide-in-from-top-2 duration-200 ease-out"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm font-semibold">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1"
                  >
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
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-[border-color,box-shadow,background-color] text-[16px]"
                  />
                </div>

                <div>
                  <div className="mb-1.5 ml-1">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-semibold text-gray-400"
                    >
                      Contraseña
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-[border-color,box-shadow,background-color] text-[16px]"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword((visible) => !visible)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition-[color,background-color] duration-150 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <Button
                      type="button"
                      variant="link"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 h-auto p-0"
                    >
                      ¿Olvidaste tu clave?
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 ml-1">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium text-gray-500 cursor-pointer select-none"
                  >
                    Recordarme
                  </label>
                </div>
                </div>



                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto py-4 px-16 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 group h-auto"
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

                  <p className="text-gray-500 text-sm font-medium whitespace-nowrap">
                    ¿No tienes una cuenta?{" "}
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
    </div>
  );
}
