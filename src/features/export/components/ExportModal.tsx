"use client";

import React, { useState } from "react";
import {
  Download,
  FileText,
  FileImage,
  FileCode,
  X,
  Settings,
  File,
} from "lucide-react";

import { ExportModalProps, ExportFormat } from "../types/export.types";
import { Modal } from "@/shared/components/ui/Modal";
import { analytics } from "@/shared/utils/analytics";

const EXPORT_FORMATS = [
  {
    id: "html",
    name: "HTML",
    description: "Standalone HTML file ready to run",
    icon: FileCode,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    isRecommended: true,
  },
  {
    id: "pdf",
    name: "PDF",
    description: "Export as PDF document",
    icon: FileText,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  {
    id: "pptx",
    name: "PowerPoint",
    description: "Export as PowerPoint presentation",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    id: "jpg",
    name: "Images",
    description: "Export as JPG image files",
    icon: FileImage,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    id: "config",
    name: "Export Config",
    description: "Export presentation configuration as JSON",
    icon: Settings,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    id: "content",
    name: "Export Content",
    description: "Export presentation content as Markdown",
    icon: File,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    id: "mostage",
    name: "Mostage Presentation",
    description:
      "Complete Mostage presentation with library, content and config",
    icon: FileCode,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    isSpecial: true,
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onOpenAuthModal,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(
    null
  );
  const [showAuthError, setShowAuthError] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    const requiresAuth = ["mostage", "pptx", "jpg", "html", "pdf"];

    if (requiresAuth.includes(format)) {
      setShowAuthError(true);
      return;
    }

    setIsExporting(true);
    setSelectedFormat(format);

    try {
      analytics.trackExport(format);
      await onExport(format);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setSelectedFormat(null);
    }
  };

  const handleSignInClick = () => {
    setShowAuthError(false);
    onClose(); // Close the export modal first
    onOpenAuthModal?.();
  };

  // Reset error when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowAuthError(false);
    }
  }, [isOpen]);

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Download Presentation
        </h2>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={headerContent}
      maxWidth="2xl"
      className="bg-background border border-input"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {EXPORT_FORMATS.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.id;
          const isLoading = isExporting && isSelected;

          return (
            <button
              key={format.id}
              onClick={() => handleExport(format.id as ExportFormat)}
              disabled={isExporting}
              className={`
                relative p-4 sm:p-6 rounded-md border border-input
                ${format.isSpecial ? "sm:col-span-2" : ""}
                ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:bg-primary/5"
                }
                ${
                  isExporting
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
                group
              `}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={`
                  p-2 sm:p-3 rounded-md ${format.bgColor}
                `}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${format.color}`} />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">
                      {format.name}
                    </h3>
                    {format.isRecommended && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {format.description}
                  </p>
                </div>
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm text-blue-600 font-medium">
                      Exporting...
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Authentication Error */}
      {showAuthError && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
              <X className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200 mb-1">
                Authentication Required
              </h4>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                Export requires authentication. Please{" "}
                <button
                  onClick={handleSignInClick}
                  className="underline hover:no-underline font-medium"
                >
                  sign in
                </button>{" "}
                to continue.
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
