"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SharePlatform } from "../types";
import { COPY_FEEDBACK_DURATION } from "../utils";
import {
  getPresentationShareText,
  getPresentationShareUrl,
  openSocialShareWindow,
  shareToClipboard,
  shareViaWebShareAPI,
} from "../utils/share.utils";

interface UseSharePresentationOptions {
  username: string;
  slug: string;
  name: string;
}

interface UseSharePresentationReturn {
  shareMenuOpen: boolean;
  presentationLinkCopied: boolean;
  shareMenuRef: React.RefObject<HTMLDivElement>;
  handleShare: (platform?: SharePlatform) => void;
  handleShareMenuRef: (el: HTMLDivElement | null) => void;
  setShareMenuOpen: (open: boolean) => void;
}

/**
 * Custom hook for sharing presentations
 * Manages share menu state, clipboard operations, and social platform sharing
 */
export function useSharePresentation({
  username,
  slug,
  name,
}: UseSharePresentationOptions): UseSharePresentationReturn {
  const [shareMenuOpen, setShareMenuOpen] = useState<boolean>(false);
  const [presentationLinkCopied, setPresentationLinkCopied] =
    useState<boolean>(false);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  // Handle share menu ref callback
  const handleShareMenuRef = useCallback((el: HTMLDivElement | null) => {
    shareMenuRef.current = el;
  }, []);

  // Handle share presentation
  const handleShare = useCallback(
    (platform?: SharePlatform) => {
      if (!username || !slug || !name) {
        return;
      }

      const presentationUrl = getPresentationShareUrl(username, slug);
      const shareText = getPresentationShareText(name);

      // Handle copy to clipboard
      if (platform === "copy") {
        shareToClipboard(shareText, presentationUrl)
          .then(() => {
            setPresentationLinkCopied(true);
            setTimeout(
              () => setPresentationLinkCopied(false),
              COPY_FEEDBACK_DURATION
            );
          })
          .catch(() => {
            // Failed to copy to clipboard
          });
        setShareMenuOpen(false);
        return;
      }

      // Handle social platform sharing
      if (platform) {
        openSocialShareWindow(platform, presentationUrl, shareText);
        setShareMenuOpen(false);
        return;
      }

      // Try Web Share API first (works on mobile and some desktop browsers)
      if (navigator.share) {
        shareViaWebShareAPI(
          `${name} - Mostage`,
          shareText,
          presentationUrl
        ).catch(() => {
          // User cancelled or error occurred
        });
        setShareMenuOpen(false);
        return;
      }

      // Default: open share menu
      setShareMenuOpen(true);
    },
    [username, slug, name]
  );

  // Close share menu when clicking outside
  useEffect(() => {
    if (!shareMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (shareMenuRef.current && !shareMenuRef.current.contains(target)) {
        setShareMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shareMenuOpen]);

  return {
    shareMenuOpen,
    presentationLinkCopied,
    shareMenuRef,
    handleShare,
    handleShareMenuRef,
    setShareMenuOpen,
  };
}
