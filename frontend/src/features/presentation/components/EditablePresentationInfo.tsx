"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Pencil } from "lucide-react";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { EditPresentationModal } from "./EditPresentationModal";

interface EditablePresentationInfoProps {
  presentationName?: string;
  slug?: string;
  isPublic?: boolean;
  onOpenAuthModal?: () => void;
  onSave?: (data: {
    name: string;
    slug: string;
    isPublic: boolean;
  }) => Promise<void>;
}

export const EditablePresentationInfo: React.FC<
  EditablePresentationInfoProps
> = ({
  presentationName = "Untitled",
  slug = "untitled",
  isPublic = false,
  onOpenAuthModal,
  onSave,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const username =
    mounted && isAuthenticated && user?.username ? user.username : "[username]";

  const handleClick = useCallback(() => {
    if (!isAuthenticated && onOpenAuthModal) {
      onOpenAuthModal();
      return;
    }
    setShowEditModal(true);
  }, [isAuthenticated, onOpenAuthModal]);

  const handleClose = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const handleSave = useCallback(
    async (data: { name: string; slug: string; isPublic: boolean }) => {
      if (onSave) {
        await onSave(data);
      }
    },
    [onSave]
  );

  return (
    <>
      {/* Display - Single line */}
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-2 py-1 bg-background border border-input rounded-md cursor-pointer hover:bg-secondary transition-colors group"
        data-tour-target="presentation-url"
      >
        <span className="text-xs font-medium text-foreground truncate max-w-[500px]">
          {presentationName}
        </span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[500px]">
          https://studio.mostage.app/{username}/{slug}
        </span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="text-[10px] text-muted-foreground font-bold">
          {isPublic ? "Public" : "Private"}
        </span>
        <Pencil className="w-3 h-3 text-muted-foreground transition-opacity flex-shrink-0" />
      </button>

      {/* Edit Modal */}
      <EditPresentationModal
        isOpen={showEditModal}
        onClose={handleClose}
        presentationName={presentationName}
        slug={slug}
        isPublic={isPublic}
        username={username}
        onSave={handleSave}
      />
    </>
  );
};
