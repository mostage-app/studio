"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { useCookieConsentContext } from "@/lib/components/CookieConsentProvider";
import { UIThemeToggle } from "@/lib/common/UIThemeToggle";
import {
  LayoutModeToggle,
  type LayoutMode,
} from "@/lib/common/LayoutModeToggle";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { AccountModal } from "@/features/auth/components/AccountModal";
import { AboutModal } from "@/features/app-info/components/AboutModal";
import { OnboardingTour } from "@/lib/components/ui";
import { tourSteps } from "@/lib/config/tour.config";
import logo from "@/assets/images/logo.svg";
import {
  User,
  Info,
  Plus,
  LogOut,
  UserCircle,
  LayoutDashboard,
  ChevronDown,
  Settings,
  HelpCircle,
  Heart,
} from "lucide-react";

interface AppHeaderProps {
  showLayoutToggle?: boolean;
  onStartTour?: () => void;
  onOpenNewSampleModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showLayoutToggle = false,
  onStartTour,
  onOpenNewSampleModal,
}) => {
  // Auth
  const { isAuthenticated, logout } = useAuthContext();
  const { resetConsent } = useCookieConsentContext();

  // Dropdown menu state
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Layout mode state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(2);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Tour state
  const [showTour, setShowTour] = useState(false);

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

  // Handle tour close
  const handleTourClose = useCallback(() => {
    setShowTour(false);
    localStorage.setItem("tour-completed-v1", "true");
  }, []);

  // Handle starting tour
  const handleStartTour = useCallback(() => {
    setShowTour(true);
    setShowMenuDropdown(false);
    if (onStartTour) {
      onStartTour();
    }
  }, [onStartTour]);

  // Event handlers
  const handleOpenAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleOpenAboutModal = useCallback(() => {
    setShowAboutModal(true);
  }, []);

  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b border-input bg-muted">
        <div className="flex items-center gap-3">
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
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {onOpenNewSampleModal ? (
              <button
                onClick={onOpenNewSampleModal}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-secondary border border-input rounded-md transition-colors"
                title="New presentation"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-secondary border border-input rounded-md transition-colors"
                title="New presentation"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-foreground bg-background hover:bg-secondary border border-input rounded-md transition-colors"
                title="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            <div className="hidden sm:block w-px h-6 bg-input mx-2" />

            {showLayoutToggle && (
              <>
                <LayoutModeToggle
                  layoutMode={layoutMode}
                  onLayoutModeChange={handleLayoutModeChange}
                  isMobile={isMobile}
                />

                <UIThemeToggle />

                <div className="hidden sm:block w-px h-6 bg-input mx-2" />
              </>
            )}

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
                    onClick={() => {
                      handleStartTour();
                      setShowMenuDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Onboarding Tour</span>
                  </button>
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span>About</span>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-card-foreground bg-card border border-input rounded-sm hover:bg-secondary cursor-pointer focus:outline-none transition-colors"
                  title="Account"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-card-foreground bg-card border border-input rounded-sm hover:bg-secondary cursor-pointer focus:outline-none transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
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
        </div>
      </div>

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

      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        isActive={showTour}
        onClose={handleTourClose}
      />
    </>
  );
};
