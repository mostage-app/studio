"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileJson,
  FileCode,
  FileType,
  AlertCircle,
} from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { analytics } from "@/shared/utils/analytics";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  onImportMultiple?: (files: File[]) => void;
}

const SUPPORTED_FORMATS = [
  {
    id: "mostage",
    name: "Mostage Presentation",
    extensions: [".mostage.json", ".json"],
    description: "Complete presentation with settings and configuration",
    icon: FileCode,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    isSpecial: true,
  },
  {
    id: "markdown",
    name: "Markdown",
    extensions: [".md", ".markdown"],
    description: "content as markdown",
    icon: FileType,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    id: "json",
    name: "Json",
    extensions: [".json"],
    description: "Config file for Mostage",
    icon: FileJson,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
];

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onImportMultiple,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    // Check file type
    const extension = file.name.toLowerCase().split(".").pop();
    const isSupported = SUPPORTED_FORMATS.some((format) =>
      format.extensions.some((ext) => ext.slice(1) === extension)
    );

    if (!isSupported) {
      setError(
        "Unsupported file format. Please use Mostage, Markdown, PDF, or Text files."
      );
      return;
    }

    // Track import event
    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || "unknown";
    analytics.trackImport(fileExtension);
    onImport(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length === 1) {
        handleFile(files[0]);
      } else {
        handleMultipleFiles(Array.from(files));
      }
    }
  };

  const handleMultipleFiles = (files: File[]) => {
    setError(null);

    // Validate all files
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      const extension = file.name.toLowerCase().split(".").pop();
      const isSupported = SUPPORTED_FORMATS.some((format) =>
        format.extensions.some((ext) => ext.slice(1) === extension)
      );

      if (!isSupported) {
        setError(
          "Unsupported file format. Please use Mostage, Markdown, PDF, or Text files."
        );
        return;
      }
    }

    if (onImportMultiple) {
      onImportMultiple(files);
    } else {
      // Fallback to single file import
      handleFile(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
        <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Upload Presentation
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
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-md p-4 sm:p-8 text-center transition-colors
          ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-input hover:border-blue-300 hover:bg-muted/50"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-muted rounded-full">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
              Drop your file here
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              or click to browse files
            </p>
            <button
              onClick={openFileDialog}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Choose File
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".mostage.json,.json,.md,.markdown,.pdf,.txt"
          onChange={handleFileInput}
          multiple
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs sm:text-sm text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Supported Formats */}
      <div className="mt-4 sm:mt-6">
        <h4 className="text-sm sm:text-base font-medium text-foreground mb-2 sm:mb-3">
          Supported Formats
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {SUPPORTED_FORMATS.map((format) => {
            const Icon = format.icon;
            return (
              <div
                key={format.id}
                className={`
                  flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md border border-input bg-muted/30
                  ${format.isSpecial ? "sm:col-span-2" : ""}
                `}
              >
                <div className={`p-1.5 sm:p-2 rounded-md ${format.bgColor}`}>
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${format.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-xs sm:text-sm text-foreground">
                      {format.name}
                    </div>
                    {format.isSpecial && (
                      <span className="px-1.5 sm:px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
