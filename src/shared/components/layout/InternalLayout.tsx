// src/components/layout/InternalLayout.tsx

import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { ScrollTop } from "./ScrollTop";

export function InternalLayout() {
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
      className="relative flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900"
      id="kt_app_root"
    >
      <main className="grow">
        <Outlet />
      </main>
      <ScrollTop />
    </div>
  );
}
