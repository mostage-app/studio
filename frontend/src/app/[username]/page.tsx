"use client";

import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { useParams } from "next/navigation";
import {
  FileText,
  Globe,
  Calendar,
  Lock,
  Loader2,
  Pencil,
  Trash2,
  Link as LinkIcon,
  User,
  Mail,
  Package,
  Settings,
  Edit2,
  Check,
  X,
  MonitorPlay,
} from "lucide-react";
import {
  deletePresentation,
  getPresentations,
  updatePresentation,
  type Presentation,
} from "@/features/presentation/services/presentationService";
import { EditPresentationModal } from "@/features/presentation/components/EditPresentationModal";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/lib/components/ui/Modal";

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const { user, isAuthenticated, updateUser } = useAuthContext();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    slug: string;
    name: string;
  }>({ isOpen: false, slug: "", name: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    presentation: Presentation | null;
  }>({ isOpen: false, presentation: null });

  // Profile editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  const isOwnProfile = isAuthenticated && user?.username === username;

  useEffect(() => {
    const fetchPresentations = async () => {
      if (!username) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getPresentations(username);
        setPresentations(data);
      } catch (err) {
        console.error("Error fetching presentations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load presentations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresentations();
  }, [username]);

  useEffect(() => {
    if (user) {
      setEditedName(user.name || "");
    }
  }, [user]);

  const openDeleteModal = useCallback((slug: string, name: string) => {
    setDeleteModal({ isOpen: true, slug, name });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, slug: "", name: "" });
  }, []);

  const handleOpenViewPopup = useCallback(
    (slug: string) => {
      const url = `/${username}/${slug}/view`;
      const width = window.screen.width / 1.3;
      const height = window.screen.height / 1.3;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      window.open(
        url,
        "viewPresentation",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );
    },
    [username]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteModal.slug) return;

    setIsDeleting(true);
    try {
      await deletePresentation(username, deleteModal.slug);
      setPresentations((prev) =>
        prev.filter((p) => p.slug !== deleteModal.slug)
      );
      setDeleteModal({ isOpen: false, slug: "", name: "" });
    } catch (err) {
      console.error("Error deleting presentation:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteModal.slug, username]);

  const handleOpenEditModal = useCallback((presentation: Presentation) => {
    setEditModal({ isOpen: true, presentation });
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModal({ isOpen: false, presentation: null });
  }, []);

  const handleUpdatePresentation = useCallback(
    async (data: { name: string; slug: string; isPublic: boolean }) => {
      if (!editModal.presentation) return;

      try {
        await updatePresentation(username, editModal.presentation.slug, data);

        // Update the presentation in the list
        setPresentations((prev) =>
          prev.map((p) =>
            p.presentationId === editModal.presentation?.presentationId
              ? { ...p, ...data }
              : p
          )
        );
      } catch (err) {
        console.error("Error updating presentation:", err);
        throw err;
      }
    },
    [editModal.presentation, username]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString?: string): string => {
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

  // Profile editing handlers
  const handleStartEditName = () => {
    setEditedName(user?.name || "");
    setIsEditingName(true);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleCancelEditName = () => {
    setEditedName(user?.name || "");
    setIsEditingName(false);
    setProfileError("");
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }

    if (editedName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    setProfileError("");

    try {
      const result = await updateUser({ name: editedName.trim() });

      if (result.success) {
        setProfileSuccess("Name updated successfully");
        setIsEditingName(false);
        setTimeout(() => setProfileSuccess(""), 3000);
      } else {
        setProfileError(result.error || "Failed to update name");
      }
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update name"
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePlan = () => {
    setShowUpgradeMessage((prev) => !prev);
  };

  const displayedPresentations = isOwnProfile
    ? presentations
    : presentations.filter((p) => p.isPublic);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !isOwnProfile) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl font-bold text-primary mb-4">404</div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            User Not Found
          </h1>
          <p className="text-muted-foreground">
            The user &quot;{username}&quot; does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-background border border-input rounded-sm p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
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
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-2 text-center border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your name"
                      disabled={isSavingName}
                      autoFocus
                    />
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={handleSaveName}
                        disabled={isSavingName || !editedName.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-md transition-colors"
                      >
                        {isSavingName ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEditName}
                        disabled={isSavingName}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      {isOwnProfile
                        ? user?.name || user?.username
                        : user?.name || username}
                    </h2>
                    {isOwnProfile && (
                      <button
                        onClick={handleStartEditName}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit name"
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
                    <p className="text-sm text-foreground truncate">
                      @{username}
                    </p>
                  </div>
                </div>

                {/* Email - only for own profile */}
                {isOwnProfile && user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                {isOwnProfile && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Member Since
                      </p>
                      <p className="text-sm text-foreground">
                        {formatFullDate(user?.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

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
                    onClick={handleChangePlan}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change Plan
                  </button>
                </div>
              )}

              {showUpgradeMessage && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Plan upgrades are not yet available for everyone. You need a
                    referral link to access additional features.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Presentations */}
          <div className="flex-1 min-w-0">
            {displayedPresentations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {displayedPresentations.map((pres) => (
                  <div
                    key={pres.presentationId}
                    className="bg-background border border-input rounded-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-semibold text-foreground truncate">
                          {pres.name}
                        </h3>
                      </div>
                    </div>

                    {/* Slug */}
                    <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                      <LinkIcon className="w-3 h-3" />
                      <span className="font-mono truncate">{pres.slug}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {pres.isPublic ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                          <Globe className="w-3 h-3" />
                          <span>Public</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {formatDate(pres.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Updated: {formatDate(pres.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* View button */}
                      <button
                        onClick={() => handleOpenViewPopup(pres.slug)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
                        title="View presentation"
                      >
                        <MonitorPlay className="w-4 h-4" />
                        <span>View</span>
                      </button>

                      {isOwnProfile && (
                        <>
                          {/* Edit Content button */}
                          <Link
                            href={`/${username}/${pres.slug}`}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                            title="Edit presentation content"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Edit</span>
                          </Link>

                          {/* Settings button */}
                          <button
                            onClick={() => handleOpenEditModal(pres)}
                            className="flex items-center justify-center p-1.5 text-muted-foreground hover:bg-secondary rounded-md transition-colors"
                            title="Edit presentation info"
                          >
                            <Settings className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() =>
                              openDeleteModal(pres.slug, pres.name)
                            }
                            className="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete presentation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-background border border-input rounded-sm p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isOwnProfile
                    ? "No presentations yet"
                    : "No public presentations"}
                </h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Create your first presentation to get started"
                    : `${username} hasn't shared any public presentations yet`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Presentation Info Modal */}
      {editModal.presentation && (
        <EditPresentationModal
          isOpen={editModal.isOpen}
          onClose={handleCloseEditModal}
          presentationName={editModal.presentation.name}
          slug={editModal.presentation.slug}
          isPublic={editModal.presentation.isPublic}
          username={username}
          onSave={handleUpdatePresentation}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Presentation"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
          </div>

          <p className="text-center text-foreground mb-2">
            Are you sure you want to delete
          </p>
          <p className="text-center font-semibold text-foreground mb-4">
            &quot;{deleteModal.name}&quot;?
          </p>
          <p className="text-center text-sm text-muted-foreground mb-6">
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
