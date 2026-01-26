// src/components/layout/Header.tsx

import { useState, useEffect } from 'react';
import { Logo } from '../components/common/Logo';
import { UserMenu } from '../components/common/UserMenu';
import { MobileMenuToggle } from '../components/common/MobileMenuToggle';
import { LoginModal } from '../auth/LoginModal';
import { RegisterModal } from '../auth/RegisterModal';
import { useAuthModal } from '../../hooks/useAuthModal';
import type { MenuItem, Company, User, LoginCredentials } from '../../types';

interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

interface HeaderProps {
  company: Company;
  menuItems: MenuItem[];
  user: User | null;
  onLogout: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onRegister: (data: RegisterData) => Promise<void>;
}

export function Header({ 
  company, 
  menuItems, 
  user, 
  onLogout, 
  onLogin, 
  onRegister 
}: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>('home');

  const {
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    closeModal,
    switchToRegister,
    switchToLogin,
  } = useAuthModal();
  
  // IDs que no deben mostrarse (según tu código original)
  const EXCLUDED_IDS = [72, 73];
  const STICKY_OFFSET_DESKTOP = 300;
  const STICKY_OFFSET_MOBILE = 200;
  
  const visibleMenuItems = menuItems.filter(
    (item) => !EXCLUDED_IDS.includes(item.id) && item.visible
  );
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.innerWidth >= 1024 ? STICKY_OFFSET_DESKTOP : STICKY_OFFSET_MOBILE;

      setIsSticky(window.scrollY > offset);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleMenuClick = (slug: string) => {
    const id = slug.toLowerCase();
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }

    setActiveMenu(id);
    setIsMobileMenuOpen(false);
  };

  
  return (
    <div className="mb-0" id="home">
      <div
        className="bgi-no-repeat bgi-size-contain bgi-position-x-center bgi-position-y-bottom" style={{ backgroundImage: 'url(/assets/media/svg/illustrations/landing.svg)' }}>
        <div className={`landing-header ${isSticky ? 'sticky' : ''}`} style={{ padding: '25px 50px', width: '100%' }}>
          <div className="d-flex align-items-center justify-content-between w-100">
            
            {/* Logo principal + Menú */}
            <div className="d-flex align-items-center flex-equal w-50">
              <MobileMenuToggle 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                isOpen={isMobileMenuOpen}
              />
              
              <Logo
                src={"images/diseñador.png"}
                alt="DiseñadorLogo"
                className="logo-default hidden-mobile"
              />

              <Logo
                src={"images/logo.png"}
                alt="Logo"
                className="logo-default d-lg-none"
              />
              
              {/* Desktop Menu */}
              <div className="d-none d-lg-block" style={{ paddingLeft: '45px' }}>
                <nav className="menu menu-column flex-nowrap menu-rounded menu-lg-row fw-bold menu-state-title-primary nav nav-flush fs-5">
                  {visibleMenuItems.map((item) => (
                    <div key={item.id} className="menu-item">
             
                    <a
                      href={`#${item.slug.toLowerCase()}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMenuClick(item.slug);
                      }}
                      className={`menu-link nav-link  ${
                        activeMenu === item.slug.toLowerCase() ? 'active' : ''
                      }`}
                    >
                      {item.name}
                    </a>

                    </div>
                  ))}
                </nav>
              </div>
            </div>
            
            <div className='d-flex w-50 justify-content-end align-items-center flex-equal gap-5'>
              {/* User Menu / Login */}
              <div className="text-center ms-1">
                {user ? (
                  <UserMenu user={user} onLogout={onLogout} />
                ) : (
                  <button 
                    onClick={openLogin}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fa-solid fa-arrow-right-to-bracket me-1"></i>
                    <span className="hidden-mobile">Iniciar sesión</span>
                  </button>
                )}
              </div>
              
              {/* Logo secundario */}
              <div className="d-flex align-items-center" >
             
                <Logo
                  src={`images/logo.png`}
                  alt="Logo"
                  className="logo-default hidden-mobile"
                />
              </div>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <>
            <div
              className="mobile-menu-overlay d-lg-none"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <aside className="mobile-menu-drawer open d-lg-none">
              <nav className="menu menu-column px-4">
                {visibleMenuItems.map((item) => (
                  <div key={item.id} className="menu-item">
                    <a
                      href={`#${item.slug.toLowerCase()}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMenuClick(item.slug);
                      }}
                      className={`menu-link nav-link py-3 fs-6 fw-bold ${activeMenu === item.slug.toLowerCase() ? 'active mobile-active' : ''}`}
                      >
                      {item.name}
                    </a>
                  </div>
                ))}
              </nav>
            </aside>
          </>
        )}

      </div>
      
      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeModal}
        onLogin={onLogin}
        onSwitchToRegister={switchToRegister}
      />
      
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeModal}
        onRegister={onRegister}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
}