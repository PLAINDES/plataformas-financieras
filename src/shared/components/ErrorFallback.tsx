interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorFallback({
  message = "No se pudieron cargar los datos.",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50">
          <svg
            className="h-6 w-6 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Error al cargar contenido
        </h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-center space-x-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none"
          >
            Reintentar
          </button>

          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Contactar soporte
            </button>
          ) : (
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Contacto
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
