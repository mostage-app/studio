"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  headerContent?: React.ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  maxWidth = "2xl",
  showCloseButton = true,
  closeOnBackdropClick = true,
  headerContent,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent keyboard events from reaching Mostage when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always stop propagation to prevent Mostage from handling keyboard events
      // This prevents the error when Mostage tries to call toLowerCase() on undefined
      e.stopPropagation();
      // Don't preventDefault to allow inputs inside modal to work normally
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Always stop propagation to prevent Mostage from handling keyboard events
      e.stopPropagation();
      // Don't preventDefault to allow inputs inside modal to work normally
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      // Also stop keypress events
      e.stopPropagation();
    };

    // Add event listeners with capture phase to catch events before they reach Mostage
    // Use capture phase (true) to intercept events before Mostage can handle them
    // Use both document and window to ensure we catch all events
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);
    document.addEventListener("keypress", handleKeyPress, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("keypress", handleKeyPress, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
      document.removeEventListener("keypress", handleKeyPress, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("keypress", handleKeyPress, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-[9998]"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-y-auto ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || headerContent) && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              {headerContent ? (
                headerContent
              ) : (
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
