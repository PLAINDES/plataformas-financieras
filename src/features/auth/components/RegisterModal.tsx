import { useState } from "react";
import type { FormEvent } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { RegisterData, User } from "../types/user.types";

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
    name: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!formData.name.trim() || !formData.lastname.trim()) {
      setError("El nombre y apellido son requeridos");
      return;
    }

    setLoading(true);
    try {
      await onRegister(formData);
      setFormData({ name: "", lastname: "", email: "", password: "" });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", lastname: "", email: "", password: "" });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1050 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full h-full sm:h-auto sm:max-w-120 bg-white sm:rounded-2xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-300">
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
          <div className="sm:hidden bg-gray-50 text-center py-8 px-6 border-b border-gray-100">
            <img
              src="images/logo.png"
              alt="Logo Pro Finance"
              className="h-12 mx-auto mb-3 object-contain"
            />
          </div>

          <div className="flex-1 px-6 py-10 sm:p-12">
            <div className="max-w-90 mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  Crea tu cuenta
                </h1>
                <p className="text-gray-500 text-sm sm:text-base font-medium">
                  Registra tus credenciales para acceder
                </p>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 bg-red-50 border-red-100 text-red-600 animate-shake"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={formData.lastname}
                    onChange={(e) => handleChange("lastname", e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                  />
                </div>

                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                />

                <input
                  type="password"
                  placeholder="Contraseña (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-[16px]"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 mt-2 h-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    "Crear mi cuenta"
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-gray-500 text-sm font-medium">
                    ¿Ya tienes una cuenta?{" "}
                    <Button
                      type="button"
                      variant="link"
                      onClick={onSwitchToLogin}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-4 h-auto p-0"
                    >
                      Inicia sesión
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
