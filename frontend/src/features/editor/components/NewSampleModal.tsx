"use client";

import React from "react";
import { Modal } from "@/lib/components/ui/Modal";
import { FileText, AlertTriangle, FilePlus, Plus } from "lucide-react";

interface NewSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNew: () => void;
  onSample: () => void;
  hasExistingContent?: boolean;
}

const PRESENTATION_OPTIONS = [
  {
    id: "new",
    name: "New Presentation",
    description:
      "Start with a blank presentation and create your content from scratch or using AI assistance",
    icon: FilePlus,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "sample",
    name: "Load Sample",
    description: "Start with a sample presentation to see how it works",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
];

export const NewSampleModal: React.FC<NewSampleModalProps> = ({
  isOpen,
  onClose,
  onNew,
  onSample,
  hasExistingContent = false,
}) => {
  const handleOptionClick = (optionId: string) => {
    if (optionId === "new") {
      onNew();
    } else if (optionId === "sample") {
      onSample();
    }
    onClose();
  };

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Start New Presentation
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
      <div className="space-y-4 sm:space-y-6">
        {/* Warning Message */}
        {hasExistingContent && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Warning
                </h4>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                  Your current content and settings will be lost when starting a
                  new presentation.
                  <br />
                  You can save it using the Export feature before proceeding.
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs sm:text-sm text-muted-foreground">
          Click on the option you want to use to start your presentation
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {PRESENTATION_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="group p-4 sm:p-6 rounded-md border border-input hover:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 cursor-pointer"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`
                      p-2 sm:p-3 rounded-md ${option.bgColor}
                    `}
                  >
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${option.color}`} />
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      {option.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
