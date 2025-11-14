"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/lib/components/ui/Modal";

interface NewFileConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const NewFileConfirmationModal: React.FC<
  NewFileConfirmationModalProps
> = ({ isOpen, onClose, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          New File
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Create a new markdown file
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
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-sm font-semibold">
                  !
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Current Content Will Be Lost
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Creating a new file will clear all current content. Make sure
                you have saved your work before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Information */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  i
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Presentation Settings
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The new content will work based on your current presentation
                settings. To change settings, use the Presentation Settings
                panel.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Create New File
          </button>
        </div>
      </div>
    </Modal>
  );
};
