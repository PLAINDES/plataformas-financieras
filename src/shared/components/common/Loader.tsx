// src/components/ReportLoader.tsx
import React from "react";

export type ReportLoaderState =
  | "idle"
  | "refreshing"
  | "generating"
  | "payment"
  | "success"
  | "error";

interface ReportLoaderProps {
  state: ReportLoaderState;
  isPaid: boolean;
}

export const ReportLoader: React.FC<ReportLoaderProps> = ({
  state,
  isPaid,
}) => {
  if (state === "idle" || state === "success" || state === "error") return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 backdrop-blur-md transition-all duration-300">
      <div className="w-80 p-6 bg-white rounded-xl shadow-xl border border-gray-100">
        {/* Paso 1: Rehidratación / Refresh */}
        <div
          className={`flex items-center gap-4 mb-4 transition-opacity duration-500 ${state === "refreshing" ? "opacity-100" : "opacity-40"}`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
            {state === "refreshing" ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <i className="fa-solid fa-check text-green-500"></i>
            )}
          </div>
          <span
            className={`text-sm font-medium ${state === "refreshing" ? "text-blue-700" : "text-gray-500"}`}
          >
            Recuperando información del cálculo...
          </span>
        </div>

        {/* Paso Intermedio: Pago (Solo si se activó) */}
        {state === "payment" && (
          <div className="flex items-center gap-4 mb-4 transition-opacity duration-500 opacity-100">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-50 text-yellow-600">
              <i className="fa-solid fa-credit-card fa-beat-fade"></i>
            </div>
            <span className="text-sm font-medium text-yellow-700">
              Procesando pago seguro...
            </span>
          </div>
        )}

        {/* Paso 2: Generación del PDF */}
        <div
          className={`flex items-center gap-4 transition-opacity duration-500 ${state === "generating" || state === "payment" ? "opacity-100" : "opacity-40"}`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
            {state === "generating" ? (
              <i className="fa-solid fa-file-pdf fa-bounce"></i>
            ) : state === "payment" ? (
              <i className="fa-solid fa-hourglass-empty"></i>
            ) : (
              <i className="fa-regular fa-circle"></i>
            )}
          </div>
          <span
            className={`text-sm font-medium ${state === "generating" ? "text-purple-700" : "text-gray-400"}`}
          >
            {isPaid
              ? "Generando documento completo..."
              : "Generando vista previa..."}
          </span>
        </div>
      </div>
    </div>
  );
};
