"use client";

import { Save, Loader2, Check, AlertCircle } from "lucide-react";

// Auto-save state interface
export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

// Auto-save handlers interface
export interface AutoSaveHandlers {
  onManualSave?: () => Promise<void>;
}

interface SaveButtonProps {
  autoSaveState: AutoSaveState | null;
  autoSaveHandlers: AutoSaveHandlers | null;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

export function SaveButton({
  autoSaveState,
  autoSaveHandlers,
  isAuthenticated,
  onLoginRequired,
}: SaveButtonProps) {
  const handleSaveClick = () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    if (autoSaveHandlers?.onManualSave) {
      autoSaveHandlers.onManualSave();
    }
  };

  const getSaveButtonTitle = (): string => {
    if (!isAuthenticated) {
      return "Login required to save";
    }
    if (autoSaveState?.hasUnsavedChanges) {
      return "Save manually";
    }
    return "No changes to save";
  };

  const isSaveDisabled = (): boolean => {
    if (!isAuthenticated) {
      return false; // Always enabled when not authenticated (shows login modal)
    }
    return (
      autoSaveState?.isSaving === true ||
      autoSaveState?.hasUnsavedChanges === false
    );
  };

  return (
    <>
      {/* Save Status Indicator */}
      {autoSaveState && (
        <div
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs"
          title="Auto-saves every 30 seconds"
        >
          {autoSaveState.isSaving ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : autoSaveState.error ? (
            <div className="flex items-center gap-1.5 text-red-500">
              <AlertCircle className="w-3 h-3" />
              <span>Error</span>
            </div>
          ) : autoSaveState.lastSaved ? (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <Check className="w-3 h-3" />
              <span>
                Saved{" "}
                {autoSaveState.lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : autoSaveState.hasUnsavedChanges ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span>Unsaved</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>Auto-save after changes(every 30 seconds)</span>
            </div>
          )}
        </div>
      )}

      {/* Manual Save Button */}
      <button
        onClick={handleSaveClick}
        disabled={isSaveDisabled()}
        className="inline-flex items-center justify-center w-8 h-8 text-foreground bg-background hover:bg-secondary border border-input rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={getSaveButtonTitle()}
        aria-label={getSaveButtonTitle()}
      >
        {autoSaveState?.isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
      </button>
    </>
  );
}
