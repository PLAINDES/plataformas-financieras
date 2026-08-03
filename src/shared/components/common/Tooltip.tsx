import React, { useState } from "react";

export interface TooltipProps {
    id?: string;
    content: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative inline-flex items-center">
            <div
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className="cursor-help"
            >
                {children}
            </div>
            {visible && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-xl z-[9999]">
                    <div className="leading-relaxed">{content}</div>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white border-b border-r border-gray-200 rotate-45"></div>
                </div>
            )}
        </div>
    );
};
