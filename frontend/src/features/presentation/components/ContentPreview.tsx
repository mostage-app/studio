"use client";

import {
  ContentPreviewProps,
  PresentationConfig,
} from "../types/presentation.types";
import { useEffect, useRef, useState, useCallback } from "react";
import { Mostage } from "mostage";
import { Maximize, Upload, Download, MonitorPlay } from "lucide-react";
import { analytics } from "@/lib/utils/analytics";
import { EditablePresentationInfo } from "./EditablePresentationInfo";
import { useParams } from "next/navigation";

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  markdown,
  config,
  editingSlide,
  onOpenLoginRequiredModal,
  onOpenImportModal,
  onOpenExportModal,
  presentation,
  onPresentationUpdate,
}) => {
  const params = useParams();
  const username = params?.username as string;
  const containerRef = useRef<HTMLDivElement>(null);
  const mostageRef = useRef<Mostage | null>(null);
  const slideInputRef = useRef<HTMLInputElement>(null);
  const [slideCount, setSlideCount] = useState<number>(0);
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConfigRef = useRef<PresentationConfig | null>(null);

  // Helper function to get display content
  const getDisplayContent = useCallback((content: string) => {
    return (
      content.trim() ||
      `## No content

<br/>

#### Add content "Manually" or generate with "AI"
`
    );
  }, []);

  const updateMostage = useCallback(
    (content: string, presentationConfig: PresentationConfig) => {
      if (containerRef.current) {
        const displayContent = getDisplayContent(content);

        // If Mostage instance exists, update content
        if (mostageRef.current) {
          mostageRef.current.updateContent(displayContent).then(() => {
            if (mostageRef.current) {
              setSlideCount(mostageRef.current.getTotalSlides());
            }
          });
        } else {
          // Create new Mostage instance only if it doesn't exist
          mostageRef.current = new Mostage({
            element: containerRef.current,
            content: displayContent,
            theme: presentationConfig.theme,
            scale: presentationConfig.scale,
            loop: presentationConfig.loop,
            keyboard: presentationConfig.keyboard,
            touch: presentationConfig.touch,
            urlHash: presentationConfig.urlHash,
            transition: presentationConfig.transition,
            centerContent: presentationConfig.centerContent,
            header: presentationConfig.header,
            footer: presentationConfig.footer,
            plugins: presentationConfig.plugins,
          });

          mostageRef.current.start().then(() => {
            // Get slide count after presentation is initialized
            if (mostageRef.current) {
              setSlideCount(mostageRef.current.getTotalSlides());
              setCurrentSlide(1); // Always start from first slide
              mostageRef.current.goToSlide(0); // Go to first slide
            }
          });
        }
      }
    },
    [getDisplayContent]
  );

  const recreateMostage = useCallback(
    (content: string, presentationConfig: PresentationConfig) => {
      if (containerRef.current) {
        // Save current slide before destroying instance
        let savedSlide = 1; // Default to first slide
        if (mostageRef.current) {
          const currentSlideIndex = mostageRef.current.getCurrentSlide();
          savedSlide = currentSlideIndex + 1; // Convert to 1-based
        }

        // Clean up existing instance
        if (mostageRef.current) {
          mostageRef.current.destroy();
          mostageRef.current = null;
        }

        const displayContent = getDisplayContent(content);

        // Create new Mostage instance with updated config
        mostageRef.current = new Mostage({
          element: containerRef.current,
          content: displayContent,
          theme: presentationConfig.theme,
          scale: presentationConfig.scale,
          loop: presentationConfig.loop,
          keyboard: presentationConfig.keyboard,
          touch: presentationConfig.touch,
          urlHash: presentationConfig.urlHash,
          transition: presentationConfig.transition,
          centerContent: presentationConfig.centerContent,
          header: presentationConfig.header,
          footer: presentationConfig.footer,
          plugins: presentationConfig.plugins,
          background: presentationConfig.background,
        });

        mostageRef.current.start().then(() => {
          if (mostageRef.current) {
            const totalSlides = mostageRef.current.getTotalSlides();
            setSlideCount(totalSlides);

            // Restore saved slide if it's still valid
            const slideToRestore = Math.min(savedSlide, totalSlides);
            setCurrentSlide(slideToRestore);
            mostageRef.current.goToSlide(slideToRestore - 1); // Convert to 0-based
          }
        });
      }
    },
    [getDisplayContent]
  );

  // Handle content and config changes with smart logic
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Check if config has changed
    const configChanged =
      JSON.stringify(lastConfigRef.current) !== JSON.stringify(config);
    lastConfigRef.current = config;

    // Set new timeout for debounced update
    debounceTimeoutRef.current = setTimeout(() => {
      if (mostageRef.current) {
        if (configChanged) {
          // If config changed, recreate instance
          recreateMostage(markdown, config);
        } else {
          // If only content changed, update content only
          updateMostage(markdown, config);
        }
      } else {
        // If no instance, create new one
        recreateMostage(markdown, config);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [markdown, config, updateMostage, recreateMostage]);

  // Sync with editor slide changes
  useEffect(() => {
    if (mostageRef.current && editingSlide && editingSlide <= slideCount) {
      setCurrentSlide(editingSlide);
      mostageRef.current.goToSlide(editingSlide - 1); // Convert to 0-based
    }
  }, [editingSlide, slideCount]);

  // Simple polling to sync current slide (fallback)
  useEffect(() => {
    if (!mostageRef.current || slideCount === 0) return;

    const interval = setInterval(() => {
      if (mostageRef.current) {
        const newSlide = mostageRef.current.getCurrentSlide() + 1;
        setCurrentSlide((prev) => (prev !== newSlide ? newSlide : prev));
      }
    }, 300);

    return () => clearInterval(interval);
  }, [slideCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mostageRef.current) {
        mostageRef.current.destroy();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleFullscreen = () => {
    // Track fullscreen toggle
    analytics.trackFullscreen("on");

    if (containerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = containerRef.current as any;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  };

  // Method to navigate to a specific slide
  const goToSlide = (slideIndex: number) => {
    if (mostageRef.current) {
      mostageRef.current.goToSlide(slideIndex);
      setCurrentSlide(slideIndex + 1); // Convert to 1-based
    }
  };

  // Handle opening view popup
  const handleOpenViewPopup = useCallback(() => {
    if (!username || !presentation?.slug) {
      console.error("Username or slug is missing");
      return;
    }

    const url = `/${username}/${presentation.slug}/view`;
    const width = window.screen.width / 1.3;
    const height = window.screen.height / 1.3;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      url,
      "viewPresentation",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  }, [username, presentation?.slug]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-input bg-muted">
        <h3 className="text-sm font-semibold text-card-foreground">
          Live Preview
        </h3>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          {/* Presentation URL Display */}
          <div className="hidden sm:flex items-center">
            <EditablePresentationInfo
              presentationName={presentation?.name || "Basic Sample"}
              slug={presentation?.slug || "sample"}
              isPublic={presentation?.isPublic || false}
              isTemplate={presentation?.isTemplate || false}
              onOpenLoginRequiredModal={onOpenLoginRequiredModal}
              onSave={onPresentationUpdate}
            />
          </div>

          {/* Slide Navigation Group */}
          {slideCount > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-background border border-input rounded-md hover:bg-secondary transition-colors cursor-pointer"
              onClick={() => {
                if (slideInputRef.current) {
                  slideInputRef.current.focus();
                  slideInputRef.current.select();
                }
              }}
            >
              <span className="text-xs text-muted-foreground font-medium">
                Slide
              </span>
              {/* TODO: Add up and down arrows to increment and decrement the slide number */}
              {/* Don't use number input because the style was not working as expected */}
              <input
                ref={slideInputRef}
                type="text"
                min="1"
                max={slideCount}
                value={currentSlide}
                onChange={(e) => {
                  const slideNumber = parseInt(e.target.value);
                  if (slideNumber >= 1 && slideNumber <= slideCount) {
                    setCurrentSlide(slideNumber);
                    goToSlide(slideNumber - 1); // Convert to 0-based index
                  }
                }}
                className="w-6 text-center text-xs font-medium bg-transparent border-none outline-none text-foreground focus:ring-0 focus:outline-none rounded transition-colors"
                style={{
                  MozAppearance: "textfield",
                  WebkitAppearance: "none",
                }}
              />
              <span className="text-xs text-muted-foreground">
                of {slideCount}
              </span>
            </div>
          )}

          {/* Loading state */}
          {slideCount === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          )}

          {/* Upload and Download buttons */}
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              title="Upload presentation"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              title="Download presentation"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}

          {username && presentation?.slug && (
            <button
              onClick={handleOpenViewPopup}
              className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              title="Open view popup"
            >
              <MonitorPlay className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}

          <button
            onClick={handleFullscreen}
            className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer"
            title="Enter fullscreen mode"
          >
            <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
};
