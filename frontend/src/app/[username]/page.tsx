"use client";

// React & Next.js
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

// Features
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { AuthService } from "@/features/auth/services/authService";
import {
  deletePresentation,
  getPresentations,
  updatePresentation,
  type Presentation,
} from "@/features/presentation/services/presentationService";
import { EditPresentationModal } from "@/features/presentation/components/EditPresentationModal";

// Components
import { Modal } from "@/lib/components/ui/Modal";
import { NotFoundPage } from "@/lib/components/NotFoundPage";
import {
  ProfileCard,
  ShareProfileBox,
  PresentationsGrid,
  SharedPresentationsGrid,
  TemplatesGrid,
} from "@/features/profile";
import type {
  ProfileUser,
  DeleteModalState,
  EditModalState,
  SharePlatform,
} from "@/features/profile";
import { COPY_FEEDBACK_DURATION, getGravatarUrl } from "@/features/profile";

// ============================================================================
// Main Component
// ============================================================================

export default function UserProfilePage() {
  // ========================================================================
  // Hooks & Context
  // ========================================================================
  const params = useParams();
  const username = params?.username as string;
  const { user, isAuthenticated, updateUser } = useAuthContext();

  // ========================================================================
  // State Management
  // ========================================================================

  // Presentations
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Note: presentationError is kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [presentationError, setPresentationError] = useState<string | null>(
    null
  );

  // Shared presentations (presentations shared with the user)
  // Note: setSharedPresentations will be used when backend API is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sharedPresentations, setSharedPresentations] = useState<
    Presentation[]
  >([]);

  // Templates
  // Note: setTemplates will be used when backend API is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [templates, setTemplates] = useState<Presentation[]>([]);

  // Presentation modals
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    slug: "",
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    presentation: null,
  });

  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  // Other user's profile
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [gravatarUrl, setGravatarUrl] = useState<string | null>(null);

  // Sharing
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [presentationLinkCopied, setPresentationLinkCopied] = useState<
    string | null
  >(null);
  const shareMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ========================================================================
  // Computed Values
  // ========================================================================
  const isOwnProfile = isAuthenticated && user?.username === username;

  // Generate Gravatar URL for own profile
  useEffect(() => {
    if (isOwnProfile && user?.email) {
      const url = getGravatarUrl(user.email, 96);
      setGravatarUrl(url);
    } else {
      setGravatarUrl(null);
    }
  }, [isOwnProfile, user?.email]);

  useEffect(() => {
    const fetchPresentations = async () => {
      if (!username) return;

      setIsLoading(true);
      setPresentationError(null);

      try {
        const data = await getPresentations(username);
        setPresentations(data);
      } catch (err) {
        console.error("Error fetching presentations:", err);
        setPresentationError(
          err instanceof Error ? err.message : "Failed to load presentations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresentations();
  }, [username]);

  // Fetch other user's profile data (only name and username)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username || isOwnProfile) return;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) {
          console.warn("API_URL not configured");
          return;
        }

        // Ensure token is valid before making API request
        await AuthService.ensureValidToken();

        const idToken = AuthService.getIdToken();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (idToken) {
          headers.Authorization = `Bearer ${idToken}`;
        }

        const response = await fetch(`${API_URL}/users/${username}`, {
          method: "GET",
          headers,
        });

        if (response.status === 404) {
          setUserNotFound(true);
          return;
        }

        if (response.ok) {
          setUserNotFound(false);
          const data = await response.json();
          setProfileUser({
            name: data.name,
            username: data.username,
            createdAt: data.createdAt,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Don't set userNotFound on network errors, only on 404
      }
    };

    fetchUserProfile();
  }, [username, isOwnProfile]);

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

  // ========================================================================
  // Event Handlers
  // ========================================================================

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

  const handleCopyLink = useCallback(async () => {
    const profileUrl = `${window.location.origin}/${username}`;
    const shareText = `Check out my presentations on Mostage! #mostage #presentation `;
    const fullText = `${shareText}${profileUrl}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), COPY_FEEDBACK_DURATION);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [username]);

  const handleShare = useCallback(
    (platform: Exclude<SharePlatform, "copy">) => {
      const profileUrl = `${window.location.origin}/${username}`;

      // Professional sharing text
      const shareText = `Check out my presentations on Mostage! #mostage #presentation `;
      const shareTextEncoded = encodeURIComponent(shareText);
      const profileUrlEncoded = encodeURIComponent(profileUrl);

      const urls: Record<typeof platform, string> = {
        twitter: `https://twitter.com/intent/tweet?url=${profileUrlEncoded}&text=${shareTextEncoded}`,
        facebook: `https://www.facebook.com/sharer.php?u=${profileUrl}`,
        linkedin: `https://www.linkedin.com/feed/?shareActive&mini=true&text=${shareTextEncoded}${profileUrlEncoded}`,
      };

      window.open(urls[platform], "_blank", "width=600,height=400");
    },
    [username]
  );

  const handleSharePresentation = useCallback(
    (slug: string, name: string, platform?: SharePlatform) => {
      const presentationUrl = `${window.location.origin}/${username}/${slug}/view`;
      const shareText = `Check out "${name}" presentation on Mostage! #mostage #presentation `;
      const shareTextEncoded = encodeURIComponent(shareText);
      const presentationUrlEncoded = encodeURIComponent(presentationUrl);

      // Handle copy to clipboard
      if (platform === "copy") {
        const fullText = `${shareText}${presentationUrl}`;
        navigator.clipboard.writeText(fullText).then(() => {
          setPresentationLinkCopied(slug);
          setTimeout(
            () => setPresentationLinkCopied(null),
            COPY_FEEDBACK_DURATION
          );
        });
        setShareMenuOpen(null);
        return;
      }

      // Handle social platform sharing
      if (platform) {
        const urls: Record<Exclude<SharePlatform, "copy">, string> = {
          twitter: `https://twitter.com/intent/tweet?url=${presentationUrlEncoded}&text=${shareTextEncoded}`,
          facebook: `https://www.facebook.com/sharer.php?u=${presentationUrlEncoded}`,
          linkedin: `https://www.linkedin.com/feed/?shareActive&mini=true&text=${shareTextEncoded}&url=${presentationUrlEncoded}`,
        };

        window.open(urls[platform], "_blank", "width=600,height=400");
        setShareMenuOpen(null);
        return;
      }

      // Try Web Share API first (works on mobile and some desktop browsers)
      if (navigator.share) {
        navigator
          .share({
            title: `${name} - Mostage`,
            text: shareText,
            url: presentationUrl,
          })
          .catch(() => {
            // User cancelled or error occurred
          });
        setShareMenuOpen(null);
        return;
      }

      // Default: open share menu
      setShareMenuOpen(slug);
    },
    [username]
  );

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuOpen) {
        const menuElement = shareMenuRefs.current[shareMenuOpen];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setShareMenuOpen(null);
        }
      }
    };

    if (shareMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [shareMenuOpen]);

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

  if (userNotFound && !isOwnProfile) {
    return (
      <NotFoundPage
        title="User Not Found"
        message={`The user "${username}" does not exist.`}
        primaryAction={{
          label: "Go to Home",
          href: "/",
        }}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <ProfileCard
              username={username}
              isOwnProfile={isOwnProfile}
              user={user}
              profileUser={profileUser}
              gravatarUrl={gravatarUrl}
              isEditingName={isEditingName}
              editedName={editedName}
              isSavingName={isSavingName}
              profileError={profileError}
              profileSuccess={profileSuccess}
              showUpgradeMessage={showUpgradeMessage}
              onStartEditName={handleStartEditName}
              onCancelEditName={handleCancelEditName}
              onSaveName={handleSaveName}
              onNameChange={setEditedName}
              onChangePlan={handleChangePlan}
              onGravatarError={() => setGravatarUrl(null)}
            />

            {/* Share Profile Box - only for own profile */}
            {isOwnProfile && (
              <ShareProfileBox
                linkCopied={linkCopied}
                onCopyLink={handleCopyLink}
                onShare={handleShare}
              />
            )}
          </div>

          {/* Right Content - Presentations */}
          <div className="flex-1 min-w-0">
            <PresentationsGrid
              presentations={displayedPresentations}
              username={username}
              isOwnProfile={isOwnProfile}
              shareMenuOpen={shareMenuOpen}
              presentationLinkCopied={presentationLinkCopied}
              onShare={handleSharePresentation}
              onView={handleOpenViewPopup}
              onEdit={handleOpenEditModal}
              onDelete={openDeleteModal}
              menuRefs={shareMenuRefs.current}
            />

            {/* Shared Presentations - only for own profile */}
            {isOwnProfile && (
              <>
                <SharedPresentationsGrid
                  presentations={sharedPresentations}
                  username={username}
                  shareMenuOpen={shareMenuOpen}
                  presentationLinkCopied={presentationLinkCopied}
                  onShare={handleSharePresentation}
                  onView={handleOpenViewPopup}
                  onEdit={handleOpenEditModal}
                  onDelete={openDeleteModal}
                  menuRefs={shareMenuRefs.current}
                />

                {/* Templates */}
                <TemplatesGrid
                  templates={templates}
                  username={username}
                  shareMenuOpen={shareMenuOpen}
                  presentationLinkCopied={presentationLinkCopied}
                  onShare={handleSharePresentation}
                  onView={handleOpenViewPopup}
                  onEdit={handleOpenEditModal}
                  onDelete={openDeleteModal}
                  menuRefs={shareMenuRefs.current}
                />
              </>
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
