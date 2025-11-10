"use client";

import { PanelLeft, Columns3, PanelRight, Square } from "lucide-react";
import React from "react";

// Layout mode types
export type LayoutMode = 0 | 1 | 2 | 3;

export interface LayoutModeConfig {
  mode: LayoutMode;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  editorOpen: boolean;
  settingsOpen: boolean;
}

export const LAYOUT_MODES: LayoutModeConfig[] = [
  {
    mode: 0,
    icon: PanelLeft,
    title: "Editor + Preview",
    editorOpen: true,
    settingsOpen: false,
  },
  {
    mode: 1,
    icon: Square,
    title: "Preview only",
    editorOpen: false,
    settingsOpen: false,
  },
  {
    mode: 2,
    icon: Columns3,
    title: "All panels",
    editorOpen: true,
    settingsOpen: true,
  },
  {
    mode: 3,
    icon: PanelRight,
    title: "Preview + Settings",
    editorOpen: false,
    settingsOpen: true,
  },
];

export interface LayoutModeConfig {
  mode: LayoutMode;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  editorOpen: boolean;
  settingsOpen: boolean;
}

interface LayoutModeToggleProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  isMobile?: boolean;
}

export function LayoutModeToggle({
  layoutMode,
  onLayoutModeChange,
  isMobile = false,
}: LayoutModeToggleProps) {
  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div className="flex items-center border border-input rounded-md bg-background overflow-hidden">
      {LAYOUT_MODES.map((config, index) => {
        const Icon = config.icon;
        const isActive = layoutMode === config.mode;
        return (
          <React.Fragment key={config.mode}>
            {index > 0 && <div className="w-px h-8 bg-border" />}
            <button
              onClick={() => onLayoutModeChange(config.mode)}
              className={`flex items-center justify-center w-8 h-8 transition-all duration-200 focus:outline-none ${
                isActive
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={config.title}
            >
              <Icon className="w-4 h-4" />
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
