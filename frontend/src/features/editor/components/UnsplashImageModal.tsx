"use client";

/**
 * TODO: Refactor - Split into UnsplashImageSelector (selection only) and ImageMarkdownConfigurator (settings).
 * Modal should return photo object via onSelectImage callback, not handle markdown generation directly.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Modal } from "@/lib/components/ui/Modal";
import { Search, Loader2, Image as ImageIcon, Check } from "lucide-react";
import {
  searchUnsplashPhotos,
  trackUnsplashDownload,
  generateMarkdownImage,
  type UnsplashPhoto,
} from "../services/unsplashService";

interface UnsplashImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent: (content: string) => void;
  mode?: "markdown" | "url-only"; // markdown: inserts markdown with attribution, url-only: returns just the URL
  onSelectUrl?: (url: string) => void; // For url-only mode
}

export function UnsplashImageModal({
  isOpen,
  onClose,
  onInsertContent,
  mode = "markdown",
  onSelectUrl,
}: UnsplashImageModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UnsplashPhoto | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [altText, setAltText] = useState("");
  const [imageSize, setImageSize] = useState<"small" | "regular" | "full">(
    "regular"
  );
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setImages([]);
      setError(null);
      setSelectedImage(null);
      setPage(1);
      setTotalPages(0);
      setTotalResults(0);
      setAltText("");
      setImageSize("regular");
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (!searchQuery.trim()) {
      setImages([]);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchQuery, 1);
    }, 500); // 500ms debounce

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearch = useCallback(
    async (query: string, pageNum: number = 1) => {
      if (!query.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchUnsplashPhotos({
          query: query.trim(),
          page: pageNum,
          perPage: 20,
        });

        if (pageNum === 1) {
          setImages(response.results);
        } else {
          // Filter out duplicate images by id to prevent React key conflicts
          setImages((prev) => {
            const existingIds = new Set(prev.map((img) => img.id));
            const newImages = response.results.filter(
              (img) => !existingIds.has(img.id)
            );
            return [...prev, ...newImages];
          });
        }

        setPage(pageNum);
        setTotalPages(response.total_pages);
        setTotalResults(response.total);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to search images. Please try again."
        );
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleLoadMore = useCallback(async () => {
    if (
      isLoadingMore ||
      isLoading ||
      page >= totalPages ||
      !searchQuery.trim()
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      await handleSearch(searchQuery, page + 1);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isLoading, page, totalPages, searchQuery, handleSearch]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!currentRef || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingMore && !isLoading) {
          handleLoadMore();
        }
      },
      {
        root: scrollContainer, // Use scroll container as root for proper detection
        rootMargin: "50px", // Start loading 50px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isOpen, isLoadingMore, isLoading, handleLoadMore]);

  const handleImageSelect = useCallback((photo: UnsplashPhoto) => {
    setSelectedImage(photo);
    setAltText(photo.alt_description || photo.description || "");
  }, []);

  const handleInsert = useCallback(async () => {
    if (!selectedImage) return;

    try {
      // Track download as required by Unsplash
      await trackUnsplashDownload(selectedImage.links.download_location);

      if (mode === "url-only" && onSelectUrl) {
        // Return just the URL for url-only mode
        const imageUrl = selectedImage.urls[imageSize];
        onSelectUrl(imageUrl);
        onClose();
      } else {
        // Generate markdown with attribution for markdown mode
        const markdown = generateMarkdownImage(
          selectedImage,
          altText.trim(),
          imageSize
        );

        // Insert into editor
        onInsertContent(markdown);

        // Close modal
        onClose();
      }
    } catch (err) {
      console.error("Failed to insert image:", err);
      setError("Failed to insert image. Please try again.");
    }
  }, [
    selectedImage,
    altText,
    imageSize,
    mode,
    onSelectUrl,
    onInsertContent,
    onClose,
  ]);

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Search Images from Unsplash
        </h2>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={headerContent}
      maxWidth="4xl"
    >
      <div className="space-y-3 min-h-[500px]">
        {/* Search Input */}
        <div>
          <label className="block text-xs sm:text-xs font-medium text-foreground mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for images (e.g., nature, technology, business)"
              className="w-full pl-10 pr-3 py-2.5 sm:pl-10 sm:pr-2 sm:py-1.5 text-base sm:text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && images.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Searching...</span>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="space-y-1">
            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {images.length} of {totalResults.toLocaleString()}{" "}
                results
              </span>
            </div>
            <div
              ref={scrollContainerRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto"
            >
              {images.map((photo) => {
                const isSelected = selectedImage?.id === photo.id;
                return (
                  <div
                    key={photo.id}
                    onClick={() => handleImageSelect(photo)}
                    className={`
                      group relative aspect-square rounded-sm overflow-hidden cursor-pointer
                      border-1 transition-all
                      ${
                        isSelected
                          ? "border-primary ring-1 ring-primary"
                          : "border-transparent hover:border-primary/50"
                      }
                    `}
                  >
                    <Image
                      src={photo.urls.thumb}
                      alt={photo.alt_description || photo.description || ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      unoptimized
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-2">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    {/* Attribution overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">
                        {photo.user.name}
                      </p>
                    </div>
                  </div>
                );
              })}
              {/* Infinite Scroll Trigger - placed at the end of grid */}
              {page < totalPages && (
                <div
                  ref={loadMoreRef}
                  className="col-span-full flex justify-center py-4 min-h-[60px]"
                >
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Loading more images...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Image Preview and Alt Text */}
        {selectedImage && (
          <div className="border border-input rounded-md p-4 space-y-3">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={selectedImage.urls.small}
                  alt={selectedImage.alt_description || ""}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  Selected Image
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Photo by {selectedImage.user.name}
                </p>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <div className="w-40 flex-shrink-0">
                      <label className="block text-xs sm:text-xs font-medium text-foreground mb-1.5">
                        Image Size
                      </label>
                      <select
                        value={imageSize}
                        onChange={(e) =>
                          setImageSize(
                            e.target.value as "small" | "regular" | "full"
                          )
                        }
                        className="w-full px-3 py-2.5 sm:px-2 sm:py-1.5 text-base sm:text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="small">Small (400px)</option>
                        <option value="regular">Regular (1080px)</option>
                        <option value="full">Full (Original)</option>
                      </select>
                    </div>
                    {mode === "markdown" && (
                      <div className="flex-1">
                        <label className="block text-xs sm:text-xs font-medium text-foreground mb-1.5">
                          Description
                        </label>
                        <input
                          type="text"
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                          placeholder="Image description"
                          className="w-full px-3 py-2.5 sm:px-2 sm:py-1.5 text-base sm:text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                    <div className="flex items-end">
                      <button
                        onClick={handleInsert}
                        className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation whitespace-nowrap"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && searchQuery.trim() && !error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No images found. Try a different search term.
              </p>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && images.length === 0 && !searchQuery.trim() && !error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Start typing to search for images
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
