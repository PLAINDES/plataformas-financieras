import React from "react";

export interface TooltipProps {
    id: string;
    content: string;
    className?: string;
    contentClassName?: string;
}

export const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
    id,
    content,
    className,
    contentClassName,
    children,
}) => (
    <div className={`relative group ${className ?? ""}`}>
        {children}
        <div
            id={id}
            role="tooltip"
            className={`pointer-events-none absolute z-[1000] w-72 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-xl opacity-0 invisible transition-all duration-200 group-hover:visible group-hover:opacity-100 ${contentClassName ?? "right-0 top-full mt-2"}`}
        >
            <div className="relative z-[1001]">
                {content}
            </div>
            {/* Arrow */}
            <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-t border-l border-gray-200 rotate-45"></div>
        </div>
    </div>
);
