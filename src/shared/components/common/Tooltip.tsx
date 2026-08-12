import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface TooltipProps {
    id?: string;
    content: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const anchorRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        return () => setVisible(false);
    }, []);

    const handleEnter = () => {
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const gap = 8;
            const width = Math.min(320, window.innerWidth - 32);
            const left = Math.min(rect.right + gap, window.innerWidth - width - 16);
            const top = Math.max(16, Math.min(rect.top + rect.height / 2, window.innerHeight - 16));
            setPos({ top, left: Math.max(16, left) });
        }
        setVisible(true);
    };

    return (
        <>
            <span
                ref={anchorRef}
                onMouseEnter={handleEnter}
                onMouseLeave={() => setVisible(false)}
                className="cursor-help"
            >
                {children}
            </span>
            {visible &&
                createPortal(
                    <div
                        onMouseEnter={handleEnter}
                        onMouseLeave={() => setVisible(false)}
                        style={{
                            position: "fixed",
                            top: pos.top,
                            left: pos.left,
                            transform: "translateY(-50%)",
                            zIndex: 99999,
                        }}
                        className="w-[320px] max-w-[calc(100vw-32px)] rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-xl"
                    >
                        <div className="leading-relaxed">{content}</div>
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                    </div>,
                    document.body
                )}
        </>
    );
};
