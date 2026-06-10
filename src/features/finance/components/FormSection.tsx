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
    isCollapsed,
    onToggleCollapse,
    tooltip,
}) => {
    const isVisible = !isCollapsed;
    return (
        <div className="rounded-lg w-full">
            <div className="flex items-center gap-2 border-b border-gray-50 bg-gray-50 p-2">
                <span className="inline-flex size-4.5 sm:h-5 sm:w-5 text-[11px] sm:text-xs shrink-0 items-center justify-center rounded-full bg-valora-primary text-center font-bold leading-none text-white pb-[0.75px]">
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
                            onClick={onToggleCollapse}
                            className={`w-5 h-5 text-gray-400 cursor-pointer ${isCollapsed ? "rotate-180" : "rotate-0"}`}
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
                className={`flex flex-col pl-2 gap-3 transition-all duration-300 ease-in-out overflow-visible relative
          ${isVisible ? "max-h-[2000px] opacity-100 pt-2" : "max-h-0 opacity-0 py-0 overflow-hidden"}`}
            >
                {children}
            </div>
        </div>
    );
};
