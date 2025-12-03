"use client";

import React from "react";
import { Globe, Lock, FileSymlink } from "lucide-react";

export interface PresentationFormFieldsProps {
  name: string;
  slug: string;
  isPublic: boolean;
  isTemplate?: boolean;
  username?: string;
  disabled?: boolean;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onPrivacyChange: (isPublic: boolean) => void;
  onTemplateChange?: (isTemplate: boolean) => void;
  namePlaceholder?: string;
  slugPlaceholder?: string;
  showUrlPreview?: boolean;
  showTemplateOption?: boolean;
}

/**
 * Reusable form fields component for presentation forms
 * Used in both Create and Edit modals
 */
export const PresentationFormFields: React.FC<PresentationFormFieldsProps> = ({
  name,
  slug,
  isPublic,
  isTemplate = false,
  username,
  disabled = false,
  onNameChange,
  onSlugChange,
  onPrivacyChange,
  onTemplateChange,
  namePlaceholder = "My Presentation",
  slugPlaceholder = "my-presentation",
  showUrlPreview = true,
  showTemplateOption = false,
}) => {
  const displayUsername = username || "username";
  const displaySlug = slug || (showUrlPreview ? "slug" : "my-presentation");

  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label
          htmlFor="presentation-name"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Name
        </label>
        <input
          id="presentation-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={namePlaceholder}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={disabled}
        />
      </div>

      {/* Slug Field */}
      <div>
        <label
          htmlFor="presentation-slug"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          URL Slug
        </label>
        <input
          id="presentation-slug"
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder={slugPlaceholder}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm mb-1.5"
          disabled={disabled}
        />
        {showUrlPreview && (
          <p className="text-xs text-muted-foreground font-mono">
            https://studio.mostage.app/{displayUsername}/{displaySlug}
          </p>
        )}
      </div>

      {/* Privacy/Visibility Field */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Visibility
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onPrivacyChange(false)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-md border transition-colors ${
              !isPublic
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background text-muted-foreground hover:bg-secondary"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Lock className="w-4 h-4" />
            <span>Private</span>
          </button>
          <button
            type="button"
            onClick={() => onPrivacyChange(true)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-md border transition-colors ${
              isPublic
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background text-muted-foreground hover:bg-secondary"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Globe className="w-4 h-4" />
            <span>Public</span>
          </button>
        </div>
      </div>

      {/* Template Option */}
      {showTemplateOption && onTemplateChange && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mark as Template
          </label>
          <div className="flex items-center gap-3 p-3 border border-input rounded-md bg-background">
            <input
              id="is-template"
              type="checkbox"
              checked={isTemplate}
              onChange={(e) => onTemplateChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-primary border-input rounded focus:ring-primary focus:ring-2"
            />
            <label
              htmlFor="is-template"
              className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
            >
              <FileSymlink className="w-4 h-4 text-muted-foreground" />
              <span>Template</span>
            </label>
            <p className="text-xs text-muted-foreground ml-auto">
              Templates can be used to create new presentations
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
