"use client";

import React from "react";

// Constants
const BUTTON_BASE_CLASSES =
  "flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors";

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  title,
  icon,
  className = BUTTON_BASE_CLASSES,
}) => (
  <button onClick={onClick} className={className} title={title}>
    {icon}
  </button>
);
