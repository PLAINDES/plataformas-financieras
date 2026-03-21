export const FormSection: React.FC<{
  title: string;
  number: number;
  subtitle?: string;
  children: React.ReactNode;
  toggle?: boolean;
  onToggle?: () => void;
}> = ({ title, number, subtitle, children, toggle, onToggle }) => (
  <div className="mb-4 bg-white rounded-xl border border-gray-100 shadow-sm ">
    {/* Header Section */}
    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {/* Badge circular */}
        <span className="shrink-0 flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm">
          {number}
        </span>

        {/* Título y Subtítulo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide truncate">
              {title}
            </h3>

            {/* Toggle Switch */}
            {toggle !== undefined && (
              <button
                onClick={onToggle}
                className="focus:outline-none transition-transform active:scale-90"
                type="button"
                aria-label="Alternar sección"
              >
                {toggle ? (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 7H8C5.243 7 3 9.243 3 12s2.243 5 8 5h8c2.757 0 5-2.243 5-5s-2.243-5-5-5zM16 14a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 7h8c2.757 0 5 2.243 5 5s-2.243 5-5 5H8c-2.757 0-5-2.243-5-5s2.243-5 5-5zm0 7a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                )}
              </button>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Body Section con animación de colapso */}
    <div
      className={`
        px-4 transition-all duration-300 ease-in-out
        ${
          toggle !== undefined
            ? toggle
              ? "max-h-500 opacity-100 py-4"
              : "max-h-0 opacity-0 py-0 overflow-hidden"
            : "py-4"
        }
      `}
    >
      {children}
    </div>
  </div>
);
