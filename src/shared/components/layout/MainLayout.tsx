// src/components/layout/MainLayout.tsx

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollTop } from './ScrollTop';
import type { Company, MenuItem, User, LoginCredentials } from '../../types';

interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

interface MainLayoutProps {
  children: ReactNode;
  company: Company;
  menuItems: MenuItem[];
  user: User | null;
  onLogout: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onRegister: (data: RegisterData) => Promise<void>;
  OnSave: (data: any) => Promise<void>; // Asegúrate de pasar OnSave si Header lo requiere
}

export function MainLayout({
  children,
  company,
  menuItems,
  user,
  onLogout,
  onLogin,
  onRegister,
  OnSave // Prop añadida para consistencia con el Header anterior
}: MainLayoutProps) {
  useEffect(() => {
    const initTheme = () => {
      const defaultThemeMode = 'light';
      let themeMode: string;
      
      if (document.documentElement.hasAttribute('data-theme-mode')) {
        themeMode = document.documentElement.getAttribute('data-theme-mode') || defaultThemeMode;
      } else {
        const stored = localStorage.getItem('data-theme');
        themeMode = stored || defaultThemeMode;
      }
      
      if (themeMode === 'system') {
        themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      document.documentElement.setAttribute('data-theme', themeMode);
      // Soporte para modo oscuro de Tailwind
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    initTheme();
  }, []);
  
  return (
    /* d-flex flex-column flex-root -> flex flex-col min-h-screen */
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900" id="kt_app_root">
      <Header
        company={company}
        menuItems={menuItems}
        user={user}
        onLogout={onLogout}
        onLogin={onLogin}
        onRegister={onRegister}
        OnSave={OnSave}
      />
      
      {/* flex-grow-1 -> flex-grow */}
      <main className="flex-grow pt-[80px]"> 
        {/* pt-[80px] añadido para compensar el Header fixed y que no tape el contenido */}
        {children}
      </main>
      
      <Footer company={company} />
      
      <ScrollTop />
    </div>
  );
}