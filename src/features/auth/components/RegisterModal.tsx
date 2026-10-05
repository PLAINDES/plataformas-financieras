import { useState } from "react";
import type { FormEvent } from "react";
import { useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { RegisterData, User } from "../types/user.types";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: RegisterData) => Promise<User>;
  onSwitchToLogin: () => void;
}

const REGISTER_IMAGE_SRC = "/images/register-design.jpg";

// Caché a nivel de módulo: una vez descargada, las siguientes
// aperturas la muestran al instante sin destello.
let registerImageCached = false;
let registerImagePromise: Promise<void> | null = null;

export function preloadRegisterImage(): Promise<void> {
  if (typeof globalThis === "undefined" || typeof Image === "undefined")
    return Promise.resolve();
  if (registerImageCached) return Promise.resolve();
  if (registerImagePromise) return registerImagePromise;
  registerImagePromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      registerImageCached = true;
      resolve();
    };
    img.onerror = () => resolve();
    img.src = REGISTER_IMAGE_SRC;
  });
  return registerImagePromise;
}

// Arranca la descarga en cuanto el bundle JS se evalúa, mucho antes
// de que el usuario abra el modal.
try {
  const w = globalThis as any;
  if (w && typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(() => preloadRegisterImage());
  } else if (w && typeof w.setTimeout === "function") {
    w.setTimeout(() => preloadRegisterImage(), 1000);
  }
} catch {
  /* entorno sin window: no precargar */
}

const initialForm: RegisterData = {
  name: "",
  lastname: "",
  phone_number: "",
  email: "",
  birth_date: "",
  document_type: "dni",
  document_number: "",
  ruc: "",
  password: "",
  password_confirmation: "",
};

const inputClassName =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-[border-color,box-shadow,background-color] text-[16px]";

const PANEL_SLIDE_DURATION = 550;
const FORM_ENTER_DURATION = 120;

