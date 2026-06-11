"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";

/**
 * ThemeProvider - theme state'ini store'dan okuyup <html>'e class olarak uygular
 * "system" seçeneğinde prefers-color-scheme medya sorgusunu dinler
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);

  const applyTheme = useCallback((isDark: boolean) => {
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      applyTheme(true);
      return;
    }

    if (theme === "light") {
      applyTheme(false);
      return;
    }

    // "system" — medya sorgusunu dinle
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(mq.matches);

    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  return <>{children}</>;
}
