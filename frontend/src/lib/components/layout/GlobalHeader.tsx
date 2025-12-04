"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { useCookieConsentContext } from "@/lib/components/CookieConsentProvider";
import { UIThemeToggle } from "@/lib/common/UIThemeToggle";
import {
  LayoutModeToggle,
  type LayoutMode,
} from "@/lib/common/LayoutModeToggle";
import { SaveButton } from "@/lib/common/SaveButton";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { AboutModal } from "@/features/app-info/components/AboutModal";
import { NewPresentationModal } from "@/features/editor/components/NewPresentationModal";
import { LoginRequiredModal } from "@/features/editor/components/LoginRequiredModal";
import { OnboardingTour } from "@/lib/components/ui";
import { Modal } from "@/lib/components/ui/Modal";
import { tourSteps } from "@/lib/config/tour.config";
import { getPresentations } from "@/features/presentation/services/presentationService";
import logo from "@/assets/images/logo.svg";
import {
  User,
  Info,
  Plus,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Settings,
  HelpCircle,
  Heart,
  Bug,
  Sparkles,
} from "lucide-react";

export interface LayoutModeHandler {
  onLayoutModeChange?: (mode: LayoutMode) => void;
}

// Global event for layout mode changes
const layoutModeListeners = new Set<(mode: LayoutMode) => void>();

export function subscribeToLayoutMode(
  callback: (mode: LayoutMode) => void
): () => void {
  layoutModeListeners.add(callback);
  return () => layoutModeListeners.delete(callback);
}

function emitLayoutModeChange(mode: LayoutMode) {
  layoutModeListeners.forEach((cb) => cb(mode));
}

// Global event for opening auth modal
const authModalListeners = new Set<() => void>();

export function subscribeToAuthModal(callback: () => void): () => void {
  authModalListeners.add(callback);
  return () => authModalListeners.delete(callback);
}

export function openAuthModal() {
  authModalListeners.forEach((cb) => cb());
}

// Global event for login required modal
const loginRequiredModalListeners = new Set<() => void>();

export function subscribeToLoginRequiredModal(
  callback: () => void
): () => void {
  loginRequiredModalListeners.add(callback);
  return () => loginRequiredModalListeners.delete(callback);
}

export function openLoginRequiredModal() {
  loginRequiredModalListeners.forEach((cb) => cb());
}

// Global event for auto-save state
interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

interface AutoSaveHandlers {
  onManualSave?: () => Promise<void>;
}

const autoSaveStateListeners = new Set<(state: AutoSaveState | null) => void>();
const autoSaveHandlersListeners = new Set<
  (handlers: AutoSaveHandlers | null) => void
>();

export function subscribeToAutoSaveState(
  callback: (state: AutoSaveState | null) => void
): () => void {
  autoSaveStateListeners.add(callback);
  return () => autoSaveStateListeners.delete(callback);
}

export function subscribeToAutoSaveHandlers(
  callback: (handlers: AutoSaveHandlers | null) => void
): () => void {
  autoSaveHandlersListeners.add(callback);
  return () => autoSaveHandlersListeners.delete(callback);
}

export function emitAutoSaveState(state: AutoSaveState | null) {
  autoSaveStateListeners.forEach((cb) => cb(state));
}

export function emitAutoSaveHandlers(handlers: AutoSaveHandlers | null) {
  autoSaveHandlersListeners.forEach((cb) => cb(handlers));
}

/**
 * Helper function to check if current path is a view route
 */
const isViewRoute = (path: string): boolean => {
  return path.endsWith("/view") || path.includes("/view/");
};

