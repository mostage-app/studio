"use client";

import { ContactRound, Users } from "lucide-react";
import type { Presentation } from "@/features/presentation/services/presentationService";
import type { SharePlatform } from "../types";
import { PresentationCard } from "./PresentationCard";

interface SharedPresentationsGridProps {
  presentations: Presentation[];
  username: string;
  shareMenuOpen: string | null;
  presentationLinkCopied: string | null;
  onShare: (slug: string, name: string, platform?: SharePlatform) => void;
  onView: (slug: string) => void;
  onEdit: (presentation: Presentation) => void;
  onDelete: (slug: string, name: string) => void;
  menuRefs: Record<string, HTMLDivElement | null>;
}

export function SharedPresentationsGrid({
  presentations,
  username,
  shareMenuOpen,
  presentationLinkCopied,
  onShare,
  onView,
  onEdit,
  onDelete,
  menuRefs,
}: SharedPresentationsGridProps) {
  return (
    <div className="bg-background border border-input rounded-sm p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-md">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Shared with Me
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Presentations shared with you by other users
          </p>
        </div>
      </div>

      {/* Presentations Grid */}
      {presentations.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
          {presentations.map((pres) => (
            <PresentationCard
              key={pres.presentationId}
              presentation={pres}
              username={username}
              isOwnProfile={false}
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
            <ContactRound className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No shared presentations
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Presentations shared with you will appear here
          </p>
        </div>
      )}
    </div>
  );
}
