// src/components/layout/MainLayout.tsx

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollTop } from "./ScrollTop";
import type { Company, MenuItem, LoginCredentials } from "../../types";
import type { User, RegisterData } from "@/features/auth/types/user.types";

interface MainLayoutProps {
  children: ReactNode;
  company: Company;
  menuItems: MenuItem[];
  user: User | null;
  onLogout: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<User>;
  onRegister: (data: RegisterData) => Promise<User>;
  OnSave: (data: any) => Promise<void>;
}

export function MainLayout({
  children,
  company,
  menuItems,
  user,
  onLogout,
  onLogin,
  onRegister,
  OnSave,
}: MainLayoutProps) {
  useEffect(() => {
    const initTheme = () => {
      const defaultThemeMode = "light";
      let themeMode: string;

      if (document.documentElement.hasAttribute("data-theme-mode")) {
        themeMode =
          document.documentElement.getAttribute("data-theme-mode") ||
          defaultThemeMode;
      } else {
        const stored = localStorage.getItem("data-theme");
        themeMode = stored || defaultThemeMode;
      }

      if (themeMode === "system") {
        themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }

      document.documentElement.setAttribute("data-theme", themeMode);
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    initTheme();
  }, []);

  return (
    <div
      className="relative flex flex-col min-h-screen bg-white dark:bg-slate-900"
      id="kt_app_root"
    >
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
      <main className="grow pt-20">
        {/* pt-20 añadido para compensar el Header fixed y que no tape el contenido */}
        {children}
      </main>

      <Footer company={company} />

      <ScrollTop />
    </div>
  );
}
