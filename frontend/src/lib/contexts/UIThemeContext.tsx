"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { analytics } from "@/lib/utils/analytics";

type UITheme = "light" | "dark" | "system";

interface UIThemeContextType {
  uiTheme: UITheme;
  resolvedUITheme: "light" | "dark";
  setUITheme: (theme: UITheme) => void;
  toggleUITheme: () => void;
}

const UIThemeContext = createContext<UIThemeContextType | undefined>(undefined);

export function UIThemeProvider({ children }: { children: React.ReactNode }) {
  const [uiTheme, setUITheme] = useState<UITheme>("system");
  const [resolvedUITheme, setResolvedUITheme] = useState<"light" | "dark">(
    "light"
  );

  // Get initial theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("uiTheme") as UITheme;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setUITheme(savedTheme);
    }
  }, []);

  // Update resolved theme based on current theme
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (uiTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setResolvedUITheme(systemTheme);
      } else {
        setResolvedUITheme(uiTheme);
      }
    };

    updateResolvedTheme();

    if (uiTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateResolvedTheme);
      return () =>
        mediaQuery.removeEventListener("change", updateResolvedTheme);
    }
  }, [uiTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedUITheme);
  }, [resolvedUITheme]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem("uiTheme", uiTheme);
  }, [uiTheme]);

  const handleSetUITheme = useCallback((newTheme: UITheme) => {
    setUITheme(newTheme);
    // Track theme change in analytics (only track resolved themes)
    if (newTheme !== "system") {
      analytics.trackThemeChange(newTheme);
    }
  }, []);

  const toggleUITheme = useCallback(() => {
    const newTheme = resolvedUITheme === "light" ? "dark" : "light";
    handleSetUITheme(newTheme);
  }, [resolvedUITheme, handleSetUITheme]);

  return (
    <UIThemeContext.Provider
      value={{
        uiTheme,
        resolvedUITheme,
        setUITheme: handleSetUITheme,
        toggleUITheme,
      }}
    >
      {children}
    </UIThemeContext.Provider>
  );
}

export function useUITheme() {
  const context = useContext(UIThemeContext);
  if (context === undefined) {
    throw new Error("useUITheme must be used within a UIThemeProvider");
  }
  return context;
}
