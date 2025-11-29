"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Loader2, Settings } from "lucide-react";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { Modal } from "@/lib/components/ui/Modal";
import { PresentationFormFields } from "./PresentationFormFields";
import { generateSlug } from "../utils/slugUtils";

interface EditPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentationName: string;
  slug: string;
  isPublic: boolean;
  username: string;
  onSave: (data: {
    name: string;
    slug: string;
    isPublic: boolean;
  }) => Promise<void>;
}

/**
 * Reusable modal component for editing presentation metadata
 * (name, slug, privacy)
 */
export const EditPresentationModal: React.FC<EditPresentationModalProps> = ({
  isOpen,
  onClose,
  presentationName,
  slug,
  isPublic,
  username,
  onSave,
}) => {
  const [editedName, setEditedName] = useState(presentationName);
  const [editedSlug, setEditedSlug] = useState(slug);
  const [editedIsPublic, setEditedIsPublic] = useState(isPublic);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Update state when props change
  useEffect(() => {
    if (isOpen) {
      setEditedName(presentationName);
      setEditedSlug(slug);
      setEditedIsPublic(isPublic);
      setError("");
    }
  }, [isOpen, presentationName, slug, isPublic]);

  const handleNameChange = useCallback((value: string) => {
    setEditedName(value);
    setEditedSlug(generateSlug(value));
    setError("");
  }, []);

  const handleSlugChange = useCallback((value: string) => {
    setEditedSlug(generateSlug(value));
    setError("");
  }, []);

  const handleSave = useCallback(async () => {
    if (!editedName.trim()) {
      setError("Name is required");
      return;
    }
    if (!editedSlug.trim()) {
      setError("Slug is required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onSave({
        name: editedName.trim(),
        slug: editedSlug.trim(),
        isPublic: editedIsPublic,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [editedName, editedSlug, editedIsPublic, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
      setError("");
    }
  }, [isSaving, onClose]);

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Edit Presentation Info
      </h2>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      headerContent={headerContent}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <PresentationFormFields
          name={editedName}
          slug={editedSlug}
          isPublic={editedIsPublic}
          username={username}
          disabled={isSaving}
          onNameChange={handleNameChange}
          onSlugChange={handleSlugChange}
          onPrivacyChange={setEditedIsPublic}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !editedName.trim() || !editedSlug.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
