// src/components/layout/InternalLayout.tsx

import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
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
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    initTheme();
  }, []);

  return (


    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900" id="kt_app_root">

      <main className="flex-grow">
        <Outlet />
      </main>
      <ScrollTop />
    </div>
  );
}
