import type { ToastType } from "../../types/toast.types";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { className: string; icon: string }> = {
  success: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: "fa-circle-check",
  },
  info: {
    className: "border-sky-200 bg-sky-50 text-sky-700",
    icon: "fa-circle-info",
  },
  warn: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: "fa-triangle-exclamation",
  },
  error: {
    className: "border-red-200 bg-red-50 text-red-700",
    icon: "fa-circle-xmark",
  },
};

export const ToastStack: React.FC<ToastStackProps> = ({
  toasts,
  onDismiss,
}) => (
  <div className="fixed right-6 top-6 z-60 flex w-full max-w-xs flex-col gap-2">
    {toasts.map((toast) => {
      const { className, icon } = toastStyles[toast.type];

      return (
        <div
          key={toast.id}
          className={`flex items-start gap-2 rounded border px-3 py-2 text-sm font-semibold shadow-md ${className}`}
        >
          <i className={`fa-solid ${icon} mt-0.5`}></i>
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            className="ml-auto rounded px-1 text-sm opacity-70 transition-opacity hover:opacity-100"
            aria-label="Cerrar notificacion"
            onClick={() => onDismiss(toast.id)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      );
    })}
  </div>
);
