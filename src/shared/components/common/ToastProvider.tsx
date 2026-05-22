import React, { createContext, useContext, useState, useCallback } from "react";
import {
  ToastStack,
  type ToastItem,
} from "@/shared/components/common/ToastStack";

interface ToastContextProps {
  addToast: (message: string, type?: ToastItem["type"]) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Agrega un nuevo toast al estado y programa su eliminación
  const addToast = useCallback(
    (message: string, type: ToastItem["type"] = "info") => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  // success: verde, info: azul, warn: amarillo, error: rojo

  // Permite el cierre manual desde la interfaz
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
};
