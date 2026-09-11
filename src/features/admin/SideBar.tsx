import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserMenu } from "@/shared/components/common/UserMenu";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { CoverIcon } from "@/shared/components/icons/CoverIcon";
import { ReportIcon } from "@/shared/components/icons/ReportIcon";
import { TemplateIcon } from "@/shared/components/icons/TemplateIcon";
import { SettingsIcon } from "@/shared/components/icons/SettingsIcon";
import { ArrowIcon } from "@/shared/components/icons/ArrowIcon";
import { User, BarChart3 } from "lucide-react";

interface SidebarProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMinimized = false,
  onToggleMinimize,
}) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation?.() || { pathname: "" };
  const hasAnimated = useRef(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems: MenuItem[] = [
    {
      title: "Plantillas Maestras",
      href: "/admin/master/plantillas",
      icon: <TemplateIcon />,
    },
    {
      title: "Portadas",
      href: "/admin/portadas",
      icon: <CoverIcon />,
    },
    {
      title: "Reportes",
      href: "/admin/reportes",
      icon: <ReportIcon />,
    },
    {
      title: "Métricas",
      href: "/admin/metricas",
      icon: <BarChart3 className="h-4 w-4" strokeWidth={1.5} />,
    },
    {
      title: "Usuarios",
      href: "/admin/usuarios",
      icon: <User className="h-4 w-4" strokeWidth={1.5} />,
    },
    {
      title: "Configuración",
      href: "/admin/configuraciones",
      icon: <SettingsIcon />,
    },
  ];

  const isActive = (href: string) => {
    if (!location.pathname) return false;
    return location.pathname.startsWith(href) && href !== "#";
  };

  return (
    <>
      <style>{`
        @keyframes sidebarItemEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
        .sidebar-item-enter {
          opacity: 0;
          animation: sidebarItemEnter 350ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
        nav a:active {
          transform: scale(0.96);
          transition: transform 150ms ease-out;
        }
      `}</style>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 h-dvh bg-black/20 bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="kt_app_sidebar"
        className={`fixed left-0 top-0 z-50 flex h-dvh flex-col transition-[width,transform] duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isMinimized ? "w-18.75" : "w-62.5"}
        `}
        style={{ backgroundColor: "#0c1524" }}
      >
        {/* Logo Section */}
        <div className="relative flex items-center justify-center border-b border-white/10 border-dashed px-4 py-7">
          {/* Radial glow behind logo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isMinimized
                ? "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%)"
                : "radial-gradient(ellipse 80% 70% at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
            }}
          />
          <Link to="/admin" className="relative flex items-center justify-center">
            {isMinimized ? (
              <span className="text-sm font-bold tracking-wide" style={{ color: "#2dd4bf" }}>
                PF
              </span>
            ) : (
              <img
                src="/images/logo-profinance.png"
                alt="ProFinance"
                className="h-7 w-auto object-contain"
                style={{ filter: "brightness(1.1) contrast(1.05)" }}
              />
            )}
          </Link>
          {/* Toggle Button - Desktop Only */}
          <button
            onClick={onToggleMinimize}
            className="absolute -right-3.75 top-1/2 hidden h-7.5 w-7.5 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-[1.02] lg:flex cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <ArrowIcon rotated={!isMinimized} />
          </button>
        </div>

        {/* Menu Section */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
          {/* Menu Heading */}
          <div className="mb-2 px-3 pt-5">
            {!isMinimized && (
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4a6a8a" }}>
                Módulos
              </span>
            )}
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsMobileOpen(false);
                }}
                className={`${!hasAnimated.current ? "sidebar-item-enter" : ""} group flex items-center rounded-lg px-3 py-2 transition-all duration-150 ease-out
                  ${
                    isActive(item.href)
                      ? "text-[#5eead4]"
                      : "text-gray-400 hover:text-white"
                  }
                  ${isMinimized ? "justify-center" : ""}
                `}
                style={{
                  animationDelay: `${index * 80}ms`,
                  background: isActive(item.href)
                    ? "linear-gradient(135deg, rgba(45, 212, 191, 0.12) 0%, rgba(45, 212, 191, 0.04) 100%)"
                    : undefined,
                }}
                onAnimationEnd={() => {
                  if (!hasAnimated.current) {
                    hasAnimated.current = true;
                  }
                }}
                title={isMinimized ? item.title : ""}
              >
                {/* Icon */}
                <span
                  className={`shrink-0 flex justify-center transition-colors duration-150 ${isMinimized ? "" : "mr-3"}`}
                  style={{ color: isActive(item.href) ? "#2dd4bf" : undefined }}
                >
                  <span className="inline-block h-4 w-4">{item.icon}</span>
                </span>

                {/* Title */}
                {!isMinimized && (
                  <span className="text-sm font-normal">{item.title}</span>
                )}

                {/* Active Indicator */}
                {isActive(item.href) && !isMinimized && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#2dd4bf" }} />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="border-t border-white/10 border-dashed p-4">
            <UserMenu
              user={user}
              onLogout={handleLogout}
              onlyLogout={true}
              customTrigger={
                <div
                  className={`flex items-center gap-3 rounded-xl p-2 transition-colors duration-150 hover:bg-white/10 cursor-pointer ${isMinimized ? "justify-center" : ""}`}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-700 outline outline-1 outline-white/10">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${user.name}+${user.lastname}&background=random`
                      }
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {!isMinimized && (
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="truncate text-sm font-medium text-white max-w-35">
                        {user.name} {user.lastname}
                      </span>
                      <span className="truncate text-xs text-gray-400 max-w-35">
                        {user.email}
                      </span>
                    </div>
                  )}
                </div>
              }
            />
          </div>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg lg:hidden"
        style={{ backgroundColor: "#0c1524" }}
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>
    </>
  );
};

export default Sidebar;
