"use client";

import React, { useState, useEffect } from "react";
import { ImagePlusIcon } from "lucide-react";
import {
  uploadImage,
  createImagePreview,
  validateImageFile,
} from "../services/imageUploadService";
import { PopupForm } from "./toolbar/PopupForm";

export interface ImagePickerProps {
  value: string; // Current image URL
  onChange: (url: string) => void; // Callback when image URL changes
  onUnsplashClick?: () => void; // Callback for Unsplash button
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * Reusable Image Picker Component
 * Supports upload, URL input, and Unsplash search
 */
export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  onUnsplashClick,
  placeholder = "https://example.com/image.jpg",
  label = "Image URL",
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(value);

  // Sync with external value
  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const handleFileSelect = async (file: File | null) => {
    setUploadError(null);
    setSelectedFile(file);
    setImageUrl(""); // Clear URL when file is selected

    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file");
        setSelectedFile(null);
        return;
      }

      // Create preview
      try {
        const preview = await createImagePreview(file);
        setImagePreview(preview);
      } catch {
        setUploadError("Failed to create preview");
      }
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const uploadedUrl = await uploadImage(selectedFile, (progress) => {
        setUploadProgress(progress.percentage);
      });

      // Update parent with uploaded URL
      onChange(uploadedUrl);
      setImageUrl(uploadedUrl);
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.trim()) {
      setSelectedFile(null);
      setImagePreview(null);
      setUploadError(null);
      onChange(url);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Image - hidden when URL is entered */}
      {!imageUrl.trim() && (
        <div>
          <PopupForm
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onCancel={() => {}}
            fields={[
              {
                label: "Upload Image",
                value: "",
                onChange: () => {},
                placeholder: "",
                type: "file" as const,
                accept: "image/*",
                onFileChange: handleFileSelect,
                selectedFile: selectedFile,
                onClear: () => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  setUploadError(null);
                },
              },
            ]}
            isSubmitDisabled={true}
            submitLabel=""
            hidden={true}
          />
        </div>
      )}

      {/* Divider - only show when no file selected and no URL entered */}
      {!selectedFile && !imageUrl.trim() && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>
      )}

      {/* Enter Image URL - hidden when file is selected, shown after upload */}
      {!selectedFile && (
        <div>
          <label className="block text-xs sm:text-xs font-medium text-foreground mb-1.5">
            {label}
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-3 py-2.5 sm:px-2 sm:py-1.5 text-base sm:text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Divider - only show when Unsplash available, no file selected, and no URL entered */}
      {onUnsplashClick && !selectedFile && !imageUrl.trim() && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>
      )}

      {/* Search Images from Unsplash - hidden when URL is entered */}
      {onUnsplashClick && !selectedFile && !imageUrl.trim() && (
        <div>
          <button
            type="button"
            onClick={onUnsplashClick}
            disabled={disabled}
            className="w-full px-4 py-3 text-sm font-medium text-left border-2 border-input rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImagePlusIcon className="w-4 h-4" />
            <span>Search Images from Unsplash</span>
          </button>
        </div>
      )}

      {/* Image Preview */}
      {(imagePreview || imageUrl.trim()) && (
        <div className="space-y-2">
          <div className="relative rounded-lg border border-input overflow-hidden bg-muted">
            <img
              src={imagePreview || imageUrl}
              alt="Preview"
              className="w-full max-h-48 object-contain"
              onError={(e) => {
                // Hide broken image preview
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          {imagePreview && (
            <p className="text-xs text-muted-foreground text-center">Preview</p>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">
            {uploadError}
          </p>
        </div>
      )}

      {/* Upload button - shown when file is selected */}
      {selectedFile && !uploading && (
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={disabled}
          className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Upload Image
        </button>
      )}
    </div>
  );
};
