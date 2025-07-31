"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  systemTheme: "light" | "dark";
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
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // 獲取系統主題
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // 初始化
  useEffect(() => {
    setMounted(true);

    // 從 localStorage 載入主題設定
    const savedTheme = localStorage.getItem("watchedit_theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // 初始化系統主題
    setSystemTheme(getSystemTheme());
  }, []);

  // 監聽系統主題變化
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);

      // 如果當前主題是 auto，立即更新 resolvedTheme
      if (theme === "auto") {
        setResolvedTheme(newSystemTheme);
      }
    };

    // 添加監聽器
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  // 處理主題變化
  useEffect(() => {
    if (!mounted) return;

    // 儲存主題設定到 localStorage
    localStorage.setItem("watchedit_theme", theme);

    // 計算實際應用的主題
    let actualTheme: "light" | "dark";

    if (theme === "auto") {
      actualTheme = systemTheme;
    } else {
      actualTheme = theme;
    }

    setResolvedTheme(actualTheme);

    // 應用主題到 document
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(actualTheme);

    // 更新 meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        actualTheme === "dark" ? "#1f2937" : "#3b82f6"
      );
    }
  }, [theme, systemTheme, mounted]);

  // 在客戶端渲染之前，提供預設值
  const value = {
    theme,
    setTheme,
    resolvedTheme: mounted ? resolvedTheme : "light",
    systemTheme: mounted ? systemTheme : "light",
  };

  // mounted 尚未 true 時，不渲染 children，避免 hydration mismatch
  if (!mounted) {
    return null;
  }

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
