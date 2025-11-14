"use client";

import React from "react";
import { Download, FileText, ExternalLink } from "lucide-react";
import { Modal } from "@/lib/components/ui/Modal";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onOpenExportModal: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  onOpenExportModal,
}) => {
  const handleExportClick = () => {
    onClose(); // Close save modal first
    onOpenExportModal(); // Open export modal
  };

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Save Content
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Download your markdown content
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={headerContent}
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning Message */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold">
                  !
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Markdown Content Only
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This download contains only the markdown content. Configuration
                and presentation settings are not included.
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="space-y-3">
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Download Markdown File
          </button>

          {/* Export Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              For complete presentation export with configuration and styling:
            </p>
            <button
              onClick={handleExportClick}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Use Export Feature
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
