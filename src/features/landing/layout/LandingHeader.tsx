import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingUserMenu } from '../components/LandingUserMenu';
import { MobileMenuToggle } from '@/shared/components/ui/MobileMenuToggle';
import { LoginModal } from '../../auth/components/LoginModal';
import { RegisterModal } from '../../auth/components/RegisterModal';
import { useAuthModal } from '../../auth/hooks/useAuthModal';
import type { MenuItem, Company } from '@/shared/types';
import type { User, LoginCredentials } from '../../auth/types/user.types';
import { EditableImage } from '@/shared/components/editable/EditableImage';
import { useScrollSpy } from '../hooks/useScrollSpy';

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

  const visibleMenuItems = menuItems.filter(item => item.visible);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClick = (slug: string) => {
    const id = slug.toLowerCase();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setActiveMenu(id);
    setIsMobileMenuOpen(false);
  };

  useScrollSpy(
    visibleMenuItems.map(item => item.slug.toLowerCase()),
    setActiveMenu
  );

  return (
    <header className="relative w-full" id="home">
      <nav className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${isSticky ? 'bg-white/90 backdrop-blur-lg h-16 lg:h-[65px] shadow-sm' : 'bg-transparent h-20 lg:h-24'}`}
      >
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-12 items-center h-full">

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

          <div className="hidden lg:flex justify-center lg:col-span-6">
            <div className="flex items-center gap-2">
              {visibleMenuItems.map((item) => {
                const isActive = activeMenu === item.slug.toLowerCase();
                return (
                  
                  <a  key={item.id}
                    href={`#${item.slug.toLowerCase()}`}
                    onClick={(e) => { e.preventDefault(); handleMenuClick(item.slug); }}
                    className={`
                      relative px-5 py-2 rounded-full text-[16px] tracking-tight transition-all duration-300
                      ${isActive ? 'text-[#009ef7]' : 'text-gray-600 hover:text-[#009ef7]'}
                    `}
                  >
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 lg:col-span-3">
            
            <a  href="#contacto"
              className="hidden xl:block text-[11px] text-gray-400 hover:text-[#009ef7] transition-colors uppercase tracking-widest"
            >
              Soporte
            </a>

            <div className="h-6 w-[1px] bg-gray-200 hidden lg:block mx-2" />

            {user ? (
              <LandingUserMenu user={user} onLogout={onLogout} />
            ) : (
              <Button
                onClick={openLogin}
                className="h-9 lg:h-10 px-6 rounded-lg bg-[#009ef7] text-white text-xs hover:bg-[#0086d1] active:scale-95 shadow-sm"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        <aside className={`absolute top-0 left-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <img src="images/logo.png" alt="Logo" className="h-7" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X className="text-gray-500" size={14} />
              </Button>
            </div>

            <nav className="flex flex-col p-4 pt-10 gap-y-1">
              {visibleMenuItems.map((item) => {
                const isActive = activeMenu === item.slug.toLowerCase();
                return (
                  
                  <a  key={item.id}
                    href={`#${item.slug.toLowerCase()}`}
                    onClick={(e) => { e.preventDefault(); handleMenuClick(item.slug); }}
                    className={`
                      px-4 py-3 rounded-md text-sm transition-all
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
          </div>
        </aside>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={closeModal} onLogin={onLogin} onSwitchToRegister={switchToRegister} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeModal} onRegister={onRegister} onSwitchToLogin={switchToLogin} />

      <div className="h-20 lg:h-[65px]" />
    </header>
  );
}