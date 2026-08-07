// src/app/valora/components/NavigationTabs.tsx
import { useState, useEffect } from "react";

import type { ValoraResultsSectionKey } from "./ValoraResults";

interface NavigationTabsProps {
  selected: ValoraResultsSectionKey | "";
  onNavigate: (view: ValoraResultsSectionKey) => void;
  hasResults: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  selected,
  onNavigate,
  hasResults,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  if (!hasResults) return null;

  return (
    <div
      className={`
        lg:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm
        transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="px-2 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate("resultados")}
            className={`
              flex flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs transition-all duration-200 flex-1
              ${
                selected === "resultados"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <span
              className={
                selected === "resultados" ? "text-blue-600" : "text-gray-400"
              }
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </span>
            <span className="text-xs">Resultados</span>
          </button>

          {/* Pestaña de sensibilidad desactivada por ahora */}
          {false && (
            <button
              onClick={() => hasSensitized && onNavigate("sensibilidad")}
              disabled={!hasSensitized}
              className={`
                flex flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs transition-all duration-200 flex-1
                ${
                  selected === "sensibilidad"
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : hasSensitized
                      ? "text-gray-700 hover:bg-gray-50"
                      : "text-gray-400 cursor-not-allowed opacity-60"
                }
              `}
            >
              <span
                className={
                  selected === "sensibilidad" ? "text-blue-600" : "text-gray-400"
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </span>
              <span className="text-xs">Sensibilidad</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
