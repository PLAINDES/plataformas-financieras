import React from "react";

interface DevPlaceholderProps {
  title?: string;
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
  minHeight?: number | string;
  className?: string;
}

export default function DevPlaceholder({
  title = "En desarrollo",
  message = "Esta sección está en desarrollo. Volverá a estar disponible pronto.",
  ctaLabel = "Próximamente",
  onCta,
  minHeight = 260,
  className = "",
}: DevPlaceholderProps) {
  return (
    <div
      className={`w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm ${className}`}
      style={{ minHeight }}
    >
      <div
        className="flex flex-col items-center justify-center p-6 bg-gray-50 md:flex-row md:gap-6"
        style={{ minHeight }}
      >
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M12 9v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4 text-center md:text-left md:mt-0">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
              En progreso
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">{message}</p>

          <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={onCta}
              disabled={!onCta}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${onCta ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
            >
              {ctaLabel}
            </button>
            <span className="text-xs text-gray-400">
              &middot; Disponible pronto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
