"use client";

import { useEffect, useRef } from "react";
import { Mostage } from "mostage";
import { PresentationConfig } from "@/features/presentation/types/presentation.types";

interface ViewPresentationClientProps {
  markdown: string;
  config: Record<string, unknown>;
  presentationName?: string; // Optional, may be used in future
}

/**
 * Client Component for rendering Mostage presentation
 * This component handles the client-side initialization of Mostage
 */
export function ViewPresentationClient({
  markdown,
  config,
}: ViewPresentationClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mostageRef = useRef<Mostage | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Helper function to get display content (same as ContentPreview)
    const getDisplayContent = (content: string) => {
      return (
        content.trim() ||
        `## No content

<br/>

#### This presentation is empty.
`
      );
    };

    // Get display content (handle empty markdown)
    const displayContent = getDisplayContent(markdown);

    // Cast config to PresentationConfig type
    const presentationConfig = config as unknown as PresentationConfig;

    // Cleanup previous instance
    if (mostageRef.current) {
      mostageRef.current.destroy();
      mostageRef.current = null;
    }

    // Create new Mostage instance (same as ContentPreview)
    mostageRef.current = new Mostage({
      element: containerRef.current,
      content: displayContent,
      theme: presentationConfig?.theme || "dark",
      scale: presentationConfig?.scale || 1.0,
      loop: presentationConfig?.loop || false,
      keyboard: presentationConfig?.keyboard ?? true,
      touch: presentationConfig?.touch ?? true,
      urlHash: presentationConfig?.urlHash ?? true,
      transition: presentationConfig?.transition || {
        type: "horizontal",
        duration: 300,
        easing: "ease-in-out",
      },
      centerContent: presentationConfig?.centerContent || {
        vertical: true,
        horizontal: true,
      },
      header: presentationConfig?.header,
      footer: presentationConfig?.footer,
      plugins: presentationConfig?.plugins,
      background: presentationConfig?.background,
    });

    // Start the presentation
    mostageRef.current.start().catch((err) => {
      console.error("Error starting Mostage presentation:", err);
    });

    // Cleanup on unmount
    return () => {
      if (mostageRef.current) {
        mostageRef.current.destroy();
        mostageRef.current = null;
      }
    };
  }, [markdown, config]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
