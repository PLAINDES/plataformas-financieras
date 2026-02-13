// src/app/kapital/components/NavBar.tsx
import React from 'react';

interface NavbarProps {
  onToggleForm: () => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  isFormOpen: boolean;
  hasResults: boolean;
  selected: 'result' | 'analysis' | 'methodology' | '';
  onNavigate: (view: 'result' | 'analysis' | 'methodology') => void;
  onOpenReport: () => void;
}

export const NavBar: React.FC<NavbarProps> = ({
  onToggleForm,
  showUserMenu,
  setShowUserMenu,
  isFormOpen,
  hasResults,
  selected,
  onNavigate,
  onOpenReport,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section: Logo + Form Button + Methodology Button */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          <a href="/kapital" className="flex items-center">
            <img 
              src="/public/images/logo-kapital-small.png" 
              alt="Kapital Logo" 
              className="h-8 w-auto"
            />
          </a>
          
          {/* Form Toggle Button */}
          <button
            onClick={onToggleForm}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${isFormOpen 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            <span className={isFormOpen ? 'text-blue-600' : 'text-gray-400'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M4 14h6"/>
                <path d="M4 2h10"/>
                <rect x="4" y="18" width="16" height="4" rx="1"/>
                <rect x="4" y="6" width="16" height="4" rx="1"/>
              </svg>
            </span>
          </button>

          {/* Methodology Button -  Mobile */}
          {hasResults && (
            <button
              onClick={() => onNavigate('methodology')}
              className={`
                lg:hidden flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                ${selected === 'methodology'
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-black-700 hover:bg-gray-50'}
              `}
              aria-label="Metodología"
            >
              <span className={selected === 'methodology' ? 'text-blue-600' : 'text-gray-400'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
                  <path d="M22 10v6"/>
                  <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
                </svg>
                
              </span>
            </button>
          )}
        </div>

  

        {/* Right Section: User Menu */}
        <div className="relative flex gap-3">
                {/* Center Section: Desktop Navigation (Hidden on Mobile) */}
        {hasResults && (
          <div className="hidden lg:flex items-center gap-2">
            {/* Main Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('result')}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${selected === 'result'
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span className={selected === 'result' ? 'text-blue-600' : 'text-gray-400'}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                Resultados
              </button>

              <button
                onClick={() => onNavigate('analysis')}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${selected === 'analysis'
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span className={selected === 'analysis' ? 'text-blue-600' : 'text-gray-400'}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </span>
                Análisis
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-300 mx-1"></div>

            {/* Secondary Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('methodology')}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${selected === 'methodology'
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span className={selected === 'methodology' ? 'text-blue-600' : 'text-gray-600'}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
                    <path d="M22 10v6"/>
                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
                  </svg>
                </span>
                Metodología
              </button>

              <button
                onClick={onOpenReport}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm border border-purple-600 text-purple-600  transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="currentColor" />
                  <rect x="7" y="17" width="6" height="2" rx="1" fill="currentColor" />
                  <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" />
                  <rect x="7" y="7" width="6" height="2" rx="1" fill="currentColor" />
                  <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="currentColor" />
                </svg>
                Reportes
              </button>
            </div>
          </div>
        )}
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors overflow-hidden"
            >
              <img 
                src="/public/images/blank.png" 
                alt="Usuario" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Usuario Demo</p>
                    <p className="text-xs text-gray-500 mt-1">usuario@demo.com</p>
                  </div>

                  {/* Menu Items */}
                  <a 
                    href="/kapital/proyectos"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Mis proyectos
                  </a>

                  <div className="my-1 border-t border-gray-100" />

                  <a 
                    href="/auth/signout"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};