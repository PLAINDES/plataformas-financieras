import { useEffect, useState, useRef } from "react";
import { MainService } from "@/shared/services/main.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastStack } from "@/shared/components/common/ToastStack";
import type { ToastType } from "@/shared/types/toast.types";

export const KapitalSettingsPage = () => {
  const [maxSensibilidad, setMaxSensibilidad] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados y Refs para los Toasts
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: ToastType; message: string }>
  >([]);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());

  // Limpiar temporizadores si el componente se desmonta
  useEffect(() => {
    return () => {
      toastTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      toastTimeoutsRef.current.clear();
    };
  }, []);

  // Lógica para añadir y quitar Toasts
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeoutId = toastTimeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }
  };

  const addToast = (type: ToastType, message: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-ocultar a los 3.5 segundos
    const timeoutId = window.setTimeout(() => removeToast(id), 3500);
    toastTimeoutsRef.current.set(id, timeoutId);
  };

  // Cargar configuración
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await MainService.getKapitalSettings();
        setMaxSensibilidad(res.max_sensibilizaciones ?? 3);
      } catch (err) {
        setError("No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await MainService.updateKapitalSetting(
        "max_sensibilizaciones",
        maxSensibilidad
      );

      // Usamos el Toast de éxito en lugar del alert()
      addToast("success", "Configuración actualizada correctamente.");
    } catch {
      // Usamos el Toast de error en lugar del alert()
      addToast("error", "Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  // Manejadores de incremento y decremento
  const handleDecrement = () => {
    setMaxSensibilidad((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncrement = () => {
    setMaxSensibilidad((prev) => (prev < 10 ? prev + 1 : prev));
  };

  if (error) {
    return <div className="p-4 text-sm text-red-500">{error}</div>;
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
            Configuración de Kapital
          </h1>
          <h3 className="text-sm font-medium text-gray-500">
            Ajustes generales del comportamiento de la plataforma.
          </h3>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-4 border-b border-slate-100">
            Límites de Usuario
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <Label
                htmlFor="maxSens"
                className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase"
              >
                Límite de Sensibilizaciones permitidas
              </Label>
              <p className="text-[10px] text-gray-500 mb-2">
                Define cuántos escenarios de sensibilización puede crear un
                usuario antes de bloquear el botón.
              </p>

              <div className="flex items-center w-fit border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm mt-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={maxSensibilidad <= 1 || loading}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors border-r border-slate-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-minus text-xs"></i>
                </button>

                <Input
                  id="maxSens"
                  type="number"
                  min={1}
                  max={10}
                  value={maxSensibilidad}
                  disabled={loading}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setMaxSensibilidad(val);
                  }}
                  className="h-9 w-16 border-0 rounded-none text-center focus-visible:ring-0 p-0 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={maxSensibilidad >= 10 || loading}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors border-l border-slate-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-blue-600 text-sm h-9 px-6 text-white hover:bg-blue-700 cursor-pointer"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Renderizamos el ToastStack al final de la página */}
      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </>
  );
};
