"use client";

import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Package,
  Settings,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import type { ProfileUser } from "../types";
import { formatFullDate } from "../utils";

interface ProfileCardProps {
  username: string;
  isOwnProfile: boolean;
  user: {
    name?: string;
    username?: string;
    email?: string;
    createdAt?: string;
  } | null;
  profileUser: ProfileUser | null;
  gravatarUrl: string | null;
  isEditingName: boolean;
  editedName: string;
  isSavingName: boolean;
  profileError: string;
  profileSuccess: string;
  showUpgradeMessage: boolean;
  onStartEditName: () => void;
  onCancelEditName: () => void;
  onSaveName: () => void;
  onNameChange: (name: string) => void;
  onChangePlan: () => void;
  onGravatarError: () => void;
}

export function ProfileCard({
  username,
  isOwnProfile,
  user,
  profileUser,
  gravatarUrl,
  isEditingName,
  editedName,
  isSavingName,
  profileError,
  profileSuccess,
  showUpgradeMessage,
  onStartEditName,
  onCancelEditName,
  onSaveName,
  onNameChange,
  onChangePlan,
  onGravatarError,
}: ProfileCardProps) {
  return (
    <div className="bg-background border border-input rounded-sm p-6">
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        {isOwnProfile && gravatarUrl ? (
          <div className="relative w-24 h-24">
            <Image
              src={gravatarUrl}
              alt={user?.name || username}
              width={96}
              height={96}
              className="w-24 h-24 rounded-md object-cover border-2 border-primary/20"
              onError={onGravatarError}
              priority
              unoptimized
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-primary/10 rounded-md flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
        )}
      </div>

      {/* Messages */}
      {profileSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-200">
            {profileSuccess}
          </p>
        </div>
      )}

      {profileError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">
            {profileError}
          </p>
        </div>
      )}

      {/* Name */}
      <div className="text-center mb-6">
        {isOwnProfile && isEditingName ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editedName.trim() && !isSavingName) {
                  onSaveName();
                } else if (e.key === "Escape") {
                  onCancelEditName();
                }
              }}
              className="text-xl font-semibold text-foreground bg-transparent border-none outline-none text-center focus:ring-0 focus:border-b-2 focus:border-primary px-1 py-0.5 min-w-0 flex-1 max-w-xs disabled:opacity-50"
              placeholder="Enter your name"
              disabled={isSavingName}
              autoFocus
            />
            <button
              onClick={onSaveName}
              disabled={isSavingName || !editedName.trim()}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save (Enter)"
              aria-label="Save name"
            >
              {isSavingName ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onCancelEditName}
              disabled={isSavingName}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors disabled:opacity-50"
              title="Cancel (Esc)"
              aria-label="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              {isOwnProfile
                ? user?.name || user?.username
                : profileUser?.name || username}
            </h2>
            {isOwnProfile && (
              <button
                onClick={onStartEditName}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors cursor-pointer"
                title="Edit name"
                aria-label="Edit name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Details */}
      <div className="space-y-4">
        {/* Username */}
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="text-sm text-foreground truncate">@{username}</p>
          </div>
        </div>

        {/* Email - only for own profile */}
        {isOwnProfile && user?.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm text-foreground">
              {formatFullDate(
                isOwnProfile ? user?.createdAt : profileUser?.createdAt
              )}
            </p>
          </div>
        </div>

        {/* Subscription - only for own profile */}
        {isOwnProfile && (
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="text-sm text-foreground">Basic Plan</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Actions - only for own profile */}
      {isOwnProfile && (
        <div className="mt-6 pt-6 border-t border-input">
          <button
            onClick={onChangePlan}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-background hover:bg-secondary border border-input rounded-md transition-all hover:border-primary/50 text-sm font-medium group"
          >
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer">
              Change Plan
            </span>
          </button>
        </div>
      )}

      {showUpgradeMessage && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Currently, you cannot upgrade your plan without a referral link.
            <br />
            <br />
            In March 2026, the other plans will be available publicly.
            <br />
            <br />
            You can{" "}
            <a
              href="https://github.com/sponsors/mostage-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline inline-flex items-center gap-2"
            >
              donate
            </a>{" "}
            for supporting faster development.
          </p>
        </div>
      )}
    </div>
  );
}
