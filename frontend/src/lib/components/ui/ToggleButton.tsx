"use client";

interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onClick,
  children,
  title,
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors
        focus:outline-none
        ${
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
            : "bg-card text-card-foreground border border-input hover:bg-secondary cursor-pointer"
        }
      `}
    >
      {children}
    </button>
  );
};
