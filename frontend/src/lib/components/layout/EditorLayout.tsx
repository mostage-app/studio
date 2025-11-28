"use client";

/**
 * EditorLayout Component
 *
 * The editor layout without header (header is in root layout).
 * Manages the responsive split-pane layout and presentation configuration.
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
import {
  type LayoutMode,
  type LayoutModeConfig,
  LAYOUT_MODES,
} from "@/lib/common/LayoutModeToggle";
import { ExportModal } from "@/features/export/components/ExportModal";
import { ImportModal } from "@/features/import/components/ImportModal";
import { MobileWarning } from "@/lib/components/ui";
import { subscribeToLayoutMode, openAuthModal } from "./GlobalHeader";
import React, { useState, useCallback, useEffect } from "react";
import { FileText } from "lucide-react";
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
const COLLAPSE_THRESHOLD = 5;
const MIN_PANE_SIZE = 15;
const MAX_PANE_SIZE = 75;
const DEFAULT_EDITOR_PANE_SIZE = 25;
const DEFAULT_SETTINGS_PANE_SIZE = 20;
const DEFAULT_MOBILE_PANE_SIZE = 40;

export const EditorLayout: React.FC<EditorProps> = ({
  markdown,
  onChange,
  showEditor,
  showPreview,
  editingSlide,
  updateEditingSlide,
  presentation,
  onPresentationUpdate,
}) => {
  // Modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Split pane states
  const [isEditorPaneCollapsed, setIsEditorPaneCollapsed] = useState(false);
  const [editorPaneSize, setEditorPaneSize] = useState<number>(
    DEFAULT_EDITOR_PANE_SIZE
  );
  const [settingsPaneSize, setSettingsPaneSize] = useState<number>(
    DEFAULT_SETTINGS_PANE_SIZE
  );
  const [isSettingsPaneCollapsed, setIsSettingsPaneCollapsed] = useState(false);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Presentation configuration
  const {
    config: presentationConfig,
    updateConfig: setPresentationConfig,
    setConfig,
  } = usePresentation();

  // Initialize config from presentation data
  useEffect(() => {
    if (presentation?.config) {
      setConfig(presentation.config as unknown as PresentationConfig);
    }
  }, [presentation, setConfig]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setEditorPaneSize(DEFAULT_MOBILE_PANE_SIZE);
      } else {
        setEditorPaneSize(DEFAULT_EDITOR_PANE_SIZE);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Subscribe to layout mode changes from GlobalHeader
  useEffect(() => {
    const unsubscribe = subscribeToLayoutMode((mode: LayoutMode) => {
      if (isMobile) return;
      const config = LAYOUT_MODES.find((m) => m.mode === mode);
      if (!config) return;
      applyLayoutMode(config);
    });
    return unsubscribe;
  }, [isMobile]);

  const applyLayoutMode = useCallback(
    (config: LayoutModeConfig) => {
      const editorDefaultSize = isMobile
        ? DEFAULT_MOBILE_PANE_SIZE
        : DEFAULT_EDITOR_PANE_SIZE;

      if (config.editorOpen) {
        setEditorPaneSize(editorDefaultSize);
        setIsEditorPaneCollapsed(false);
      } else {
        setEditorPaneSize(0);
        setIsEditorPaneCollapsed(true);
      }

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

  const handleEditorPaneSizeChange = useCallback((newSize: number) => {
    setEditorPaneSize(newSize);
    setIsEditorPaneCollapsed(newSize <= COLLAPSE_THRESHOLD);
  }, []);

  const handleSettingsPaneSizeChange = useCallback((newSize: number) => {
    setSettingsPaneSize(newSize);
    setIsSettingsPaneCollapsed(newSize <= COLLAPSE_THRESHOLD);
  }, []);

  const handleEditorPaneCollapseToggle = useCallback(() => {
    if (isEditorPaneCollapsed || editorPaneSize <= COLLAPSE_THRESHOLD) {
      const defaultSize = isMobile
        ? DEFAULT_MOBILE_PANE_SIZE
        : DEFAULT_EDITOR_PANE_SIZE;
      setEditorPaneSize(defaultSize);
      setIsEditorPaneCollapsed(false);
    } else {
      setEditorPaneSize(0);
      setIsEditorPaneCollapsed(true);
    }
  }, [editorPaneSize, isMobile, isEditorPaneCollapsed]);

  const handleSettingsPaneCollapseToggle = useCallback(() => {
    if (isSettingsPaneCollapsed || settingsPaneSize <= COLLAPSE_THRESHOLD) {
      setSettingsPaneSize(DEFAULT_SETTINGS_PANE_SIZE);
      setIsSettingsPaneCollapsed(false);
    } else {
      setSettingsPaneSize(0);
      setIsSettingsPaneCollapsed(true);
    }
  }, [settingsPaneSize, isSettingsPaneCollapsed]);

  const handleOpenAuthModal = useCallback(() => {
    openAuthModal();
  }, []);

  const handleOpenImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleOpenExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleExport = useCallback(
    async (format: string) => {
      try {
        const options = { theme: presentationConfig.theme };
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
        if (!validation.valid) throw new Error(validation.error);

        const result = await handleFileImportWithConfig(file);
        if (result.content) onChange(result.content, true);
        if (result.config)
          setPresentationConfig(result.config as unknown as PresentationConfig);
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
        for (const file of files) {
          const validation = validateFile(file);
          if (!validation.valid) throw new Error(validation.error);
        }

        const result = await handleMultipleFilesImport(files);
        if (result.content) onChange(result.content, true);
        if (result.config)
          setPresentationConfig(result.config as unknown as PresentationConfig);
        setShowImportModal(false);
      } catch (error) {
        console.error("Import failed:", error);
      }
    },
    [onChange, setPresentationConfig]
  );

  const renderSplitPaneContent = () => {
    if (isMobile) {
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
          <div className="h-full border-b border-gray-200 dark:border-gray-700">
            <ContentPreview
              markdown={markdown}
              config={presentationConfig}
              editingSlide={editingSlide}
              onOpenAuthModal={handleOpenAuthModal}
              onOpenImportModal={handleOpenImportModal}
              onOpenExportModal={handleOpenExportModal}
              presentation={presentation}
              onPresentationUpdate={onPresentationUpdate}
            />
          </div>
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
        <div className="relative h-full border-r border-gray-200 dark:border-gray-700">
          <ContentEditor
            value={markdown}
            onChange={onChange}
            onOpenAuthModal={handleOpenAuthModal}
            onOpenExportModal={handleOpenExportModal}
            updateEditingSlide={updateEditingSlide}
          />
        </div>
        <div className="h-full">
          <ResizableSplitPane
            controlledSize={
              isSettingsPaneCollapsed ? 100 : 100 - settingsPaneSize
            }
            onSizeChange={(previewPaneSize: number) => {
              const newSettingsPaneSize = 100 - previewPaneSize;
              handleSettingsPaneSizeChange(newSettingsPaneSize);
            }}
            minSize={100 - MAX_PANE_SIZE}
            maxSize={100 - MIN_PANE_SIZE}
            direction="horizontal"
            className="h-full"
            enableSnap={true}
            collapseControl={{
              isCollapsed: isSettingsPaneCollapsed,
              onToggle: handleSettingsPaneCollapseToggle,
              pane: "second",
            }}
          >
            <div className="h-full border-r border-gray-200 dark:border-gray-700">
              <ContentPreview
                markdown={markdown}
                config={presentationConfig}
                editingSlide={editingSlide}
                onOpenAuthModal={handleOpenAuthModal}
                onOpenImportModal={handleOpenImportModal}
                onOpenExportModal={handleOpenExportModal}
                presentation={presentation}
                onPresentationUpdate={onPresentationUpdate}
              />
            </div>
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
          onOpenAuthModal={handleOpenAuthModal}
          onOpenImportModal={handleOpenImportModal}
          onOpenExportModal={handleOpenExportModal}
          presentation={presentation}
          onPresentationUpdate={onPresentationUpdate}
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
    if (showEditor && showPreview) return renderSplitPaneContent();
    if (showEditor) return renderEditorOnly();
    if (showPreview) return renderPreviewOnly();
    return renderEmptyState();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-hidden">{renderMainContent()}</div>

      {/* Modals */}
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

      <MobileWarning />
    </div>
  );
};