export function RegisterModal({
  isOpen,
  onClose,
  onRegister,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [formData, setFormData] = useState<RegisterData>(initialForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [imagePanelStep, setImagePanelStep] = useState<1 | 2>(1);
  const [stepTransition, setStepTransition] = useState<
    "idle" | "exit-next" | "enter-next" | "exit-back" | "enter-back"
  >("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [imageReady, setImageReady] = useState(registerImageCached);
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
    let cancelled = false;
    preloadRegisterImage().then(() => {
      if (!cancelled) setImageReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setImagePanelStep(1);
      setStepTransition("idle");
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = (): string | null => {
    if (!formData.name.trim() || !formData.lastname.trim()) {
      return "El nombre y apellido son requeridos";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Ingresa un correo electrónico válido";
    }
    if (formData.phone_number.trim().length < 7) {
      return "El teléfono debe tener al menos 7 caracteres";
    }
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!formData.birth_date) {
      return "La fecha de nacimiento es requerida";
    }
    const doc = formData.document_number.trim();
    if (formData.document_type === "dni" && !/^\d{8}$/.test(doc)) {
      return "El DNI debe contener exactamente 8 dígitos";
    }
    if (formData.document_type === "ruc" && !/^\d{11}$/.test(doc)) {
      return "El RUC debe contener exactamente 11 dígitos";
    }
    if (
      formData.document_type === "ce" &&
      !(doc.length >= 8 && doc.length <= 20)
    ) {
      return "El CE debe contener entre 8 y 20 caracteres";
    }
    if (formData.password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (
      !/[A-Z]/.test(formData.password) ||
      !/[^a-zA-Z0-9]/.test(formData.password)
    ) {
      return "La contraseña debe incluir una mayúscula y un símbolo";
    }
    if (formData.password !== formData.password_confirmation) {
      return "Las contraseñas no coinciden";
    }
    return null;
  };

  const goToStep = (next: 1 | 2, direction: "next" | "back") => {
    setError(null);
    setStepTransition(direction === "next" ? "exit-next" : "exit-back");
    setImagePanelStep(next);
    window.setTimeout(() => {
      setStep(next);
      setStepTransition(direction === "next" ? "enter-next" : "enter-back");
      window.setTimeout(() => setStepTransition("idle"), FORM_ENTER_DURATION);
    }, PANEL_SLIDE_DURATION);
  };

  const handleNext = () => {
    const stepError = validateStep1();
    if (stepError) {
      setError(stepError);
      return;
    }
    goToStep(2, "next");
  };

  const handleBack = () => {
    setError(null);
    setStepTransition("idle");
    setStep(1);
    setImagePanelStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const stepError = validateStep2();
    if (stepError) {
      setError(stepError);
      return;
    }

    setLoading(true);
    try {
      await onRegister({
        ...formData,
        name: formData.name.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        document_number: formData.document_number.trim(),
        ruc: formData.ruc.trim() || "",
      });
      setFormData(initialForm);
      setStep(1);
      setImagePanelStep(1);
      setStepTransition("idle");
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && stepTransition === "idle") {
      setFormData(initialForm);
      setStep(1);
      setImagePanelStep(1);
      setStepTransition("idle");
      setError(null);
      onClose();
    }
  };

  if (!shouldRender) return null;

  const stepAnimationClass =
    stepTransition === "exit-next"
      ? "animate-out fade-out slide-out-to-right-8 duration-[550ms] ease-in-out"
      : stepTransition === "enter-next"
        ? "animate-in fade-in slide-in-from-left-8 duration-150 ease-out"
        : stepTransition === "exit-back"
          ? "animate-out fade-out slide-out-to-right-8 duration-150 ease-out"
          : stepTransition === "enter-back"
            ? "animate-in fade-in slide-in-from-left-8 duration-150 ease-out"
            : "";

  return (
    <div className="fixed inset-0 z-1050 flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-250 ease-out ${isExiting ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      <div
        className={`relative flex w-full h-[calc(100dvh-4rem)] max-h-[calc(100dvh-2rem)] sm:h-[36rem] sm:max-h-[calc(100vh-2rem)] sm:max-w-[64rem] bg-white rounded-[1.75rem] shadow-2xl overflow-hidden transition-[opacity,transform] duration-250 ease-out ${isExiting ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"} ${isEntering ? "animate-in fade-in zoom-in duration-300 ease-out" : ""}`}
      >
        <div className="relative z-10 flex w-full min-w-0 flex-1 basis-full overflow-y-auto">
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

          <div className="flex min-h-full w-full flex-col">
            <div className="relative flex w-full min-w-0 flex-1">
              <div
                className={`absolute inset-y-0 flex w-1/2 min-w-0 flex-col items-stretch justify-center overflow-y-auto px-5 py-6 sm:px-12 sm:py-8 ${step === 2 ? "left-1/2" : "left-0"}`}
              >
                <div className="m-auto w-full min-w-0">
                  <div className="mb-5 text-center">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                      {step === 1 ? "Crea tu cuenta" : "Un paso más..."}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">
                      {step === 1
                        ? "Registra tus credenciales para acceder"
                        : "Completa tus datos personales"}
                    </p>
                  </div>

                  {error && (
                    <Alert
                      variant="destructive"
                      className="mb-4 bg-red-50 border-red-100 text-red-600 animate-in slide-in-from-top-2 duration-200 ease-out"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm font-semibold">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {step === 1 ? (
                    <div key="register-step-1" className={stepAnimationClass}>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="register-name"
                              className="block text-sm font-semibold text-gray-700 mb-1"
                            >
                              Nombre
                            </label>
                            <input
                              id="register-name"
                              type="text"
                              placeholder="Nombre"
                              value={formData.name}
                              onChange={(e) =>
                                handleChange("name", e.target.value)
                              }
                              disabled={loading}
                              autoComplete="given-name"
                              className={inputClassName}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="register-lastname"
                              className="block text-sm font-semibold text-gray-700 mb-1"
                            >
                              Apellido
                            </label>
                            <input
                              id="register-lastname"
                              type="text"
                              placeholder="Apellido"
                              value={formData.lastname}
                              onChange={(e) =>
                                handleChange("lastname", e.target.value)
                              }
                              disabled={loading}
                              autoComplete="family-name"
                              className={inputClassName}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="register-email"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                          >
                            Correo electrónico
                          </label>
                          <input
                            id="register-email"
                            type="email"
                            placeholder="nombre@ejemplo.com"
                            value={formData.email}
                            onChange={(e) =>
                              handleChange("email", e.target.value)
                            }
                            disabled={loading}
                            autoComplete="email"
                            className={inputClassName}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="register-phone"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                          >
                            Teléfono
                          </label>
                          <input
                            id="register-phone"
                            type="tel"
                            placeholder="999 999 999"
                            value={formData.phone_number}
                            onChange={(e) =>
                              handleChange("phone_number", e.target.value)
                            }
                            disabled={loading}
                            autoComplete="tel"
                            className={inputClassName}
                          />
                        </div>

                        <div className="pt-1">
                          <Button
                            type="button"
                            onClick={handleNext}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 h-auto group"
                          >
                            <span>Siguiente</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>

                        <div className="text-center pt-1">
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
                      </div>
                    </div>
                  ) : (
                    <form
                      key="register-step-2"
                      onSubmit={handleSubmit}
                      className={stepAnimationClass}
                      noValidate
                    >
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor="register-birthdate"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                          >
                            Fecha de nacimiento
                          </label>
                          <input
                            id="register-birthdate"
                            type="date"
                            value={formData.birth_date}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              handleChange("birth_date", e.target.value)
                            }
                            disabled={loading}
                            className={inputClassName}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="register-doctype"
                              className="block text-sm font-semibold text-gray-700 mb-1"
                            >
                              Tipo documento
                            </label>
                            <select
                              id="register-doctype"
                              value={formData.document_type}
                              onChange={(e) => {
                                handleChange("document_type", e.target.value);
                                handleChange("document_number", "");
                              }}
                              disabled={loading}
                              className={`${inputClassName} cursor-pointer`}
                            >
                              <option value="dni">DNI</option>
                              <option value="ruc">RUC</option>
                              <option value="ce">CE</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="register-docnumber"
                              className="block text-sm font-semibold text-gray-700 mb-1"
                            >
                              N° documento
                            </label>
                            <input
                              id="register-docnumber"
                              type="text"
                              inputMode="numeric"
                              placeholder={
                                formData.document_type === "dni"
                                  ? "8 dígitos"
                                  : formData.document_type === "ruc"
                                    ? "11 dígitos"
                                    : "8 a 20 caracteres"
                              }
                              value={formData.document_number}
                              onChange={(e) =>
                                handleChange("document_number", e.target.value)
                              }
                              disabled={loading}
                              className={inputClassName}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label
                              htmlFor="register-password"
                              className="block text-sm font-semibold text-gray-700 mb-1"
                            >
                              Nueva Contraseña
                            </label>
                            <div className="relative">
                              <input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Mayúscula, símbolo y mín. 8 caracteres"
                                value={formData.password}
                                onChange={(e) =>
                                  handleChange("password", e.target.value)
                                }
                                disabled={loading}
                                autoComplete="new-password"
                                className={`${inputClassName} pr-12`}
                              />
                              <button
                                type="button"
                                aria-label={
                                  showPassword
                                    ? "Ocultar contraseña"
                                    : "Mostrar contraseña"
                                }
                                onClick={() => setShowPassword((v) => !v)}
                                disabled={loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="register-password-confirm"
                              className="block text-sm font-semibold text-gray-700 mb-1"
                            >
                              Confirmar contraseña
                            </label>
                            <div className="relative">
                              <input
                                id="register-password-confirm"
                                type={showPasswordConfirm ? "text" : "password"}
                                placeholder="Repite tu contraseña"
                                value={formData.password_confirmation}
                                onChange={(e) =>
                                  handleChange(
                                    "password_confirmation",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                autoComplete="new-password"
                                className={`${inputClassName} pr-12`}
                              />
                              <button
                                type="button"
                                aria-label={
                                  showPasswordConfirm
                                    ? "Ocultar contraseña"
                                    : "Mostrar contraseña"
                                }
                                onClick={() =>
                                  setShowPasswordConfirm((v) => !v)
                                }
                                disabled={loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                              >
                                {showPasswordConfirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-4 gap-y-1 pt-1 text-xs sm:grid-cols-2">
                          {[
                            {
                              label: "Mínimo 8 caracteres",
                              valid: formData.password.length >= 8,
                            },
                            {
                              label: "Una letra mayúscula",
                              valid: /[A-Z]/.test(formData.password),
                            },
                            {
                              label: "Un símbolo",
                              valid: /[^a-zA-Z0-9]/.test(formData.password),
                            },
                            {
                              label: "Las contraseñas coinciden",
                              valid:
                                formData.password_confirmation.length > 0 &&
                                formData.password ===
                                  formData.password_confirmation,
                            },
                          ].map((rule) => (
                            <div
                              key={rule.label}
                              className={`flex items-center gap-1.5 transition-colors ${rule.valid ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full border ${rule.valid ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300"}`}
                              >
                                {rule.valid && (
                                  <Check className="h-2.5 w-2.5" />
                                )}
                              </span>
                              <span>{rule.label}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={loading}
                            className="py-3 px-5 rounded-xl font-bold h-auto"
                          >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Atrás</span>
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 h-auto"
                          >
                            {loading ? (
                              <Loader2 className="animate-spin h-5 w-5 text-white" />
                            ) : (
                              "Crear mi cuenta"
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel visual superpuesto: cambia de lado al avanzar al segundo paso */}
        <div
          className={`absolute inset-y-0 right-0 z-30 flex h-full w-1/2 overflow-hidden bg-sky-500 transition-all duration-[550ms] ease-in-out ${imagePanelStep === 2 ? "-translate-x-[100%] rounded-tr-[5rem] rounded-br-[5rem] sm:rounded-tr-[10rem] sm:rounded-br-[10rem]" : "translate-x-0 rounded-tl-[5rem] rounded-bl-[5rem] sm:rounded-tl-[10rem] sm:rounded-bl-[10rem]"}`}
        >
          <div
            aria-hidden
            className={`absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-500 to-blue-700 transition-opacity duration-500 ${imageReady ? "opacity-0" : "opacity-100"}`}
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <img
            src={REGISTER_IMAGE_SRC}
            alt="Ilustración de crecimiento financiero"
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            onLoad={() => {
              registerImageCached = true;
              setImageReady(true);
            }}
            className={`absolute inset-0 h-full w-full scale-105 object-cover object-center transition-[opacity,filter,transform] duration-500 ease-out ${imageReady ? "opacity-100 blur-0" : "opacity-0 scale-[1.02] blur-sm"}`}
          />
        </div>
      </div>
    </div>
  );
}
