"use client";

import React from "react";

// Constants
const INPUT_CLASSES =
  "w-full px-3 py-2.5 sm:px-2 sm:py-1.5 text-base sm:text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

export interface PopupFormField {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoFocus?: boolean;
  type?: "text" | "number";
  min?: number;
  max?: number;
}

interface PopupFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  fields: Array<PopupFormField>;
  submitLabel?: string;
  isSubmitDisabled?: boolean;
}

export const PopupForm: React.FC<PopupFormProps> = ({
  onSubmit,
  onCancel,
  fields,
  submitLabel = "Insert",
  isSubmitDisabled = false,
}) => (
  <form onSubmit={onSubmit} className="space-y-3">
    {fields.map((field, index) => (
      <div key={index}>
        <label className="block text-xs sm:text-xs font-medium text-foreground mb-1.5">
          {field.label}
        </label>
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
      </div>
    ))}
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
  </form>
);
