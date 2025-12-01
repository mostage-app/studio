"use client";

import { EditorLayout } from "@/lib/components/layout/EditorLayout";
import { Loading } from "@/lib/components/ui";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import {
  getPresentation,
  updatePresentation,
  type Presentation,
} from "@/features/presentation/services/presentationService";
import { PresentationConfig } from "@/features/presentation/types/presentation.types";
import { NotFoundPage } from "@/lib/components/NotFoundPage";

export default function PresentationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = params?.username as string;
  const slug = params?.slug as string;
  const mode = searchParams?.get("mode");

  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const isOwner = isAuthenticated && user?.username === username;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [markdown, setMarkdown] = useState("");
  const [editingSlide, setEditingSlide] = useState(1);
  const [originalMarkdown, setOriginalMarkdown] = useState("");
  const [originalConfig, setOriginalConfig] =
    useState<PresentationConfig | null>(null);

  useEffect(() => {
    const fetchPresentation = async () => {
      if (!username || !slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getPresentation(username, slug);
        setPresentation(data);
        setMarkdown(data.markdown);
        setOriginalMarkdown(data.markdown);
        setOriginalConfig(
          (data.config as unknown as PresentationConfig) || null
        );
      } catch (err) {
        console.error("Error fetching presentation:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load presentation"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresentation();
  }, [username, slug]);

  // Redirect to view route if mode=view or user is not owner
  // Wait for both presentation and auth to load before making decision
  useEffect(() => {
    if (isLoading || authLoading || !presentation) return;

    if (mode === "view" || !isOwner) {
      router.replace(`/${username}/${slug}/view`);
    }
  }, [
    mode,
    isOwner,
    isLoading,
    authLoading,
    presentation,
    username,
    slug,
    router,
  ]);

  const handleMarkdownChange = useCallback(
    (newMarkdown: string, resetSlide = false) => {
      setMarkdown(newMarkdown);
      if (resetSlide) setEditingSlide(1);
    },
    []
  );

  const handleEditingSlideChange = useCallback((slideNumber: number) => {
    setEditingSlide(slideNumber);
  }, []);

  const handlePresentationUpdate = useCallback(
    async (data: { name: string; slug: string; isPublic: boolean }) => {
      if (!presentation) return;

      await updatePresentation(username, slug, {
        name: data.name,
        slug: data.slug,
        isPublic: data.isPublic,
      });

      // Update local state
      setPresentation((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              slug: data.slug,
              isPublic: data.isPublic,
            }
          : null
      );

      // Redirect if slug changed
      if (data.slug !== slug) {
        router.replace(`/${username}/${data.slug}`);
      }
    },
    [presentation, username, slug, router]
  );

  // Handler for saving markdown and config
  const handleSaveContent = useCallback(
    async (newMarkdown: string, config: PresentationConfig) => {
      if (!presentation) return;

      await updatePresentation(username, slug, {
        markdown: newMarkdown,
        config: config as unknown as Record<string, unknown>,
      });

      // Update original values after successful save
      setOriginalMarkdown(newMarkdown);
      setOriginalConfig(config);
    },
    [presentation, username, slug]
  );

  // Manual save handler - receives markdown and config from EditorLayout
  const handleManualSave = useCallback(
    async (newMarkdown: string, config: PresentationConfig) => {
      if (!presentation) return;
      await handleSaveContent(newMarkdown, config);
    },
    [presentation, handleSaveContent]
  );

  // Show loading while fetching presentation or checking auth
  if (isLoading || authLoading) {
    return <Loading />;
  }

  if (error || !presentation) {
    return (
      <NotFoundPage
        title="Presentation Not Found"
        message={error || "This presentation does not exist or is private."}
        primaryAction={{
          label: "Go to Home",
          href: "/",
        }}
        secondaryAction={
          username
            ? {
                label: `View ${username}'s presentations`,
                href: `/${username}`,
              }
            : undefined
        }
      />
    );
  }

  // Redirect to view route if mode=view or user is not owner
  // Show loading while redirecting
  if (mode === "view" || !isOwner) {
    return <Loading />;
  }

  // TODO: Add additional modes in the future (e.g., mode=share for sharing options)
  // Currently supported modes: "view" (redirects to /{username}/{slug}/view), "edit" or null (edit mode)

  // Edit mode: if mode=edit or mode is not specified (default to edit)
  // Only owners can edit
  return (
    <EditorLayout
      markdown={markdown}
      onChange={handleMarkdownChange}
      showEditor={true}
      showPreview={true}
      editingSlide={editingSlide}
      updateEditingSlide={handleEditingSlideChange}
      presentation={presentation}
      onPresentationUpdate={handlePresentationUpdate}
      onManualSave={handleManualSave}
      originalMarkdown={originalMarkdown}
      originalConfig={originalConfig}
      onSaveContent={handleSaveContent}
    />
  );
}
