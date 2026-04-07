import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Opcional si usas React Router
import { UserMenu } from "@/shared/components/common/UserMenu";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { CoverIcon } from "@/shared/components/icons/CoverIcon";
import { ReportIcon } from "@/shared/components/icons/ReportIcon";
import { TemplateIcon } from "@/shared/components/icons/TemplateIcon";
import { SettingsIcon } from "@/shared/components/icons/SettingsIcon";
import { ArrowIcon } from "@/shared/components/icons/ArrowIcon";

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
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="kt_app_sidebar"
        className={`fixed left-0 top-0 z-50 flex flex-col bg-[#1e1e2d] transition-all duration-300 h-screen
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isMinimized ? "w-[75px]" : "w-[250px]"}
        `}
      >
        {/* Logo Section */}
        <div className="py-6  relative text-center border-b px-0 border-gray-600 border-dashed">
          <a href="/admin" className="">
            <h3
              className={`font-bold text-white transition-all duration-300 ${isMinimized ? "text-sm" : "text-md"}`}
            >
              {isMinimized ? "ADM" : "ADMINISTRADOR"}
            </h3>
          </a>
          {/* Toggle Button - Desktop Only */}
          <button
            onClick={onToggleMinimize}
            className={
              "absolute -right-[15px]  top-1/2 hidden h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 lg:flex"
            }
            aria-label="Toggle sidebar"
          >
            <ArrowIcon rotated={!isMinimized} />
          </button>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
          {/* Menu Heading */}
          <div className="mb-2 px-3 pt-5">
            {!isMinimized && (
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Módulos
              </span>
            )}
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsMobileOpen(false);
                }}
                className={`group flex items-center rounded-lg px-3 py-1.5 transition-all duration-200
                  ${
                    isActive(item.href)
                      ? "bg-[#1b1b28] text-[#3699FF]"
                      : "text-gray-400 hover:bg-[#1b1b28] hover:text-white"
                  }
                  ${isMinimized ? "justify-center" : ""}
                `}
                title={isMinimized ? item.title : ""}
              >
                {/* Icon */}
                <span
                  className={`flex-shrink-0 flex justify-center ${isMinimized ? "" : "mr-3"}`}
                >
                  <span className="inline-block h-4 w-4">{item.icon}</span>
                </span>

                {/* Title */}
                {!isMinimized && (
                  <span className="text-sm font-normal">{item.title}</span>
                )}

                {/* Active Indicator */}
                {isActive(item.href) && !isMinimized && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#3699FF]" />
                )}
              </a>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="border-t border-dashed border-gray-600 p-4">
            <UserMenu
              user={user}
              onLogout={handleLogout}
              onlyLogout={true}
              customTrigger={
                <div
                  className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/10 cursor-pointer ${isMinimized ? "justify-center" : ""}`}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-700">
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
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e2d] text-white shadow-lg lg:hidden"
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
