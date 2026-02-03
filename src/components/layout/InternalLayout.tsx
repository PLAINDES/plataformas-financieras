// src/components/layout/InternalLayout.tsx

import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Footer } from './Footer';
import { ScrollTop } from './ScrollTop';
import type { Company, User } from '../../types';

interface InternalLayoutProps {
  user: User | null;
  onLogout: () => void;
  company: Company
}


export function InternalLayout({ user, onLogout, company }: InternalLayoutProps) {
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
    };
    
    initTheme();
  }, []);
  
  return (
    <div className="d-flex flex-column flex-root" id="kt_app_root">
      
      <main className="flex-grow-1">
        <Outlet />
      </main>
      
      <Footer company={company}/>
      
      <ScrollTop />
    </div>
  );
}