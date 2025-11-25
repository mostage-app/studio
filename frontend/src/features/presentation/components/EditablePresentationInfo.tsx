"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Pencil, Loader2, Edit } from "lucide-react";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { Modal } from "@/lib/components/ui/Modal";
import { PresentationFormFields } from "./PresentationFormFields";
import { generateSlug } from "../utils/slugUtils";

interface EditablePresentationInfoProps {
  presentationName?: string;
  slug?: string;
  isPublic?: boolean;
  onOpenAuthModal?: () => void;
  onSave?: (data: {
    name: string;
    slug: string;
    isPublic: boolean;
  }) => Promise<void>;
}

export const EditablePresentationInfo: React.FC<
  EditablePresentationInfoProps
> = ({
  presentationName = "Untitled",
  slug = "untitled",
  isPublic = false,
  onOpenAuthModal,
  onSave,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedName, setEditedName] = useState(presentationName);
  const [editedSlug, setEditedSlug] = useState(slug);
  const [editedIsPublic, setEditedIsPublic] = useState(isPublic);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const username =
    mounted && isAuthenticated && user?.username ? user.username : "[username]";

  const handleClick = useCallback(() => {
    if (!isAuthenticated && onOpenAuthModal) {
      onOpenAuthModal();
      return;
    }
    setEditedName(presentationName);
    setEditedSlug(slug);
    setEditedIsPublic(isPublic);
    setError("");
    setShowEditModal(true);
  }, [isAuthenticated, onOpenAuthModal, presentationName, slug, isPublic]);

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
      if (onSave) {
        await onSave({
          name: editedName.trim(),
          slug: editedSlug.trim(),
          isPublic: editedIsPublic,
        });
      }
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [editedName, editedSlug, editedIsPublic, onSave]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      setShowEditModal(false);
      setError("");
    }
  }, [isSaving]);

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Edit Presentation
      </h2>
    </div>
  );

  return (
    <>
      {/* Display - Single line */}
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-2 py-1 bg-background border border-input rounded-md cursor-pointer hover:bg-secondary transition-colors group"
        data-tour-target="presentation-url"
      >
        <span className="text-xs font-medium text-foreground truncate max-w-[500px]">
          {presentationName}
        </span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[500px]">
          https://studio.mostage.app/{username}/{slug}
        </span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="text-[10px] text-muted-foreground font-bold">
          {isPublic ? "Public" : "Private"}
        </span>
        <Pencil className="w-3 h-3 text-muted-foreground transition-opacity flex-shrink-0" />
      </button>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
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
    </>
  );
};
