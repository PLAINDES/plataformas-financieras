// src/app/kapital/components/NavBar.tsx

import { useMemo } from "react";
import { FinanceNavbar } from "@/features/finance/components/FinanceNavbar";
import type { NavTab } from "@/features/finance/components/FinanceNavbar";
import { UserMenu } from "@/shared/components/common/UserMenu";
import type { User } from "@/shared/types/user.types";
import { ChevronRight } from "lucide-react";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onToggleForm: () => void;
  onLoginClick: () => void;
  isFormOpen: boolean;
  hasResults: boolean;
  selected: "result" | "sensitivity" | "";
  logoHref?: string;
  logoSrc?: string;
  logoAlt?: string;
  projectsHref?: string;
  onNavigate?: (view: "result" | "sensitivity") => void;
  onOpenReport?: () => void;
  hasSensibilizaciones?: boolean;
}

export const NavBar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onToggleForm,
  isFormOpen,
  onLoginClick,
  hasResults,
  selected,
  logoHref = "/kapital",
  logoSrc = "/images/logo-kapital-small.png",
  logoAlt = "Kapital Logo",
  projectsHref = "/usuario/proyectos",
  onNavigate,
  hasSensibilizaciones = false,
}) => {
  const tabs: NavTab[] = useMemo(() => {
    if (!hasResults) return [];

    return [
      {
        id: "result",
        label: "Resultados",
        icon: (
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
        ),
      },
      {
        id: "sensitivity",
        label: "Sensibilidad",
        disabled: !hasSensibilizaciones,
        icon: (
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
        ),
      },
      /*{
        id: "methodology",
        label: "Metodología",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
            <path d="M22 10v6" />
            <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
          </svg>
        ),
        isInHeader: true,
      },*/
    ];
  }, [hasResults, hasSensibilizaciones]);

  return (
    <FinanceNavbar
      logo={{
        src: logoSrc,
        alt: logoAlt,
        href: logoHref,
      }}
      tabs={tabs}
      selectedTabId={selected}
      onNavigate={(id) => {
        if (id === "sensitivity" && !hasSensibilizaciones) return;
        onNavigate?.(id as any);
      }}
      isFormOpen={isFormOpen}
      onToggleForm={onToggleForm}
      actions={
        <>
          <a className="flex flex-row gap-1 px-3 py-2 bg-valora-primary text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-valora-secondary cursor-pointer">
            Curso de capacitación
            <ChevronRight className="w-4 h-4 my-auto" />
          </a>
          {user ? (
            <UserMenu user={user} onLogout={onLogout}>
              <a
                href={projectsHref}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Mis proyectos
              </a>
            </UserMenu>
          ) : (
            <a
              className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-valora-primary bg-white border border-valora-primary rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={onLoginClick}
            >
              Iniciar sesión
            </a>
          )}
        </>
      }
    />
  );
};
