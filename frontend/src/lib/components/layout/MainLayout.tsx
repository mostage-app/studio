"use client";

/**
 * MainLayout Component
 *
 * The main layout component that provides the core structure for the Mostage App application.
 * It manages the responsive split-pane layout, modal states, and presentation configuration.
 *
 * Features:
 * - Responsive layout that adapts to mobile and desktop screens
 * - Resizable split-pane with configurable minimum and maximum sizes
 * - Collapsible sidebar with smart collapse detection
 * - Modal management for authentication, export, import, and app info
 * - Mobile warning system for optimal user experience
 * - Theme support with light/dark mode toggle
 *
 * Layout Behavior:
 * - Desktop: Horizontal split (Editor | Preview | Settings)
 * - Mobile: Vertical split (Preview | Editor+Settings)
 *
 * Constants:
 * - COLLAPSE_THRESHOLD: 5% - Threshold for detecting collapsed state
 * - MIN_PANE_SIZE: 15% - Minimum allowed pane size (prevents unusable small panes)
 * - MAX_PANE_SIZE: 75% - Maximum allowed pane size (ensures both panes remain visible)
 * - DEFAULT_EDITOR_PANE_SIZE: 30% - Default Editor pane size (desktop)
 * - DEFAULT_SETTINGS_PANE_SIZE: 25% - Default Settings pane size (desktop)
 * - DEFAULT_MOBILE_PANE_SIZE: 40% - Default pane size for mobile
 *
 * @component
 * @returns {JSX.Element} The main layout component
 */

import { EditorProps } from "@/features/editor/types/editor.types";
import { PresentationConfig } from "@/features/presentation/types/presentation.types";
import { ContentEditor } from "@/features/editor/components/ContentEditor";
import { ContentPreview } from "@/features/presentation/components/ContentPreview";
import { PresentationSettings } from "@/features/presentation/components/PresentationSettings";
import {
  usePresentation,
  DEFAULT_PRESENTATION_CONFIG,
} from "@/features/presentation/hooks/usePresentation";
import { ResizableSplitPane } from "@/lib/components/layout/ResizableSplitPane";
import { UIThemeToggle } from "@/lib/common/UIThemeToggle";
import {
  LayoutModeToggle,
  type LayoutMode,
  type LayoutModeConfig,
  LAYOUT_MODES,
} from "@/lib/common/LayoutModeToggle";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { AccountModal } from "@/features/auth/components/AccountModal";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { AboutModal } from "@/features/app-info/components/AboutModal";
import { ExportModal } from "@/features/export/components/ExportModal";
import { ImportModal } from "@/features/import/components/ImportModal";
import { NewSampleModal } from "@/features/editor/components/NewSampleModal";
import { MobileWarning, OnboardingTour } from "@/lib/components/ui";
import { tourSteps } from "@/lib/config/tour.config";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.svg";
import {
  FileText,
  Download,
  Upload,
  User,
  Info,
  Plus,
  LogOut,
  UserCircle,
} from "lucide-react";
import {
  exportToHTML,
  exportToPDF,
  exportToMostage,
  exportToPPTX,
  exportToJPG,
  exportConfig,
  exportContent,
} from "@/features/export/services/exportUtils";
import {
  handleFileImportWithConfig,
  handleMultipleFilesImport,
  validateFile,
} from "@/features/import/services/importUtils";

// Pane sizing constants
const COLLAPSE_THRESHOLD = 5; // Percentage threshold for detecting collapsed state
const MIN_PANE_SIZE = 15; // Minimum allowed pane size percentage
const MAX_PANE_SIZE = 75; // Maximum allowed pane size percentage

// Desktop pane defaults
const DEFAULT_EDITOR_PANE_SIZE = 25; // Default Editor pane size (left, desktop)
const DEFAULT_SETTINGS_PANE_SIZE = 20; // Default Settings pane size (right, desktop)

// Mobile pane defaults
const DEFAULT_MOBILE_PANE_SIZE = 40; // Default pane size for mobile (vertical layout)

