import React from 'react';

interface NavbarProps {
  onToggleMenu: () => void;
  onToggleForm: () => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  isMenuOpen: boolean;
  isFormOpen: boolean;
  hasResults: boolean;
}

export const NavBar: React.FC<NavbarProps> = ({
  onToggleMenu,
  onToggleForm,
  showUserMenu,
  setShowUserMenu,
  isMenuOpen,
  isFormOpen,
  hasResults,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Left Section: Form Button + User */}
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
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
              ${isFormOpen 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Formulario</span>
          </button>

 
        </div>

        {/* Right Section: Menu Button + Logo */}
        <div className="flex items-center gap-3">
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
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
          {hasResults && (
            <>
            {/* Menu Toggle Button */}
            <button
              onClick={onToggleMenu}
              className={`
                p-2 rounded-lg transition-all duration-200 hover:bg-gray-100
                ${isMenuOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}
              `}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            </>
            )}
          

      
        </div>

     
      </div>
    </nav>
  );
};