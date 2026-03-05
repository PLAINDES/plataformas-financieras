// src/components/layout/Header.tsx

import { useState, useEffect } from 'react';
import { UserMenu } from '../components/common/UserMenu';
import { MobileMenuToggle } from '../components/common/MobileMenuToggle';
import { LoginModal } from '../auth/LoginModal';
import { RegisterModal } from '../auth/RegisterModal';
import { useAuthModal } from '../../features/auth/hooks/useAuthModal';
import type { MenuItem, Company, User, LoginCredentials, EditableContent } from '../../types';
import { EditableImage } from '../editable/EditableImage';

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
  OnSave: (data: any) => Promise<void>; 
}

export function Header({ 
  company, 
  menuItems, 
  user, 
  onLogout, 
  onLogin, 
  onRegister,
  OnSave 
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

  const handleSaveDescription = async (editableContent: EditableContent) => {
    await OnSave({
      description: editableContent.value,
    });
  };

  return (
    <div className="mb-0" id="home">
      <div
        className="bg-no-repeat bg-contain bg-bottom" 
        style={{ backgroundImage: 'url(/assets/media/svg/illustrations/landing.svg)' }}
      >
        {/* Header Container */}
        <header 
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 md:px-12 md:py-6 flex items-center justify-between ${
            isSticky ? 'bg-white shadow-md py-3' : 'bg-transparent'
          }`}
        >
          {/* Left Side: Toggle + Logo + Nav */}
          <div className="flex items-center flex-1">
            <div className="lg:hidden">
              <MobileMenuToggle 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                isOpen={isMobileMenuOpen}
              />
            </div>

            <div className="hidden md:block">
              <EditableImage 
                content={{ value: "images/diseñador.png", id: 'header-designer', type: 'text', section: 'header' }} 
                onSave={handleSaveDescription} 
                alt='image' 
                className='h-[40px]' 
              />
            </div>

            <div className="md:hidden ml-2">
              <EditableImage 
                content={{ value: "images/logo.png", id: 'header-logo', type: 'text', section: 'header' }} 
                onSave={handleSaveDescription} 
                alt='Logo' 
                className='h-[35px]' 
              />
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center ml-12 space-x-8">
              {visibleMenuItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.slug.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick(item.slug);
                  }}
                  className={`text-sm font-bold transition-colors hover:text-blue-600 ${
                    activeMenu === item.slug.toLowerCase() ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          
          {/* Right Side: Auth + Secondary Logo */}
          <div className="flex items-center justify-end flex-1 gap-6">
            <div>
              {user ? (
                <UserMenu user={user} onLogout={onLogout} />
              ) : (
                <button 
                  onClick={openLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all"
                >
                  <i className="fa-solid fa-arrow-right-to-bracket mr-2"></i>
                  <span className="hidden sm:inline">Iniciar sesión</span>
                </button>
              )}
            </div>
            
            <div className="hidden sm:block">
              <EditableImage 
                content={{ value: "images/logo.png", id: 'header-logo', type: 'text', section: 'header' }} 
                onSave={handleSaveDescription} 
                alt='Logo' 
                className='h-[40px]' 
              />
            </div>
          </div>
        </header>
        
        {/* Mobile Menu Overlay & Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-6 transition-transform">
              <nav className="flex flex-col space-y-4">
                {visibleMenuItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.slug.toLowerCase()}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick(item.slug);
                    }}
                    className={`text-lg font-bold py-2 border-b border-gray-100 ${
                      activeMenu === item.slug.toLowerCase() ? 'text-blue-600' : 'text-gray-800'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </aside>
          </div>
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