export const MainLayout: React.FC<EditorProps> = ({
  markdown,
  onChange,
  showEditor,
  showPreview,
  editingSlide,
  updateEditingSlide,
}) => {
  // Auth
  const { isAuthenticated, logout } = useAuthContext();

  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewSampleModal, setShowNewSampleModal] = useState(false);

  // Split pane states
  const [isEditorPaneCollapsed, setIsEditorPaneCollapsed] = useState(false);
  const [editorPaneSize, setEditorPaneSize] = useState<number>(
    DEFAULT_EDITOR_PANE_SIZE // Will be updated based on screen size in useEffect
  );
  const [settingsPaneSize, setSettingsPaneSize] = useState<number>(
    DEFAULT_SETTINGS_PANE_SIZE
  );
  const [isSettingsPaneCollapsed, setIsSettingsPaneCollapsed] = useState(false);

  // Layout mode state - Default: All panels open
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(2);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Presentation configuration
  const { config: presentationConfig, updateConfig: setPresentationConfig } =
    usePresentation();

  // Tour state
  const [showTour, setShowTour] = useState(false);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Set appropriate default pane size based on screen size
      if (mobile) {
        setEditorPaneSize(DEFAULT_MOBILE_PANE_SIZE);
      } else {
        setEditorPaneSize(DEFAULT_EDITOR_PANE_SIZE);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if tour should be shown on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("tour-completed-v1");
    if (!hasSeenTour) {
      // Delay tour start slightly to ensure DOM is ready
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle tour close
  const handleTourClose = useCallback(() => {
    setShowTour(false);
    localStorage.setItem("tour-completed-v1", "true");
  }, []);

  // Handle starting tour from About modal
  const handleStartTour = useCallback(() => {
    setShowTour(true);
  }, []);

  // Event handlers for Editor pane (left on desktop, bottom on mobile)
  const handleEditorPaneSizeChange = useCallback((newSize: number) => {
    setEditorPaneSize(newSize);
    // Update collapsed state based on new size
    setIsEditorPaneCollapsed(newSize <= COLLAPSE_THRESHOLD);
  }, []);

  // Event handlers for Settings pane (right on desktop)
  const handleSettingsPaneSizeChange = useCallback((newSize: number) => {
    setSettingsPaneSize(newSize);
    // Update collapsed state based on new size
    setIsSettingsPaneCollapsed(newSize <= COLLAPSE_THRESHOLD);
  }, []);

  const handleEditorPaneCollapseToggle = useCallback(() => {
    if (isEditorPaneCollapsed || editorPaneSize <= COLLAPSE_THRESHOLD) {
      // Expand panel to appropriate default size
      const defaultSize = isMobile
        ? DEFAULT_MOBILE_PANE_SIZE
        : DEFAULT_EDITOR_PANE_SIZE;
      setEditorPaneSize(defaultSize);
      setIsEditorPaneCollapsed(false);
    } else {
      // Collapse panel
      setEditorPaneSize(0);
      setIsEditorPaneCollapsed(true);
    }
  }, [editorPaneSize, isMobile, isEditorPaneCollapsed]);

  const handleSettingsPaneCollapseToggle = useCallback(() => {
    if (isSettingsPaneCollapsed || settingsPaneSize <= COLLAPSE_THRESHOLD) {
      // Expand panel to default size
      setSettingsPaneSize(DEFAULT_SETTINGS_PANE_SIZE);
      setIsSettingsPaneCollapsed(false);
    } else {
      // Collapse panel
      setSettingsPaneSize(0);
      setIsSettingsPaneCollapsed(true);
    }
  }, [settingsPaneSize, isSettingsPaneCollapsed]);

  /**
   * Apply layout mode configuration
   */
  const applyLayoutMode = useCallback(
    (config: LayoutModeConfig) => {
      const editorDefaultSize = isMobile
        ? DEFAULT_MOBILE_PANE_SIZE
        : DEFAULT_EDITOR_PANE_SIZE;

      // Configure Editor pane
      if (config.editorOpen) {
        setEditorPaneSize(editorDefaultSize);
        setIsEditorPaneCollapsed(false);
      } else {
        setEditorPaneSize(0);
        setIsEditorPaneCollapsed(true);
      }

      // Configure Settings pane
      if (config.settingsOpen) {
        setSettingsPaneSize(DEFAULT_SETTINGS_PANE_SIZE);
        setIsSettingsPaneCollapsed(false);
      } else {
        setSettingsPaneSize(0);
        setIsSettingsPaneCollapsed(true);
      }
    },
    [isMobile]
  );

  /**
   * Handle layout mode change
   */
  const handleLayoutModeChange = useCallback(
    (mode: LayoutMode) => {
      if (isMobile) return; // Only work on desktop

      const config = LAYOUT_MODES.find((m) => m.mode === mode);
      if (!config) return;

      setLayoutMode(mode);
      applyLayoutMode(config);
    },
    [isMobile, applyLayoutMode]
  );

  const handleOpenAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleOpenExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleOpenAboutModal = useCallback(() => {
    setShowAboutModal(true);
  }, []);

  const handleOpenImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleOpenNewSampleModal = useCallback(() => {
    setShowNewSampleModal(true);
  }, []);

  const handleLoadSample = useCallback(async () => {
    // TODO: Use the sample loader service and API
    const [content, config] = await Promise.all([
      fetch("/samples/basic/content.md").then((r) => r.text()),
      fetch("/samples/basic/config.json").then((r) => r.json()),
    ]);
    onChange(content, true); // Reset slide for sample load
    setPresentationConfig(config);
  }, [onChange, setPresentationConfig]);

  const handleNewPresentation = useCallback(() => {
    onChange("", true); // Reset slide for new presentation
    setPresentationConfig(DEFAULT_PRESENTATION_CONFIG);
  }, [onChange, setPresentationConfig]);

  const handleExport = useCallback(
    async (format: string) => {
      try {
        const options = {
          theme: presentationConfig.theme,
        };

        const config = presentationConfig as unknown as Record<string, unknown>;

        switch (format) {
          case "config":
            await exportConfig(config, options);
            break;
          case "content":
            await exportContent(markdown, options);
            break;
          case "mostage":
            await exportToMostage(markdown, config, options);
            break;
          case "html":
            await exportToHTML(markdown, config, options);
            break;
          case "pdf":
            await exportToPDF(markdown, config, options);
            break;
          case "pptx":
            await exportToPPTX(markdown, config);
            break;
          case "jpg":
            await exportToJPG(markdown, config);
            break;
          default:
            console.error("Unknown export format:", format);
        }

        setShowExportModal(false);
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [markdown, presentationConfig]
  );

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const result = await handleFileImportWithConfig(file);

        // Update content if available
        if (result.content) {
          onChange(result.content, true); // Reset slide for import
        }

        // Update config if available
        if (result.config) {
          setPresentationConfig(result.config as unknown as PresentationConfig);
        }

        setShowImportModal(false);
      } catch (error) {
        console.error("Import failed:", error);
      }
    },
    [onChange, setPresentationConfig]
  );

  const handleImportMultiple = useCallback(
    async (files: File[]) => {
      try {
        // Validate all files
        for (const file of files) {
          const validation = validateFile(file);
          if (!validation.valid) {
            throw new Error(validation.error);
          }
        }

        const result = await handleMultipleFilesImport(files);

        // Update content if available
        if (result.content) {
          onChange(result.content, true); // Reset slide for import
        }

        // Update config if available
        if (result.config) {
          setPresentationConfig(result.config as unknown as PresentationConfig);
        }

        setShowImportModal(false);
      } catch (error) {
        console.error("Import failed:", error);
      }
    },
    [onChange, setPresentationConfig]
  );

  // Render helpers
  const renderToolbar = () => (
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
            href="https://mostage.app/"
            className="text-sm sm:text-lg md:text-3xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Mostage
          </Link>
          <span className="px-6  text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
            Presentation Framework
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewSampleModal}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-secondary border border-input rounded-md transition-colors"
            title="New presentation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          <div className="hidden sm:block w-px h-6 bg-input mx-2" />

          <button
            onClick={handleOpenImportModal}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-foreground bg-background hover:bg-secondary border border-input rounded-md transition-colors"
            title="Upload presentation"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            onClick={handleOpenExportModal}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-foreground bg-background hover:bg-secondary border border-input rounded-md transition-colors"
            title="Download presentation"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <div className="hidden sm:block w-px h-6 bg-input mx-2" />

          <LayoutModeToggle
            layoutMode={layoutMode}
            onLayoutModeChange={handleLayoutModeChange}
            isMobile={isMobile}
          />

          <UIThemeToggle />

          <div className="hidden sm:block w-px h-6 bg-input mx-2" />

          <button
            onClick={handleOpenAboutModal}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-card-foreground bg-card border border-input rounded-sm hover:bg-secondary cursor-pointer focus:outline-none transition-colors"
            title="About Mostage App"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">About</span>
          </button>
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
  );

  const renderSplitPaneContent = () => {
    if (isMobile) {
      // Mobile Layout: Preview on top, Settings+Editor on bottom
      return (
        <ResizableSplitPane
          controlledSize={isEditorPaneCollapsed ? 0 : editorPaneSize}
          onSizeChange={handleEditorPaneSizeChange}
          minSize={MIN_PANE_SIZE}
          maxSize={MAX_PANE_SIZE}
          direction="vertical"
          className="h-full"
          enableSnap={true}
          collapseControl={{
            isCollapsed: isEditorPaneCollapsed,
            onToggle: handleEditorPaneCollapseToggle,
            pane: "first",
          }}
        >
          {/* Top Pane: Live Preview (Mobile) */}
          <div className="h-full border-b border-gray-200 dark:border-gray-700">
            <ContentPreview
              markdown={markdown}
              config={presentationConfig}
              editingSlide={editingSlide}
            />
          </div>

          {/* Bottom Pane: Presentation Settings + Content Editor (Mobile) */}
          <div className="relative h-full overflow-y-auto">
            <div className="flex flex-col h-full min-h-0">
              <PresentationSettings
                config={presentationConfig}
                onConfigChange={setPresentationConfig}
              />
              <ContentEditor
                value={markdown}
                onChange={onChange}
                onOpenAuthModal={handleOpenAuthModal}
                onOpenExportModal={handleOpenExportModal}
                updateEditingSlide={updateEditingSlide}
              />
            </div>
          </div>
        </ResizableSplitPane>
      );
    }

    // Desktop Layout: Editor on left, Preview in middle, Settings on right
    return (
      <ResizableSplitPane
        controlledSize={isEditorPaneCollapsed ? 0 : editorPaneSize}
        onSizeChange={handleEditorPaneSizeChange}
        minSize={MIN_PANE_SIZE}
        maxSize={MAX_PANE_SIZE}
        direction="horizontal"
        className="h-full"
        enableSnap={true}
        collapseControl={{
          isCollapsed: isEditorPaneCollapsed,
          onToggle: handleEditorPaneCollapseToggle,
          pane: "first",
        }}
      >
        {/* Left Pane: Content Editor */}
        <div className="relative h-full border-r border-gray-200 dark:border-gray-700">
          <ContentEditor
            value={markdown}
            onChange={onChange}
            onOpenAuthModal={handleOpenAuthModal}
            onOpenExportModal={handleOpenExportModal}
            updateEditingSlide={updateEditingSlide}
          />
        </div>

        {/* Right Pane: Preview + Settings Split */}
        <div className="h-full">
          <ResizableSplitPane
            controlledSize={
              isSettingsPaneCollapsed ? 100 : 100 - settingsPaneSize
            }
            onSizeChange={(previewPaneSize: number) => {
              // ResizableSplitPane reports the size of the first pane (Preview)
              // Convert to the size of the second pane (Settings)
              const newSettingsPaneSize = 100 - previewPaneSize;
              handleSettingsPaneSizeChange(newSettingsPaneSize);
            }}
            // Convert Settings pane min/max to Preview pane min/max
            // If Settings min is 15%, Preview max is 85% (100 - 15)
            // If Settings max is 75%, Preview min is 25% (100 - 75)
            minSize={100 - MAX_PANE_SIZE} // Preview min = 100 - Settings max
            maxSize={100 - MIN_PANE_SIZE} // Preview max = 100 - Settings min
            direction="horizontal"
            className="h-full"
            enableSnap={true}
            collapseControl={{
              isCollapsed: isSettingsPaneCollapsed,
              onToggle: handleSettingsPaneCollapseToggle,
              pane: "second",
            }}
          >
            {/* Middle Pane: Live Preview */}
            <div className="h-full border-r border-gray-200 dark:border-gray-700">
              <ContentPreview
                markdown={markdown}
                config={presentationConfig}
                editingSlide={editingSlide}
              />
            </div>

            {/* Right Pane: Presentation Settings */}
            <div className="relative h-full overflow-y-auto bg-muted">
              <PresentationSettings
                config={presentationConfig}
                onConfigChange={setPresentationConfig}
              />
            </div>
          </ResizableSplitPane>
        </div>
      </ResizableSplitPane>
    );
  };

  const renderEditorOnly = () => (
    <div className="h-full flex flex-col">
      <PresentationSettings
        config={presentationConfig}
        onConfigChange={setPresentationConfig}
      />
      <div className="min-h-[400px] h-full flex-1 flex-shrink-0">
        <ContentEditor
          value={markdown}
          onChange={onChange}
          onOpenAuthModal={handleOpenAuthModal}
          onOpenExportModal={handleOpenExportModal}
          updateEditingSlide={updateEditingSlide}
        />
      </div>
    </div>
  );

  const renderPreviewOnly = () => (
    <div className="h-full flex">
      <div className="flex-1">
        <ContentPreview
          markdown={markdown}
          config={presentationConfig}
          editingSlide={editingSlide}
        />
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
      <div className="text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Select a view to get started</p>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (showEditor && showPreview) {
      return renderSplitPaneContent();
    }

    if (showEditor) {
      return renderEditorOnly();
    }

    if (showPreview) {
      return renderPreviewOnly();
    }

    return renderEmptyState();
  };

  return (
    <div className="h-full flex flex-col">
      {renderToolbar()}

      <div className="flex-1 overflow-hidden">{renderMainContent()}</div>

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

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        onImportMultiple={handleImportMultiple}
      />

      <NewSampleModal
        isOpen={showNewSampleModal}
        onClose={() => setShowNewSampleModal(false)}
        onNew={handleNewPresentation}
        onSample={handleLoadSample}
        hasExistingContent={markdown.trim().length > 0}
      />

      {/* Mobile Warning */}
      <MobileWarning />

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        isActive={showTour}
        onClose={handleTourClose}
      />
    </div>
  );
};
