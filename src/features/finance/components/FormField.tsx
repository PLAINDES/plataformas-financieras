import React, { useEffect, useMemo, useRef, useState } from "react";

import type { FormData } from "@/shared/types/ValoraTypes";

export interface FormFieldProps {
  label: string;
  name: keyof FormData;
  type: "select" | "text";
  value: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  tooltip?: string;
  suffix?: string;
  readOnly?: boolean;
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
    return options.filter((option) =>
      option.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

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

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-center">
      {label != "" && (
        <label className="text-sm text-gray-600 md:col-span-4 font-semibold">
          {label}
        </label>
      )}
      <div className="md:col-span-8 bg-white">
        {type === "select" ? (
          <div ref={containerRef} className="relative">
            <button
              type="button"
              className="w-full rounded border border-gray-300 px-3 py-2 pr-16 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
            >
              <span className={value ? "text-gray-900" : "text-[#aaa]"}>
                {value || "SELECCIONE"}
              </span>
            </button>
            {value && (
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
            {isOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded border border-gray-200 bg-white text-sm shadow">
                <div className="border-b border-gray-100 p-2">
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    autoComplete="off"
                    placeholder="Buscar..."
                  />
                </div>
                <div className="max-h-52 overflow-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">
                      Sin resultados
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-sky-50"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(option)}
                      >
                        {option}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={`flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder={placeholder}
                value={value}
                name={name}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
              />
              {suffix && (
                <span className="text-sm text-gray-600">{suffix}</span>
              )}
              {tooltip && (
                <div className="group relative">
                  <i className="fa-solid fa-circle-info text-gray-400 cursor-help"></i>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
            {value && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpiar"
                onClick={handleClear}
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