export const GlobalHeader: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuthContext();
  const { resetConsent } = useCookieConsentContext();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Determine if we're on an editor page
   * Editor pages: home (/) or /{username}/{slug} without ?mode=view
   * Explicitly exclude /view routes to prevent onboarding from showing in view mode
   */
  const isEditorPage =
    pathname === "/" ||
    (pathname?.match(/^\/[^/]+\/[^/]+$/) &&
      !isViewRoute(pathname) &&
      typeof window !== "undefined" &&
      !new URLSearchParams(window.location.search).has("mode"));

  // Dropdown menu state
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  // Layout mode state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(2);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Tour state - initialize based on current route to prevent flash
   * Always starts as false, will be set by useLayoutEffect if conditions are met
   */
  const [showTour, setShowTour] = useState(false);
  const [tourError, setTourError] = useState<string | null>(null);
  const [isLoadingTour, setIsLoadingTour] = useState(false);

  // Auto-save state
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState | null>(
    null
  );
  const [autoSaveHandlers, setAutoSaveHandlers] =
    useState<AutoSaveHandlers | null>(null);

  // Subscribe to global login required modal events
  useEffect(() => {
    const unsubscribe = subscribeToLoginRequiredModal(() => {
      setShowLoginRequiredModal(true);
    });
    return unsubscribe;
  }, []);

  // Subscribe to auth modal events from other components
  useEffect(() => {
    const unsubscribe = subscribeToAuthModal(() => {
      setShowAuthModal(true);
    });
    return unsubscribe;
  }, []);

  // Subscribe to auto-save state from EditorLayout
  useEffect(() => {
    const unsubscribeState = subscribeToAutoSaveState((state) => {
      setAutoSaveState(state);
    });
    const unsubscribeHandlers = subscribeToAutoSaveHandlers((handlers) => {
      setAutoSaveHandlers(handlers);
    });
    return () => {
      unsubscribeState();
      unsubscribeHandlers();
    };
  }, []);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenuDropdown(false);
      }
    };

    if (showMenuDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenuDropdown]);

  const handleTourClose = useCallback(() => {
    setShowTour(false);
  }, []);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
    localStorage.setItem("tour-completed-v2", "true");
  }, []);

  /**
   * Auto-show tour on first visit (only on editor pages)
   * Uses useLayoutEffect to prevent flash of onboarding (runs synchronously before paint)
   */
  useLayoutEffect(() => {
    // Get current path - prefer window.location.pathname for reliability
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : pathname || "";

    // First check: explicitly prevent onboarding on /view routes
    if (isViewRoute(currentPath)) {
      setShowTour(false);
      return;
    }

    // Only show on editor pages
    if (!isEditorPage) {
      setShowTour(false);
      return;
    }

    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem("tour-completed-v2");
    if (hasSeenTour) {
      setShowTour(false);
      return;
    }

    // All conditions met - show tour
    setShowTour(true);
  }, [isEditorPage, pathname]);

  const handleStartTour = useCallback(async () => {
    setShowMenuDropdown(false);
    setTourError(null);
    setIsLoadingTour(true);

    try {
      if (!isAuthenticated) {
        // Not logged in: navigate to home page if not already there
        if (pathname !== "/") {
          router.push("/");
          // Wait a bit for navigation, then start tour
          setTimeout(() => {
            setShowTour(true);
            setIsLoadingTour(false);
          }, 500);
        } else {
          setShowTour(true);
          setIsLoadingTour(false);
        }
      } else {
        // Logged in
        if (!user?.username) {
          setTourError("User information not available");
          setIsLoadingTour(false);
          return;
        }

        // Check if we're already on an editor page (/{username}/{slug})
        const pathParts = pathname.split("/").filter(Boolean);
        const isOnEditorPage =
          pathParts.length === 2 &&
          pathParts[0] === user.username &&
          pathParts[1] !== undefined;

        // TODO: Allow tour to work on any presentation, not just user's own presentations
        // Currently only works on user's own presentations. Should also work when viewing
        // other users' public presentations in edit mode (if user has edit permissions).

        if (isOnEditorPage) {
          // Already on an editor page, start tour immediately
          setShowTour(true);
          setIsLoadingTour(false);
          return;
        }

        // Not on editor page, navigate to basic-example or first presentation
        try {
          const presentations = await getPresentations(user.username);

          if (presentations.length === 0) {
            setTourError(
              "Please create a presentation first to start the tour"
            );
            setIsLoadingTour(false);
            return;
          }

          // Try to find basic-example first
          const basicExample = presentations.find(
            (p) => p.slug === "basic-example"
          );
          const targetPresentation = basicExample || presentations[0];

          // Navigate to the presentation
          router.push(`/${user.username}/${targetPresentation.slug}`);

          // Wait for navigation, then start tour
          setTimeout(() => {
            setShowTour(true);
            setIsLoadingTour(false);
          }, 500);
        } catch (error) {
          console.error("Error fetching presentations:", error);
          setTourError("Failed to load presentations. Please try again.");
          setIsLoadingTour(false);
        }
      }
    } catch (error) {
      console.error("Error starting tour:", error);
      setTourError("Failed to start tour. Please try again.");
      setIsLoadingTour(false);
    }
  }, [isAuthenticated, user, pathname, router]);

  const handleOpenAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleOpenAboutModal = useCallback(() => {
    setShowAboutModal(true);
  }, []);

  const handleOpenNewModal = useCallback(() => {
    if (isAuthenticated) {
      setShowNewModal(true);
    } else {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    emitLayoutModeChange(mode);
  }, []);

  return (
    <>
      <header className="flex items-center justify-between p-3 border-b border-input bg-muted">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Mostage Logo"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />
          <Link
            href="/"
            className="text-sm sm:text-lg md:text-3xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Mostage
          </Link>
          <span className="px-6 text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
            Presentation Framework
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status and Button - only on editor pages */}
          {isEditorPage && (
            <>
              <SaveButton
                autoSaveState={autoSaveState}
                autoSaveHandlers={autoSaveHandlers}
                isAuthenticated={isAuthenticated}
                onLoginRequired={() => setShowLoginRequiredModal(true)}
              />
              <div className="hidden sm:block w-px h-6 bg-input mx-1" />
            </>
          )}

          {/* Layout Toggle - only on editor pages */}
          {isEditorPage && (
            <LayoutModeToggle
              layoutMode={layoutMode}
              onLayoutModeChange={handleLayoutModeChange}
              isMobile={isMobile}
            />
          )}

          {/* Theme Toggle - always visible */}
          <UIThemeToggle />
          <div className="hidden sm:block w-px h-6 bg-input mx-1" />

          {/* New Presentation */}
          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-secondary border border-input rounded-md transition-colors cursor-pointer"
            title="New presentation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Dashboard */}
          {isAuthenticated && user?.username ? (
            <Link
              href={`/${user.username}`}
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-foreground bg-background hover:bg-secondary border border-input rounded-md transition-colors"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : (
            <button
              onClick={handleOpenAuthModal}
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-foreground bg-background hover:bg-secondary border border-input rounded-md transition-colors"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          <div className="hidden sm:block w-px h-6 bg-input mx-1" />

          {/* More Options Dropdown */}
          <div className="relative" ref={menuDropdownRef}>
            <button
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-card-foreground bg-card border border-input rounded-sm hover:bg-secondary cursor-pointer focus:outline-none transition-colors"
              title="More options"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showMenuDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-background border border-input rounded-md shadow-lg z-[100] min-w-[200px]">
                <button
                  onClick={handleStartTour}
                  disabled={isLoadingTour}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>
                    {isLoadingTour ? "Loading..." : "Onboarding Tour"}
                  </span>
                </button>
                <a
                  href="https://github.com/mostage-app/studio/issues/new?template=bug_report.yml"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenuDropdown(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  <span>Bug Report</span>
                </a>
                <a
                  href="https://github.com/mostage-app/studio/issues/new?template=feature_request.yml"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenuDropdown(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Feature Request</span>
                </a>

                <button
                  onClick={() => {
                    resetConsent();
                    setShowMenuDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Privacy Settings</span>
                </button>

                <a
                  href="https://github.com/sponsors/mostage-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenuDropdown(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>Donate</span>
                </a>
                <button
                  onClick={() => {
                    handleOpenAboutModal();
                    setShowMenuDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </button>
              </div>
            )}
          </div>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={async () => {
                await logout();
                window.location.href = "/";
              }}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-card-foreground bg-card border border-input rounded-sm hover:bg-secondary cursor-pointer focus:outline-none transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAuthModal}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-card-foreground bg-card border border-input rounded-sm hover:bg-secondary cursor-pointer focus:outline-none transition-colors"
              title="Sign In / Sign Up"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Modals */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        onStartTour={handleStartTour}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <NewPresentationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
      />

      <LoginRequiredModal
        isOpen={showLoginRequiredModal}
        onClose={() => setShowLoginRequiredModal(false)}
        onOpenAuthModal={() => {
          setShowLoginRequiredModal(false);
          setShowAuthModal(true);
        }}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        isActive={showTour}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
      />

      {/* Tour Error Modal */}
      <Modal
        isOpen={!!tourError}
        onClose={() => setTourError(null)}
        title="Cannot Start Tour"
      >
        <div className="p-6">
          <p className="text-foreground mb-4">{tourError}</p>
          <button
            onClick={() => setTourError(null)}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            OK
          </button>
        </div>
      </Modal>
    </>
  );
};
