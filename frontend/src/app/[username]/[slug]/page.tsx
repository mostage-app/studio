"use client";

import { EditorLayout } from "@/lib/components/layout/EditorLayout";
import { Loading } from "@/lib/components/ui";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Mostage } from "mostage";
import { Home } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import {
  getPresentation,
  updatePresentation,
  type Presentation,
} from "@/features/presentation/services/presentationService";

export default function PresentationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = params?.username as string;
  const slug = params?.slug as string;
  const mode = searchParams?.get("mode");

  const { user, isAuthenticated } = useAuthContext();
  const isOwner = isAuthenticated && user?.username === username;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [markdown, setMarkdown] = useState("");
  const [editingSlide, setEditingSlide] = useState(1);

  // View mode refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mostageRef = useRef<Mostage | null>(null);

  useEffect(() => {
    const fetchPresentation = async () => {
      if (!username || !slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getPresentation(username, slug);
        setPresentation(data);
        setMarkdown(data.markdown);
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

  // Initialize Mostage for view mode
  useEffect(() => {
    if (mode !== "view" || !presentation || !containerRef.current) return;

    if (mostageRef.current) {
      mostageRef.current.destroy();
      mostageRef.current = null;
    }

    mostageRef.current = new Mostage({
      container: containerRef.current,
      markdown: presentation.markdown,
      config: presentation.config,
    });

    return () => {
      if (mostageRef.current) {
        mostageRef.current.destroy();
        mostageRef.current = null;
      }
    };
  }, [presentation, mode]);

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

  if (isLoading) {
    return <Loading />;
  }

  if (error || !presentation) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl w-full text-center">
          <div className="text-8xl font-bold text-primary mb-4">404</div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8">
            {error || "This presentation does not exist or is private."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${username}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
            >
              View {username}&apos;s presentations
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // View-only mode
  if (mode === "view" || !isOwner) {
    return (
      <div className="h-full bg-background">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }

  // Edit mode
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
    />
  );
}
