import { useEffect, useMemo, useRef, useState } from "react";

import type { FormData } from "@/shared/types/ValoraTypes";

export interface FormFieldProps {
  label: string;
  name: keyof FormData;
  type: "select" | "text" | "number";
  value: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  tooltip?: string;
  suffix?: string;
  readOnly?: boolean;
  disabled?: boolean;
  translations?: Record<string, string>;
  min?: number;
  max?: number;
  step?: string;
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
  prefixSelect,
  onChange,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    if (type === "number" && e.target.value !== "") {
      const numVal = Number(e.target.value);
      if (max !== undefined && numVal > max) return; // Bloquea si supera max
      if (min !== undefined && numVal < min) return; // Bloquea si es menor a min
    }
    onChange(e);
  };

  const displayValue = value ? translations?.[value] || value : "";

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-center">
      {label != "" && (
        <label className="text-sm text-gray-600 md:col-span-4">{label}</label>
      )}
      <div className="md:col-span-8 bg-white">
        {type === "select" ? (
          <div ref={containerRef} className="relative">
            <button
              type="button"
              className={`w-full rounded border border-gray-300 px-3 py-1.5 pr-16 text-left text-sm focus:border-valora-primary ${
                disabled
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
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
            {value && !disabled && (
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
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-valora-primary"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoComplete="off"
                    placeholder="Buscar..."
                  />
                </div>
                <div className="max-h-52 overflow-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-1.5 text-gray-500">
                      Sin resultados
                    </div>
                  ) : (
                    filteredOptions.map((option) => {
                      const itemLabel = translations?.[option] || option;
                      return (
                        <button
                          key={option}
                          type="button"
                          className="w-full px-3 py-1.5 text-left hover:bg-sky-50"
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
              className={`flex items-stretch border border-gray-300 rounded transition-colors focus-within:border-valora-primary ${
                disabled ? "bg-gray-200" : ""
              }`}
            >
              {prefixSelect && (
                <select
                  name={prefixSelect.name}
                  value={prefixSelect.value}
                  onChange={onChange}
                  className={`px-2 py-1.5 text-sm border-r border-gray-300 outline-none focus:outline-none ${
                    disabled
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
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
                  className={`w-full flex-1 px-3 py-1.5 text-sm outline-none focus:outline-none bg-transparent pr-8
                    ${readOnly || disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""} 
                    ${type === "number" ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""}
                  `}
                  placeholder={placeholder}
                  value={value}
                  name={name}
                  onChange={handleInputChange}
                  required={required}
                  readOnly={readOnly}
                  disabled={disabled}
                />
                {value && !readOnly && !disabled && (
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
                <span className="text-sm text-gray-600 px-3 py-1.5 bg-slate-100/80 border-l border-gray-300 whitespace-nowrap">
                  {suffix}
                </span>
              )}
              {tooltip && (
                <div className="group relative flex items-center pr-3">
                  <i className="fa-solid fa-circle-info text-gray-400 cursor-help"></i>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
