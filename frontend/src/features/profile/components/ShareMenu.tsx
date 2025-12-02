"use client";

import { Check, Copy, Share2 } from "lucide-react";
import type { SharePlatform } from "../types";

interface ShareMenuProps {
  isOpen: boolean;
  slug: string;
  name: string;
  isCopied: boolean;
  onShare: (slug: string, name: string, platform?: SharePlatform) => void;
  menuRef: (el: HTMLDivElement | null) => void;
}

export function ShareMenu({
  isOpen,
  slug,
  name,
  isCopied,
  onShare,
  menuRef,
}: ShareMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-52 bg-background border border-input rounded-md shadow-lg z-50 p-2"
    >
      {/* Copy Link */}
      <button
        onClick={() => onShare(slug, name, "copy")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
      >
        {isCopied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy to share</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="h-px bg-input my-2" />

      {/* Social platforms */}
      <div className="space-y-1">
        <button
          onClick={() => onShare(slug, name, "twitter")}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Twitter</span>
        </button>

        <button
          onClick={() => onShare(slug, name, "facebook")}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
          <span>Facebook</span>
        </button>

        <button
          onClick={() => onShare(slug, name, "linkedin")}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span>LinkedIn</span>
        </button>
      </div>
    </div>
  );
}
