"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Search as SearchIcon } from "lucide-react";
import { emojiCategories, emojiNames } from "../utils/emojis";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  buttonRef: React.RefObject<HTMLDivElement | null>;
  initialPosition?: {
    top: string;
    left: string;
    transform?: string;
  };
}

const POPUP_BACKDROP_CLASSES = "fixed inset-0 bg-black/50 z-[9996] sm:hidden";
const POPUP_CLASSES =
  "bg-white dark:bg-gray-800 border border-input rounded-md shadow-xl z-[9997] p-4 min-w-[320px] max-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)] sm:w-auto sm:shadow-lg max-h-[400px] overflow-y-auto";

export function EmojiPicker({
  isOpen,
  onClose,
  onSelect,
  buttonRef,
  initialPosition,
}: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [popupPosition, setPopupPosition] = useState<{
    top: string;
    left: string;
    transform?: string;
  } | null>(initialPosition || null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Get button position for popup positioning
  const getButtonPosition = (): {
    top: string;
    left: string;
    transform?: string;
  } => {
    if (typeof window === "undefined") {
      return { top: "50%", left: "50%" };
    }

    if (!buttonRef.current) {
      if (window.innerWidth < 640) {
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
      }
      return { top: "50%", left: "50%" };
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const popupWidth = 320;
    const margin = 8;
    let left = rect.left;
    if (left + popupWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - popupWidth - margin);
    }

    return {
      top: `${rect.bottom + 4}px`,
      left: `${left}px`,
    };
  };

  // Calculate position immediately when opening - useLayoutEffect runs before paint
  useLayoutEffect(() => {
    if (isOpen) {
      // Use initialPosition if provided, otherwise calculate
      const position = initialPosition || getButtonPosition();
      setPopupPosition(position);
    } else {
      setPopupPosition(null);
    }
  }, [isOpen, initialPosition]);

  // Update popup position when window is resized/scrolled
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPopupPosition(getButtonPosition());
    };

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popupRef.current && !popupRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset search when popup closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Filter emojis based on search term
  const getFilteredEmojis = (): typeof emojiCategories => {
    if (!searchTerm.trim()) {
      return emojiCategories;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered: Partial<typeof emojiCategories> = {};

    Object.entries(emojiCategories).forEach(([category, emojis]) => {
      const matchingEmojis: string[] = [];

      emojis.forEach((emoji) => {
        const categoryMatches = category.toLowerCase().includes(searchLower);
        const emojiKeywords = emojiNames[emoji] || [];
        const emojiMatches = emojiKeywords.some((keyword) =>
          keyword.toLowerCase().includes(searchLower)
        );

        if (categoryMatches || emojiMatches) {
          matchingEmojis.push(emoji);
        }
      });

      if (matchingEmojis.length > 0) {
        filtered[category as keyof typeof emojiCategories] = matchingEmojis;
      }
    });

    return filtered as typeof emojiCategories;
  };

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  if (!isOpen || !popupPosition) return null;

  const filteredEmojis = getFilteredEmojis();
  const hasResults = Object.keys(filteredEmojis).length > 0;

  return typeof window !== "undefined"
    ? createPortal(
        <>
          <div
            className={POPUP_BACKDROP_CLASSES}
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            className={POPUP_CLASSES}
            ref={popupRef}
            style={{
              position: "fixed",
              ...popupPosition,
            }}
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Select Emoji
              </h3>

              {/* Search Input */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search emojis..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Emoji Grid */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {hasResults ? (
                  Object.entries(filteredEmojis).map(([category, emojis]) => (
                    <div key={category}>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                        {emojis.map((emoji, index) => (
                          <button
                            key={`${category}-${index}`}
                            onClick={() => handleEmojiClick(emoji)}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg hover:bg-secondary rounded transition-colors"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No emojis found matching &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    : null;
}
