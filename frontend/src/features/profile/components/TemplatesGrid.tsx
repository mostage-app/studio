"use client";

import { FileSymlink } from "lucide-react";
import type { Presentation } from "@/features/presentation/services/presentationService";
import type { SharePlatform } from "../types";
import { PresentationCard } from "./PresentationCard";

interface TemplatesGridProps {
  templates: Presentation[];
  username: string;
  shareMenuOpen: string | null;
  presentationLinkCopied: string | null;
  onShare: (slug: string, name: string, platform?: SharePlatform) => void;
  onView: (slug: string) => void;
  onEdit: (presentation: Presentation) => void;
  onDelete: (slug: string, name: string) => void;
  menuRefs: Record<string, HTMLDivElement | null>;
}

export function TemplatesGrid({
  templates,
  username,
  shareMenuOpen,
  presentationLinkCopied,
  onShare,
  onView,
  onEdit,
  onDelete,
  menuRefs,
}: TemplatesGridProps) {
  return (
    <div className="bg-background border border-input rounded-sm p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-md">
          <FileSymlink className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Templates</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse and use presentation templates
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
          {templates.map((template) => (
            <PresentationCard
              key={template.presentationId}
              presentation={template}
              username={username}
              isOwnProfile={false}
              shareMenuOpen={shareMenuOpen}
              presentationLinkCopied={presentationLinkCopied}
              onShare={onShare}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              menuRef={(el) => {
                menuRefs[template.slug] = el;
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 px-4 text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSymlink className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No templates available
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Templates will appear here when they become available
          </p>
        </div>
      )}
    </div>
  );
}
