import { Info } from "lucide-react";

type FormSectionProps = {
  step: number;
  title: string;
  children: React.ReactNode;
  toggle?: boolean;
  onToggle?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  tooltip?: string;
};

export const FormSection: React.FC<FormSectionProps> = ({
  step,
  title,
  children,
  toggle,
  onToggle,
  isCollapsed,
  onToggleCollapse,
  tooltip,
}) => {
  const isVisible = toggle !== undefined ? toggle : !isCollapsed;
  return (
    <div className="rounded-lg w-full">
      <div className="flex items-center gap-2 border-b border-gray-50 bg-gray-50 px-3.5 py-2">
        <span className="inline-flex h-5 w-5 text-xs shrink-0 items-center justify-center rounded-full bg-valora-primary text-center font-bold leading-none text-white">
          {step}
        </span>

        <h3
          className="text-[10px] sm:text-xs font-bold uppercase text-gray-800 flex-1 truncate"
          onClick={() => onToggleCollapse && onToggleCollapse()}
        >
          {title}
        </h3>

        {/* Agrupamos los controles a la derecha */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleCollapse && (
            <svg
              onClick={() => onToggleCollapse}
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isCollapsed ? "rotate-180" : "rotate-0"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}

          {toggle !== undefined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onToggle) onToggle();
              }}
              className="cursor-pointer focus:outline-none transition-transform active:scale-90"
              type="button"
            >
              {toggle ? (
                <svg
                  className="w-7 h-7 text-valora-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 7H8C5.243 7 3 9.243 3 12s2.243 5 8 5h8c2.757 0 5-2.243 5-5s-2.243-5-5-5zM16 14a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7 text-gray-300 hover:text-valora-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 7h8c2.757 0 5 2.243 5 5s-2.243 5-5 5H8c-2.757 0-5-2.243-5-5s2.243-5 5-5zm0 7a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              )}
            </button>
          )}

          {tooltip && (
            <div className="relative flex items-center justify-center">
              <Info
                className="w-4 h-4 text-gray-400 cursor-help"
                onMouseEnter={(e) => {
                  const tip = e.currentTarget.nextElementSibling as HTMLElement;
                  tip.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  const tip = e.currentTarget.nextElementSibling as HTMLElement;
                  tip.style.opacity = "0";
                }}
              />
              <div className="absolute bottom-full mb-2 right-0 w-48 py-2.5 px-3 bg-gray-100 text-black text-[11px] rounded-md shadow-lg opacity-0 transition-opacity duration-200 z-50 pointer-events-none">
                <p className="text-blue-800 leading-relaxed">
                  <strong>Sugerencia: </strong>
                  {tooltip}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex flex-col gap-3 transition-all duration-300 ease-in-out pl-3.5 overflow-visible
          ${isVisible ? "max-h-250 opacity-100 pt-2" : "max-h-0 opacity-0 py-0"}`}
      >
        {children}
      </div>
    </div>
  );
};
