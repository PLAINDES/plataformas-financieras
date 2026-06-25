import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { FormData } from "@/shared/types/ValoraTypes";
import {
    handleNumberValidation,
    handleNumberKeyDown,
} from "@/shared/utils/inputValidators";

export interface FormFieldProps {
    label: string;
    name: keyof FormData;
    type: "select" | "text" | "number";
    value: string;
    options?: string[];
    required?: boolean;
    placeholder?: string;
    tooltip?: string;
    suffix?: React.ReactNode;
    readOnly?: boolean;
    disabled?: boolean;
    translations?: Record<string, string>;
    min?: number;
    max?: number;
    step?: string;
    layout?: "vertical" | "horizontal";
    showClearButton?: boolean;
    inputClassName?: string;
    integerOnly?: boolean;
    maxDecimals?: number;
    prefixSelect?: {
        name: string;
        value: string;
        options: string[];
    };
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type,
    value,
    options = [],
    required = false,
    placeholder = "",
    tooltip = "",
    suffix = "",
    readOnly = false,
    disabled = false,
    translations,
    min,
    max,
    step,
    layout = "vertical",
    showClearButton = true,
    inputClassName = "",
    integerOnly = false,
    maxDecimals,
    prefixSelect,
    onChange,
}) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const tooltipButtonRef = useRef<HTMLSpanElement | null>(null);
    const tooltipHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return options;
        }
        return options.filter((option) => {
            const displayLabel = translations?.[option] || option;
            return displayLabel.toLowerCase().includes(normalizedQuery);
        });
    }, [options, query, translations]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            if (tooltipHideTimeout.current) {
                clearTimeout(tooltipHideTimeout.current);
            }
        };
    }, []);

    const handleTooltipEnter = () => {
        if (tooltipHideTimeout.current) {
            clearTimeout(tooltipHideTimeout.current);
        }

        if (tooltipButtonRef.current) {
            const rect = tooltipButtonRef.current.getBoundingClientRect();
            const gap = 8;
            const viewportWidth = window.innerWidth;
            const tooltipWidth = Math.min(256, viewportWidth - 32);
            const tooltipHeight = 80;

            let left: number;
            const rightSpace = viewportWidth - rect.right;
            if (rightSpace >= tooltipWidth + gap) {
                left = rect.right + gap;
            } else if (rect.left >= tooltipWidth + gap) {
                left = rect.left - gap - tooltipWidth;
            } else {
                left = Math.max(16, (viewportWidth - tooltipWidth) / 2);
            }

            let top = rect.top + rect.height / 2;
            top = Math.max(tooltipHeight / 2 + 4, Math.min(top, window.innerHeight - tooltipHeight / 2 - 4));

            setTooltipPos({ top, left });
        }

        setTooltipVisible(true);
    };

    const handleTooltipLeave = () => {
        tooltipHideTimeout.current = setTimeout(() => setTooltipVisible(false), 120);
    };

    const handleSelect = (option: string) => {
        const syntheticEvent = {
            target: {
                name,
                value: option,
            },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
        setQuery("");
        setIsOpen(false);
    };

    const handleClear = () => {
        const syntheticEvent = {
            target: {
                name,
                value: "",
            },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
        setQuery("");
    };

    // Intercepta el cambio para bloquear números fuera de rango en tiempo real
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === "number") {
            handleNumberValidation(
                e,
                { integerOnly, maxDecimals, max, min },
                onChange // onChange original como callback
            );
        } else {
            onChange(e);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (type === "number") {
            handleNumberKeyDown(e, integerOnly);
        }
    };

    const displayValue = value ? translations?.[value] || value : "";

    return (
        <div
            className={
                layout === "vertical"
                    ? "flex flex-col gap-1"
                    : "grid gap-2 grid-cols-28 md:items-center"
            }
        >
            {label != "" && (
                <label
                    className={
                        layout === "vertical"
                            ? "text-sm text-gray-600"
                            : "max-[540px]:text-[13px] text-sm text-gray-600 col-span-10"
                    }
                >
                    {label}
                </label>
            )}
            <div
                className={
                    layout === "horizontal"
                        ? `bg-white ${inputClassName || "col-span-12"}`
                        : "bg-white"
                }
            >
                {type === "select" ? (
                    <div ref={containerRef} className="relative">
                        <button
                            type="button"
                            className={`w-full rounded border border-gray-300 px-2 py-1.25 pr-16 text-left text-sm focus:border-valora-primary ${disabled
                                ? "bg-valora-primary/5 text-black cursor-not-allowed"
                                : "cursor-pointer"
                                }`}
                            onClick={() => setIsOpen((prev) => !prev)}
                            aria-haspopup="listbox"
                            aria-expanded={isOpen}
                            disabled={disabled}
                        >
                            <span className={value ? "text-gray-900" : "text-[#aaa]"}>
                                {displayValue || "SELECCIONE"}
                            </span>
                        </button>
                        {value && !disabled && showClearButton && (
                            <button
                                type="button"
                                className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Limpiar"
                                onClick={handleClear}
                            >
                                <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                        )}
                        <svg
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {required && (
                            <input
                                type="text"
                                name={name}
                                value={value}
                                readOnly
                                required
                                className="hidden"
                            />
                        )}
                        {isOpen && !disabled && (
                            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded border border-gray-200 bg-white text-sm shadow">
                                <div className="border-b border-gray-100 p-2">
                                    <input
                                        type="text"
                                        className="w-full rounded border border-gray-300 px-2 py-1.25 text-sm focus:border-valora-primary"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        autoComplete="off"
                                        placeholder="Buscar..."
                                    />
                                </div>
                                <div className="max-h-52 overflow-auto">
                                    {filteredOptions.length === 0 ? (
                                        <div className="px-2 py-1.25 text-gray-500">
                                            Sin resultados
                                        </div>
                                    ) : (
                                        filteredOptions.map((option) => {
                                            const itemLabel = translations?.[option] || option;
                                            return (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className="w-full px-2 py-1.25 text-left hover:bg-sky-50"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => handleSelect(option)}
                                                >
                                                    {itemLabel}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative flex-1">
                        <div
                            className={`flex items-stretch border border-gray-300 rounded transition-colors focus-within:border-valora-primary ${disabled ? "bg-valora-primary/5" : ""
                                }`}
                        >
                            {prefixSelect && (
                                <select
                                    name={prefixSelect.name}
                                    value={prefixSelect.value}
                                    onChange={onChange}
                                    className={`px-0.5 py-1.25 text-sm border-r border-gray-300 outline-none focus:outline-none text-wrap ${disabled
                                        ? "bg-valora-primary/5 text-black cursor-not-allowed"
                                        : "bg-gray-50 cursor-pointer hover:bg-gray-100"
                                        }`}
                                    disabled={disabled}
                                >
                                    {prefixSelect.options.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <div className="relative flex-1 flex items-center">
                                <input
                                    type={type === "number" ? "number" : "text"}
                                    min={min}
                                    max={max}
                                    step={step}
                                    className={`w-full flex-1 px-2 py-1.25 text-[13px] sm:text-sm outline-none focus:outline-none bg-transparent
                    ${disabled ? "bg-valora-primary/5 text-black cursor-not-allowed" : readOnly ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""} 
                    ${type === "number" ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""}
                  `}
                                    placeholder={placeholder}
                                    value={value}
                                    name={name}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    required={required}
                                    readOnly={readOnly}
                                    disabled={disabled}
                                />
                                {value && !readOnly && !disabled && showClearButton && (
                                    <button
                                        type="button"
                                        className="absolute right-2 text-gray-400 hover:text-gray-600"
                                        aria-label="Limpiar"
                                        onClick={handleClear}
                                    >
                                        <i className="fa-solid fa-xmark text-xs"></i>
                                    </button>
                                )}
                            </div>
                            {suffix && (
                                <span className="text-sm text-black px-2 py-1.25 bg-valora-primary/5 border-l border-gray-300 whitespace-nowrap flex items-center justify-center gap-1">
                                    {suffix}
                                </span>
                            )}
                        </div>
                        {tooltip && (
                            <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 flex items-center">
                                <span
                                    ref={tooltipButtonRef}
                                    onMouseEnter={handleTooltipEnter}
                                    onMouseLeave={handleTooltipLeave}
                                    className="flex h-5 w-5 items-center justify-center rounded-full bg-valora-primary/5 text-[11px] font-bold text-valora-primary cursor-pointer select-none"
                                >
                                    <svg className="h-3 w-3 text-valora-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {tooltip &&
                createPortal(
                    <div
                        onMouseEnter={handleTooltipEnter}
                        onMouseLeave={handleTooltipLeave}
                        style={{
                            position: "fixed",
                            top: tooltipPos.top,
                            left: tooltipPos.left,
                            zIndex: 1200,
                            transform: tooltipVisible
                                ? "translateY(-50%) translateX(0) scale(1)"
                                : "translateY(-50%) translateX(6px) scale(0.97)",
                            opacity: tooltipVisible ? 1 : 0,
                            pointerEvents: tooltipVisible ? "auto" : "none",
                            transition: "opacity 200ms ease, transform 200ms ease",
                        }}
                        className="max-w-[min(256px,calc(100vw-32px))] w-auto min-w-[180px] rounded-lg bg-white p-3 text-[11px] text-gray-600 shadow-2xl"
                    >
                        <p className="leading-relaxed">{tooltip}</p>
                    </div>,
                    document.body
                )}
        </div>
    );
};
