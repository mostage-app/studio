"use client";

import React, { useState } from "react";
import { Check, X, Globe, Lock } from "lucide-react";
import { useAuthContext } from "@/features/auth/components/AuthProvider";

interface PresentationUrlDisplayProps {
  presentationName?: string;
  isPublic?: boolean;
  onOpenAuthModal?: () => void;
}

export const PresentationUrlDisplay: React.FC<PresentationUrlDisplayProps> = ({
  presentationName = "new",
  isPublic = false,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(presentationName);
  const [editedIsPublic, setEditedIsPublic] = useState(isPublic);

  const username =
    isAuthenticated && user?.username ? user.username : "username";
  const displayName = isAuthenticated ? "new" : presentationName;
  const url = `https://studio.mostage.app/${username}/${displayName}`;

  const handleEdit = () => {
    if (!isAuthenticated && onOpenAuthModal) {
      onOpenAuthModal();
      return;
    }
    setIsEditing(true);
    setEditedName(displayName);
    setEditedIsPublic(isPublic);
  };

  const handleSave = () => {
    // TODO: Save changes to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(displayName);
    setEditedIsPublic(isPublic);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-3 py-0.5 bg-background border border-input rounded-md">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          https://studio.mostage.app/{username}/
        </span>
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="flex-1 min-w-0 px-2 py-0.5 text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
            } else if (e.key === "Escape") {
              handleCancel();
            }
          }}
        />
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setEditedIsPublic(false)}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              !editedIsPublic
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Private</span>
          </button>
          <button
            type="button"
            onClick={() => setEditedIsPublic(true)}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              editedIsPublic
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Public</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="flex items-center justify-center w-5 h-5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            title="Save"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center justify-center w-5 h-5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleEdit}
      className="flex items-center gap-1.5 px-2 py-1 bg-background border border-input rounded-md cursor-pointer hover:bg-secondary transition-colors"
      data-tour-target="presentation-url"
    >
      <span className="text-xs text-muted-foreground font-mono truncate">
        {url}
      </span>
      <div className="flex items-center gap-1 ml-1">
        {isPublic ? (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-medium">
            <Globe className="w-2.5 h-2.5" />
            <span>Public</span>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-[10px] font-medium">
            <Lock className="w-2.5 h-2.5" />
            <span>Private</span>
          </div>
        )}
      </div>
    </div>
  );
};
