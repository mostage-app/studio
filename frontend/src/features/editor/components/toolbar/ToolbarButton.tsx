"use client";

import React from "react";

// Constants
const BUTTON_BASE_CLASSES =
  "flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors";

const BUTTON_DISABLED_CLASSES =
  "flex items-center justify-center w-8 h-8 text-muted-foreground/50 dark:text-muted-foreground/40 hover:text-muted-foreground/70 dark:hover:text-muted-foreground/60 hover:bg-secondary/50 rounded transition-colors opacity-60";

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean; // For premium features that require authentication
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  title,
  icon,
  className,
  disabled = false,
}) => {
  const finalClassName =
    className || (disabled ? BUTTON_DISABLED_CLASSES : BUTTON_BASE_CLASSES);

  return (
    <button onClick={onClick} className={finalClassName} title={title}>
      {icon}
    </button>
  );
};
