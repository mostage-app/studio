"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  UserCircle,
  Package,
  Edit2,
  Check,
  X,
  Loader2,
  Calendar,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { Modal } from "@/lib/components/ui/Modal";
import { useAuthContext } from "./AuthProvider";
import { AuthModalProps } from "../types/auth.types";

export function AccountModal({ isOpen, onClose }: AuthModalProps) {
  const { user, updateUser } = useAuthContext();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setEditedName(user.name || "");
      setIsEditingName(false);
      setError("");
      setSuccess("");
      setShowDeleteMessage(false);
      setShowUpgradeMessage(false);
    }
  }, [isOpen, user]);

  const handleStartEdit = () => {
    setEditedName(user?.name || "");
    setIsEditingName(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || "");
    setIsEditingName(false);
    setError("");
    setSuccess("");
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (editedName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateUser({ name: editedName.trim() });

      if (result.success) {
        setSuccess("Name updated successfully");
        setIsEditingName(false);
        setTimeout(() => {
          setSuccess("");
        }, 2000);
      } else {
        setError(result.error || "Failed to update name");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update name"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteMessage(true);
    setShowUpgradeMessage(false);
  };

  const handleChangePlan = () => {
    setShowUpgradeMessage(true);
    setShowDeleteMessage(false);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Account
        </h2>
      </div>
    </div>
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        headerContent={headerContent}
        maxWidth="md"
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          {/* Delete Account Message */}
          {showDeleteMessage && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
              <div className="flex items-start gap-2">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 flex-1">
                  To delete your account, please send an email to{" "}
                  <a
                    href="mailto:info@mostage.app"
                    className="text-blue-500 hover:underline"
                  >
                    info@mostage.app
                  </a>{" "}
                  with your account details.
                </p>
              </div>
            </div>
          )}

          {/* Upgrade Plan Message */}
          {showUpgradeMessage && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
              <div className="flex items-start gap-2">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex-1">
                  Plan upgrades are not yet available for everyone. <br />
                  You need a referral link to access additional features.
                </p>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    disabled={isSaving}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving || !editedName.trim()}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {user.name || user.username}
                    </h3>
                    <button
                      onClick={handleStartEdit}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Edit name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    @{user.username}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Email
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Username
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                  {user.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Member Since
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Subscription
                </p>
                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  Free Plan
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 sm:pt-6">
            <button
              onClick={handleDeleteAccount}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Delete Account
            </button>
            <button
              onClick={handleChangePlan}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary  text-primary-foreground rounded-md hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              Change Plan
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
