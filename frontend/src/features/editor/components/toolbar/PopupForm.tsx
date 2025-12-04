"use client";

import React, { useState, useRef } from "react";

// Constants
const INPUT_CLASSES =
  "w-full px-3 py-2.5 sm:px-2 sm:py-1.5 text-base sm:text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

export interface PopupFormField {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoFocus?: boolean;
  type?: "text" | "number" | "action" | "file";
  min?: number;
  max?: number;
  actionLabel?: string;
  onActionClick?: () => void;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  selectedFile?: File | null;
  hidden?: boolean;
  onClear?: () => void;
}

interface PopupFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  fields: Array<PopupFormField>;
  submitLabel?: string;
  isSubmitDisabled?: boolean;
  hidden?: boolean; // Hide submit/cancel buttons
}

export const PopupForm: React.FC<PopupFormProps> = ({
  onSubmit,
  onCancel,
  fields,
  submitLabel = "Insert",
  isSubmitDisabled = false,
  hidden = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
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

    const fileField = fields.find((f) => f.type === "file");
    if (fileField && fileField.onFileChange) {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        // Check if it's an image
        if (file.type.startsWith("image/")) {
          fileField.onFileChange(file);
        }
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {fields.map((field, index) => {
        // Skip hidden fields
        if (field.hidden) return null;

        // Handle divider (action with empty label and no click handler)
        if (
          field.type === "action" &&
          !field.onActionClick &&
          field.actionLabel === "or"
        ) {
          return (
            <div key={index} className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
          );
        }

        return (
          <div key={index}>
            {field.type === "action" && field.onActionClick ? (
              <button
                type="button"
                onClick={field.onActionClick}
                className="w-full px-3 py-1.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors touch-manipulation text-center"
              >
                {field.actionLabel || field.label}
              </button>
            ) : field.type === "file" ? (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-xs font-medium text-foreground">
                    {field.label}
                  </label>
                  {field.selectedFile && field.onClear && (
                    <button
                      type="button"
                      onClick={field.onClear}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : field.selectedFile
                      ? "border-primary/50 bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={field.accept || "image/*"}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (field.onFileChange) {
                        field.onFileChange(file);
                      }
                    }}
                    className="hidden"
                    autoFocus={field.autoFocus}
                  />
                  {field.selectedFile ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        {field.selectedFile.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-primary hover:underline"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Drag and drop an image here, or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:underline"
                        >
                          click to browse
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-xs font-medium text-foreground">
                    {field.label}
                  </label>
                  {field.value.trim() && field.onClear && (
                    <button
                      type="button"
                      onClick={field.onClear}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  className={INPUT_CLASSES}
                  autoFocus={field.autoFocus}
                  min={field.min}
                  max={field.max}
                />
              </>
            )}
          </div>
        );
      })}
      {!hidden && (
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm sm:text-xs text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-4 py-2 text-sm sm:text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
};
