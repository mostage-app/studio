"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/lib/components/ui/Modal";
import { Plus, Loader2 } from "lucide-react";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import {
  createPresentation,
  type CreatePresentationRequest,
} from "@/features/presentation/services/presentationService";
import { DEFAULT_PRESENTATION_CONFIG } from "@/features/presentation/hooks/usePresentation";
import { PresentationFormFields } from "@/features/presentation/components/PresentationFormFields";
import { generateSlug } from "@/features/presentation/utils/slugUtils";

interface NewPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPresentationModal: React.FC<NewPresentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setSlug(generateSlug(value));
    setError("");
  }, []);

  const handleSlugChange = useCallback((value: string) => {
    setSlug(generateSlug(value));
    setError("");
  }, []);

  const handleCreate = useCallback(async () => {
    if (!isAuthenticated || !user?.username) {
      setError("Please sign in to create a presentation");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const data: CreatePresentationRequest = {
        name: name.trim(),
        slug: slug.trim(),
        markdown: "",
        config: DEFAULT_PRESENTATION_CONFIG as unknown as Record<
          string,
          unknown
        >,
        isPublic,
        isTemplate,
      };

      await createPresentation(user.username, data);

      // Navigate to the new presentation
      router.push(`/${user.username}/${slug}`);
      onClose();

      // Reset form
      setName("");
      setSlug("");
      setIsPublic(false);
      setIsTemplate(false);
    } catch (err) {
      console.error("Error creating presentation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create presentation"
      );
    } finally {
      setIsCreating(false);
    }
  }, [
    isAuthenticated,
    user,
    name,
    slug,
    isPublic,
    isTemplate,
    router,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      setName("");
      setSlug("");
      setIsPublic(false);
      setIsTemplate(false);
      setError("");
      onClose();
    }
  }, [isCreating, onClose]);

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <Plus className="w-5 h-5 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        New Presentation
      </h2>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      headerContent={headerContent}
      maxWidth="lg"
      className="bg-background border border-input"
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <PresentationFormFields
          name={name}
          slug={slug}
          isPublic={isPublic}
          isTemplate={isTemplate}
          username={user?.username}
          disabled={isCreating}
          onNameChange={handleNameChange}
          onSlugChange={handleSlugChange}
          onPrivacyChange={setIsPublic}
          onTemplateChange={setIsTemplate}
          showTemplateOption={true}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !name.trim() || !slug.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
