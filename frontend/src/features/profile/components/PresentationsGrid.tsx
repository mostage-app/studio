"use client";

import { Files, FileText } from "lucide-react";
import type { Presentation } from "@/features/presentation/services/presentationService";
import type { SharePlatform } from "../types";
import { PresentationCard } from "./PresentationCard";

interface PresentationsGridProps {
  presentations: Presentation[];
  username: string;
  isOwnProfile: boolean;
  shareMenuOpen: string | null;
  presentationLinkCopied: string | null;
  onShare: (slug: string, name: string, platform?: SharePlatform) => void;
  onView: (slug: string) => void;
  onEdit: (presentation: Presentation) => void;
  onDelete: (slug: string, name: string) => void;
  menuRefs: Record<string, HTMLDivElement | null>;
}

export function PresentationsGrid({
  presentations,
  username,
  isOwnProfile,
  shareMenuOpen,
  presentationLinkCopied,
  onShare,
  onView,
  onEdit,
  onDelete,
  menuRefs,
}: PresentationsGridProps) {
  return (
    <div className="bg-background border border-input rounded-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-md">
          <Files className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {isOwnProfile ? "My Presentations" : "Public Presentations"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOwnProfile
              ? "Manage and view all your presentations"
              : `View ${username}'s public presentations`}
          </p>
        </div>
      </div>

      {/* Presentations Grid */}
      {presentations.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {presentations.map((pres) => (
            <PresentationCard
              key={pres.presentationId}
              presentation={pres}
              username={username}
              isOwnProfile={isOwnProfile}
              shareMenuOpen={shareMenuOpen}
              presentationLinkCopied={presentationLinkCopied}
              onShare={onShare}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              menuRef={(el) => {
                menuRefs[pres.slug] = el;
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 px-4 text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isOwnProfile ? "No presentations yet" : "No public presentations"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isOwnProfile
              ? "Create your first presentation to get started"
              : `${username} hasn't shared any public presentations yet`}
          </p>
        </div>
      )}
    </div>
  );
}
