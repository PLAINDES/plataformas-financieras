import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Opcional si usas React Router

interface SidebarProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface MenuItem {
  title: string;
  href: string;
  icon: JSX.Element;
  onClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation?.() || { pathname: '' };

  // SVG Icon Component
  const CubeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        opacity="0.3" 
        d="M11.8 5.2L17.7 8.6V15.4L11.8 18.8L5.90001 15.4V8.6L11.8 5.2ZM11.8 2C11.5 2 11.2 2.1 11 2.2L3.8 6.4C3.3 6.7 3 7.3 3 7.9V16.2C3 16.8 3.3 17.4 3.8 17.7L11 21.9C11.3 22 11.5 22.1 11.8 22.1C12.1 22.1 12.4 22 12.6 21.9L19.8 17.7C20.3 17.4 20.6 16.8 20.6 16.2V7.9C20.6 7.3 20.3 6.7 19.8 6.4L12.6 2.2C12.4 2.1 12.1 2 11.8 2Z" 
        fill="currentColor" 
      />
      <path 
        d="M11.8 8.69995L8.90001 10.3V13.7L11.8 15.3L14.7 13.7V10.3L11.8 8.69995Z" 
        fill="currentColor" 
      />
    </svg>
  );

  const ArrowIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        opacity="0.5" 
        d="M14.2657 11.4343L18.45 7.25C18.8642 6.83579 18.8642 6.16421 18.45 5.75C18.0358 5.33579 17.3642 5.33579 16.95 5.75L11.4071 11.2929C11.0166 11.6834 11.0166 12.3166 11.4071 12.7071L16.95 18.25C17.3642 18.6642 18.0358 18.6642 18.45 18.25C18.8642 17.8358 18.8642 17.1642 18.45 16.75L14.2657 12.5657C13.9533 12.2533 13.9533 11.7467 14.2657 11.4343Z" 
        fill="currentColor" 
      />
      <path 
        d="M8.2657 11.4343L12.45 7.25C12.8642 6.83579 12.8642 6.16421 12.45 5.75C12.0358 5.33579 11.3642 5.33579 10.95 5.75L5.40712 11.2929C5.01659 11.6834 5.01659 12.3166 5.40712 12.7071L10.95 18.25C11.3642 18.6642 12.0358 18.6642 12.45 18.25C12.8642 17.8358 12.8642 17.1642 12.45 16.75L8.2657 12.5657C7.95328 12.2533 7.95328 11.7467 8.2657 11.4343Z" 
        fill="currentColor" 
      />
    </svg>
  );

  const menuItems: MenuItem[] = [

    {
      title: 'Plantillas Maestras',
      href: '/admin/master/plantillas',
      icon: <CubeIcon />
    },

    {
      title: 'Reportes Kapital',
      href: '/admin/kapital/reportes',
      icon: <CubeIcon />
    },
    {
      title: 'Reportes Valora',
      href: '/admin/valora/reportes',
      icon: <CubeIcon />
    },
    {
      title: 'Configuración',
      href: '/admin/configuraciones',
      icon: <CubeIcon />
    }
  ];

  const isActive = (href: string) => {
    if (!location.pathname) return false;
    return location.pathname.startsWith(href) && href !== '#';
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
        className={`fixed left-0 top-0 z-50 flex  flex-col bg-[#1e1e2d] transition-all duration-300 lg:relative lg:z-auto
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isMinimized ? 'lg:w-[75px]' : 'w-[225px]'}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center px-6 py-8 relative">
          <a href="/admin" className="text-center">
            <h3 className={`font-bold text-white transition-all duration-300 ${isMinimized ? 'text-sm' : 'text-lg'}`}>
              {isMinimized ? 'ADM' : 'ADMINISTRADOR'}
            </h3>
          </a>

          {/* Toggle Button - Desktop Only */}
          <button
            onClick={onToggleMinimize}
            className={`absolute -right-[15px] top-1/2 hidden h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 lg:flex
              ${isMinimized ? 'rotate-0' : 'rotate-180'}
            `}
            aria-label="Toggle sidebar"
          >
            <ArrowIcon />
          </button>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
          {/* Menu Heading */}
          <div className="mb-2 px-3 pt-5">
            {!isMinimized && (
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
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
                className={`group flex items-center rounded-lg px-3 py-3 transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-[#1b1b28] text-[#3699FF]'
                    : 'text-gray-400 hover:bg-[#1b1b28] hover:text-white'
                  }
                  ${isMinimized ? 'justify-center' : ''}
                `}
                title={isMinimized ? item.title : ''}
              >
                {/* Icon */}
                <span className={`flex-shrink-0 ${isMinimized ? '' : 'mr-3'}`}>
                  <span className="inline-block h-6 w-6">
                    {item.icon}
                  </span>
                </span>

                {/* Title */}
                {!isMinimized && (
                  <span className="text-sm font-semibold">
                    {item.title}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive(item.href) && !isMinimized && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#3699FF]" />
                )}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e2d] text-white shadow-lg lg:hidden"
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </>
  );
};

export default Sidebar;