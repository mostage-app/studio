"use client";

import Link from "next/link";
import {
  FilePlay,
  Link as LinkIcon,
  Globe,
  Lock,
  Calendar,
  MonitorPlay,
  Pencil,
  Settings,
  Trash2,
  Share2,
  FileSymlink,
} from "lucide-react";
import type { Presentation } from "@/features/presentation/services/presentationService";
import type { SharePlatform } from "../types";
import { formatDate } from "../utils";
import { ShareMenu } from "./ShareMenu";

interface PresentationCardProps {
  presentation: Presentation;
  username: string;
  isOwnProfile: boolean;
  isAuthenticated?: boolean;
  shareMenuOpen: string | null;
  presentationLinkCopied: string | null;
  onShare: (slug: string, name: string, platform?: SharePlatform) => void;
  onView: (slug: string) => void;
  onEdit: (presentation: Presentation) => void;
  onDelete: (slug: string, name: string) => void;
  onUseTemplate?: (template: Presentation) => void;
  menuRef: (el: HTMLDivElement | null) => void;
}

export function PresentationCard({
  presentation: pres,
  username,
  isOwnProfile,
  isAuthenticated = false,
  shareMenuOpen,
  presentationLinkCopied,
  onShare,
  onView,
  onEdit,
  onDelete,
  onUseTemplate,
  menuRef,
}: PresentationCardProps) {
  const isTemplate = pres.isTemplate === true;
  return (
    <div className="bg-muted/30 border border-input rounded-md p-5 hover:shadow-lg hover:border-primary/50 transition-all">
      {/* Header with Share button */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <FilePlay className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <h3 className="font-semibold text-foreground truncate text-base">
            {pres.name}
          </h3>
        </div>

        {/* Share button with dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => onShare(pres.slug, pres.name)}
            className="flex items-center justify-center p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary border border-input rounded-md hover:border-primary/50 transition-all"
            title="Share presentation"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <ShareMenu
            isOpen={shareMenuOpen === pres.slug}
            slug={pres.slug}
            name={pres.name}
            isCopied={presentationLinkCopied === pres.slug}
            onShare={onShare}
            menuRef={menuRef}
          />
        </div>
      </div>

      {/* Slug */}
      <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
        <LinkIcon className="w-3.5 h-3.5" />
        <span className="font-mono truncate">{pres.slug}</span>
      </div>

      {/* Visibility Badge */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {isTemplate && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md text-xs font-medium">
            <FileSymlink className="w-3.5 h-3.5" />
            <span>Template</span>
          </div>
        )}
        {pres.isPublic ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>Public</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-md text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Private</span>
          </div>
        )}
      </div>

      {/* Date Information */}
      <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            Created: {formatDate(pres.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            Updated: {formatDate(pres.updatedAt)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View button */}
        <button
          onClick={() => onView(pres.slug)}
          className="flex-1 flex items-center justify-center gap-1 px-0.5 py-2 bg-background text-foreground rounded-md hover:bg-secondary border border-input transition-colors text-sm font-medium"
          title="View presentation"
        >
          <MonitorPlay className="w-4 h-4 flex-shrink-0" />
          <span>View</span>
        </button>

        {/* Use Template button (for all authenticated users) */}
        {isTemplate && isAuthenticated && onUseTemplate && (
          <button
            onClick={() => onUseTemplate(pres)}
            className="flex-1 flex items-center justify-center gap-1 px-0.5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-secondary border border-input transition-colors text-sm font-medium"
            title="Create presentation from template"
          >
            <FileSymlink className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Use Template</span>
          </button>
        )}

        {isOwnProfile && (
          <>
            {/* Edit Content button */}
            <Link
              href={`/${username}/${pres.slug}`}
              className="flex-1 flex items-center justify-center gap-1 px-0.5 py-2 bg-primary text-primary-foreground rounded-md hover:bg-secondary border border-input transition-colors text-sm font-medium"
              title="Edit presentation content"
            >
              <Pencil className="w-4 h-4 flex-shrink-0" />
              <span>Edit</span>
            </Link>

            {/* Settings button */}
            <button
              onClick={() => onEdit(pres)}
              className="flex items-center justify-center p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors flex-shrink-0"
              title="Edit presentation info"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              onClick={() => onDelete(pres.slug, pres.name)}
              className="flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex-shrink-0"
              title="Delete presentation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
