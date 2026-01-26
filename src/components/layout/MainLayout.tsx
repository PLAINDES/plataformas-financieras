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
}

export function MainLayout({
  children,
  company,
  menuItems,
  user,
  onLogout,
  onLogin,
  onRegister,
}: MainLayoutProps) {
  useEffect(() => {
    // Theme setup from original code
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
    };
    
    initTheme();
  }, []);
  
  return (
    <div className="d-flex flex-column flex-root" id="kt_app_root">
      <Header
        company={company}
        menuItems={menuItems}
        user={user}
        onLogout={onLogout}
        onLogin={onLogin}
        onRegister={onRegister}
      />
      
      <main className="flex-grow-1">
        {children}
      </main>
      
      <Footer company={company} />
      
      <ScrollTop />
    </div>
  );
}