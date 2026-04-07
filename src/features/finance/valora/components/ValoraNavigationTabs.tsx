// src/app/valora/components/NavigationTabs.tsx
import { useState, useEffect } from "react";

interface NavigationTabsProps {
  selected: "estados" | "resultados" | "analisis" | "metodologia" | "";
  onNavigate: (
    view: "estados" | "resultados" | "analisis" | "metodologia"
  ) => void;
  onOpenReport: () => void;
  hasResults: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  selected,
  onNavigate,
  onOpenReport,
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

          <button
            onClick={() => onNavigate("analisis")}
            className={`
              flex flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs transition-all duration-200 flex-1
              ${
                selected === "analisis"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <span
              className={
                selected === "analisis" ? "text-blue-600" : "text-gray-400"
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
            <span className="text-xs">Análisis</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-xs border border-purple-600 text-purple-600 shadow-md transition-all duration-200 flex-1"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.3"
                d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z"
                fill="currentColor"
              />
              <rect
                x="7"
                y="17"
                width="6"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="7"
                y="12"
                width="10"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="7"
                y="7"
                width="6"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <path
                d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs">Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
