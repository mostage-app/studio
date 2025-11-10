"use client";

import { useUITheme } from "@/lib/contexts/UIThemeContext";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function UIThemeToggle() {
  const { resolvedUITheme, setUITheme, toggleUITheme } = useUITheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLightTheme = () => {
    setUITheme("light");
  };

  const handleDarkTheme = () => {
    setUITheme("dark");
  };

  // Mobile: Single toggle button
  if (isMobile) {
    return (
      <button
        onClick={toggleUITheme}
        className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted border border-input rounded-md bg-background transition-all duration-200 focus:outline-none"
        title={`Switch to ${
          resolvedUITheme === "light" ? "dark" : "light"
        } mode`}
      >
        {resolvedUITheme === "light" ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Desktop: Two separate buttons
  return (
    <div className="flex items-center border border-input rounded-md bg-background overflow-hidden">
      <button
        onClick={handleLightTheme}
        className={`flex items-center justify-center w-8 h-8 transition-all duration-200 focus:outline-none ${
          resolvedUITheme === "light"
            ? "text-foreground bg-accent"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <div className="w-px h-8 bg-border" />
      <button
        onClick={handleDarkTheme}
        className={`flex items-center justify-center w-8 h-8 transition-all duration-200 focus:outline-none ${
          resolvedUITheme === "dark"
            ? "text-foreground bg-accent"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
