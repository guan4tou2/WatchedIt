"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "auto",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 從 localStorage 載入主題設定
    const savedTheme = localStorage.getItem("watchedit_theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 儲存主題設定到 localStorage
    localStorage.setItem("watchedit_theme", theme);

    // 計算實際應用的主題
    let actualTheme: "light" | "dark";

    if (theme === "auto") {
      // 檢查系統偏好
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      actualTheme = mediaQuery.matches ? "dark" : "light";

      // 監聽系統主題變化
      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      actualTheme = theme;
    }

    setResolvedTheme(actualTheme);

    // 應用主題到 document
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(actualTheme);
  }, [theme, mounted]);

  // 在客戶端渲染之前，提供預設值
  const value = {
    theme,
    setTheme,
    resolvedTheme: mounted ? resolvedTheme : "light",
  };
  // mounted 尚未 true 時，不渲染 children，避免 hydration mismatch 與 context undefined
  if (!mounted) {
    return null;
  }
  // 確保在 SSR 期間也能提供有效的 context
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
