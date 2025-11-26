"use client";

import { EditorLayout } from "@/lib/components/layout/EditorLayout";
import { Loading } from "@/lib/components/ui";
import { useAppLoading } from "@/lib/hooks/useAppLoading";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { PresentationConfig } from "@/features/presentation/types/presentation.types";

export default function Home() {
  const isAppLoaded = useAppLoading();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();

  const [markdown, setMarkdown] = useState("");
  const [config, setConfig] = useState<PresentationConfig | null>(null);
  const [editingSlide, setEditingSlide] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect authenticated users to their profile
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.username) {
      router.replace(`/${user.username}`);
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Load sample content on mount (only for non-authenticated users)
  useEffect(() => {
    if (authLoading || isAuthenticated) return;

    const loadSample = async () => {
      try {
        const [contentRes, configRes] = await Promise.all([
          fetch("/samples/basic/content.md"),
          fetch("/samples/basic/config.json"),
        ]);

        const content = await contentRes.text();
        const configData = await configRes.json();

        setMarkdown(content);
        setConfig(configData);
      } catch (error) {
        console.error("Failed to load sample:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSample();
  }, [authLoading, isAuthenticated]);

  const updateMarkdown = useCallback(
    (newMarkdown: string, resetSlide = false) => {
      setMarkdown(newMarkdown);
      if (resetSlide) {
        setEditingSlide(1);
      }
    },
    []
  );

  const updateEditingSlide = useCallback((slideNumber: number) => {
    setEditingSlide(slideNumber);
  }, []);

  // Show loading while checking auth or redirecting
  if (!isAppLoaded || authLoading || isAuthenticated || isLoading || !config) {
    return <Loading />;
  }

  return (
    <EditorLayout
      markdown={markdown}
      onChange={updateMarkdown}
      showEditor={true}
      showPreview={true}
      editingSlide={editingSlide}
      updateEditingSlide={updateEditingSlide}
      presentation={{
        presentationId: "",
        name: "Basic Example",
        slug: "example",
        config: config as unknown as Record<string, unknown>,
        isPublic: true,
      }}
    />
  );
}
