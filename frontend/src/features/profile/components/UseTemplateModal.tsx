"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/lib/components/ui/Modal";
import { FileSymlink, Loader2 } from "lucide-react";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import {
  createPresentation,
  getPresentation,
  type CreatePresentationRequest,
  type Presentation,
} from "@/features/presentation/services/presentationService";
import { PresentationFormFields } from "@/features/presentation/components/PresentationFormFields";
import { generateSlug } from "@/features/presentation/utils/slugUtils";

interface UseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Presentation | null;
}

export const UseTemplateModal: React.FC<UseTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [error, setError] = useState("");
  const [templateData, setTemplateData] = useState<Presentation | null>(null);

  // Load template data when modal opens
  useEffect(() => {
    if (isOpen && template) {
      setIsLoadingTemplate(true);
      getPresentation(template.username, template.slug)
        .then((data) => {
          setTemplateData(data);
          // Set default name based on template
          const defaultName = `${template.name} (Copy)`;
          setName(defaultName);
          setSlug(generateSlug(defaultName));
        })
        .catch((err) => {
          console.error("Error loading template:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load template data"
          );
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    } else if (!isOpen) {
      // Reset state when modal closes
      setName("");
      setSlug("");
      setIsPublic(false);
      setError("");
      setTemplateData(null);
    }
  }, [isOpen, template]);

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

    if (!templateData) {
      setError("Template data is not loaded");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const data: CreatePresentationRequest = {
        name: name.trim(),
        slug: slug.trim(),
        markdown: templateData.markdown,
        config: templateData.config,
        isPublic,
      };

      await createPresentation(user.username, data);

      // Navigate to the new presentation
      router.push(`/${user.username}/${slug}`);
      onClose();
    } catch (err) {
      console.error("Error creating presentation from template:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create presentation from template"
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
    templateData,
    router,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    if (!isCreating && !isLoadingTemplate) {
      setName("");
      setSlug("");
      setIsPublic(false);
      setError("");
      onClose();
    }
  }, [isCreating, isLoadingTemplate, onClose]);

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <FileSymlink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Create from Template
      </h2>
    </div>
  );

  if (!template) {
    return null;
  }

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

        {isLoadingTemplate ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading template...
            </span>
          </div>
        ) : (
          <>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Creating a new presentation based on template:{" "}
                <span className="font-semibold">{template.name}</span>
              </p>
            </div>

            <PresentationFormFields
              name={name}
              slug={slug}
              isPublic={isPublic}
              username={user?.username}
              disabled={isCreating}
              onNameChange={handleNameChange}
              onSlugChange={handleSlugChange}
              onPrivacyChange={setIsPublic}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating || isLoadingTemplate}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={
                  isCreating ||
                  isLoadingTemplate ||
                  !name.trim() ||
                  !slug.trim() ||
                  !templateData
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FileSymlink className="w-4 h-4" />
                    <span>Create from Template</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
