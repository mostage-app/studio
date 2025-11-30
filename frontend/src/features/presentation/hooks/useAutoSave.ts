import { useEffect, useRef, useCallback, useState } from "react";
import { PresentationConfig } from "../types/presentation.types";

export interface AutoSaveOptions {
  markdown: string;
  config: PresentationConfig;
  originalMarkdown: string;
  originalConfig: PresentationConfig;
  onSave: (markdown: string, config: PresentationConfig) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

export interface UseAutoSaveReturn extends AutoSaveState {
  saveNow: () => Promise<void>; // Manual save function
}

/**
 * Custom hook for auto-saving presentation content and config
 * Checks for changes every N seconds and saves if there are unsaved changes
 */
export function useAutoSave({
  markdown,
  config,
  originalMarkdown,
  originalConfig,
  onSave,
  debounceMs = 30000, // 30 seconds default
  enabled = true,
}: AutoSaveOptions): UseAutoSaveReturn {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedMarkdownRef = useRef(originalMarkdown);
  const lastSavedConfigRef = useRef(originalConfig);

  // Check if content has changed
  const hasChanges = useCallback(() => {
    const markdownChanged =
      markdown !== lastSavedMarkdownRef.current &&
      markdown !== originalMarkdown;
    const configChanged =
      JSON.stringify(config) !== JSON.stringify(lastSavedConfigRef.current) &&
      JSON.stringify(config) !== JSON.stringify(originalConfig);

    return markdownChanged || configChanged;
  }, [markdown, config, originalMarkdown, originalConfig]);

  // Save function
  const performSave = useCallback(
    async (force = false) => {
      if (!enabled || isSavingRef.current) return;

      // Check if there are actual changes (unless forced)
      if (!force && !hasChanges()) {
        setState((prev) => ({
          ...prev,
          hasUnsavedChanges: false,
        }));
        return;
      }

      isSavingRef.current = true;
      setState((prev) => ({
        ...prev,
        isSaving: true,
        error: null,
        hasUnsavedChanges: true,
      }));

      try {
        await onSave(markdown, config);
        lastSavedMarkdownRef.current = markdown;
        lastSavedConfigRef.current = config;

        setState({
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
          error: null,
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : "Failed to save",
          hasUnsavedChanges: true,
        }));
      } finally {
        isSavingRef.current = false;
      }
    },
    [enabled, markdown, config, onSave, hasChanges]
  );

  // Auto-save effect with debounce
  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Update unsaved changes state
    setState((prev) => ({
      ...prev,
      hasUnsavedChanges: hasChanges(),
    }));

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [markdown, config, enabled, debounceMs, performSave, hasChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Manual save function (can be called externally)
  const saveNow = useCallback(async () => {
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // Force save immediately (bypass change check)
    await performSave(true);
  }, [performSave]);

  return {
    ...state,
    saveNow,
  };
}
