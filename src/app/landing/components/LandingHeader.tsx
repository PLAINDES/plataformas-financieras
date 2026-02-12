import { useState, useEffect } from 'react';
import { UserMenu } from '../../../components/components/common/UserMenu';
import { MobileMenuToggle } from '../../../components/components/common/MobileMenuToggle';
import { LoginModal } from '../../../components/auth/LoginModal';
import { RegisterModal } from '../../../components/auth/RegisterModal';
import { useAuthModal } from '../../../hooks/useAuthModal';
import type { MenuItem, Company, User, LoginCredentials, EditableContent } from '../../../types';
import { EditableImage } from '../../../components/editable/EditableImage';

interface HeaderProps {
  company: Company;
  menuItems: MenuItem[];
  user: User | null;
  onLogout: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onRegister: (data: any) => Promise<void>;
  onSave?: (content: any) => Promise<void>;
}

export function LandingHeader({ menuItems, user, onLogout, onLogin, onRegister, onSave }: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>('home');

  const { isLoginOpen, isRegisterOpen, openLogin, closeModal, switchToRegister, switchToLogin } = useAuthModal();
  
  const EXCLUDED_IDS = [72, 73];
  const visibleMenuItems = menuItems.filter(item => !EXCLUDED_IDS.includes(item.id) && item.visible);
  
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClick = (slug: string) => {
    const id = slug.toLowerCase();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Ajuste para el header fixed
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveMenu(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative w-full" id="home">
      <nav className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${isSticky 
          ? 'bg-white/90 backdrop-blur-lg h-16 lg:h-[65px] shadow-sm' 
          : 'bg-transparent h-20 lg:h-24'}
      `}>
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-12 items-center h-full">
          
          {/* 1. SECCIÓN IZQUIERDA: Logo & Mobile Toggle */}
          <div className="flex items-center gap-4 lg:col-span-3">
            <div className="lg:hidden">
              <MobileMenuToggle onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
            </div>
            
            <div className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105">
              <EditableImage 
                content={{ value: "images/logo.png", id: 'header-logo', type: 'text', section: 'header' }} 
                onSave={async (c) => onSave?.({ logo: c.value })} 
                alt='Logo' 
                className="h-8 lg:h-10 w-auto object-contain" 
              />
            </div>
          </div>

          {/* 2. SECCIÓN CENTRAL: Desktop Nav */}
          <div className="hidden lg:flex justify-center lg:col-span-6">
            <div className="flex items-center gap-2">
              {visibleMenuItems.map((item) => {
                const isActive = activeMenu === item.slug.toLowerCase();
                return (
                  <a
                    key={item.id}
                    href={`#${item.slug.toLowerCase()}`}
                    onClick={(e) => { e.preventDefault(); handleMenuClick(item.slug); }}
                    className={`
                      relative px-5 py-2 rounded-full text-[16px] tracking-tight transition-all duration-300
                      ${isActive ? 'text-white bg-[#009ef7] shadow-md shadow-blue-200' : 'text-gray-600 hover:text-[#009ef7]'}
                    `}
                  >
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* 3. SECCIÓN DERECHA: Acciones */}
          <div className="flex items-center justify-end gap-3 lg:col-span-3">
            <a href="#contacto" className="hidden xl:block text-[11px]  text-gray-400 hover:text-[#009ef7] transition-colors uppercase tracking-widest">
              Soporte
            </a>

            <div className="h-6 w-[1px] bg-gray-200 hidden lg:block mx-2"></div>

            {user ? (
              <UserMenu user={user} onLogout={onLogout} />
            ) : (
              <button 
                onClick={openLogin}
                className="h-9 lg:h-10 px-6 rounded-lg bg-[#009ef7] text-white text-xs transition-all hover:bg-[#0086d1] active:scale-95 shadow-sm"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER (Estilo Metronic) */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer Content */}
        <aside className={`
          absolute top-0 left-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header del Drawer */}
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <img src="images/logo.png" alt="Logo" className="h-7" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                <i className="fa-solid fa-xmark text-gray-500 text-sm"></i>
              </button>
            </div>

            {/* Links con padding superior como pediste */}
            <nav className="flex flex-col p-4 pt-10 gap-y-1">
              {visibleMenuItems.map((item) => {
                const isActive = activeMenu === item.slug.toLowerCase();
                return (
                  <a
                    key={item.id}
                    href={`#${item.slug.toLowerCase()}`}
                    onClick={(e) => { e.preventDefault(); handleMenuClick(item.slug); }}
                    className={`
                      px-4 py-3 rounded-md text-sm  transition-all
                      ${isActive 
                        ? 'bg-[#009ef7]/10 text-[#009ef7]' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#009ef7]'}
                    `}
                  >
                    {item.name}
                  </a>
                );
              })}
            </nav>

            {/* Botón inferior en móvil */}
            {!user && (
              <div className="mt-auto p-6">
                <button 
                  onClick={openLogin} 
                  className="w-full bg-[#009ef7] text-white py-3.5 rounded-xl  shadow-lg shadow-blue-100 active:scale-95 transition-transform"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={closeModal} onLogin={onLogin} onSwitchToRegister={switchToRegister} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeModal} onRegister={onRegister} onSwitchToLogin={switchToLogin} />
      
      {/* Spacer para evitar que el contenido se pegue al header fixed */}
      <div className="h-20 lg:h-[65px]" />
    </header>
  );
}