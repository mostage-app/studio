import { PresentationConfig } from "@/features/presentation/types/presentation.types";

export interface EditorState {
  markdown: string;
  showEditor: boolean;
  showPreview: boolean;
  editingSlide: number;
}

export interface EditorProps {
  markdown: string;
  onChange: (markdown: string, resetSlide?: boolean) => void;
  showEditor: boolean;
  showPreview: boolean;
  editingSlide: number;
  updateEditingSlide: (slideNumber: number) => void;
  /** Presentation data from API (for edit mode) */
  presentation?: {
    presentationId: string;
    name: string;
    slug: string;
    config: Record<string, unknown>;
    isPublic: boolean;
  };
  /** Callback for updating presentation metadata */
  onPresentationUpdate?: (data: {
    name: string;
    slug: string;
    isPublic: boolean;
  }) => Promise<void>;
  /** Manual save handler - receives current markdown and config */
  onManualSave?: (
    markdown: string,
    config: PresentationConfig
  ) => Promise<void>;
  /** Original markdown (for auto-save comparison) */
  originalMarkdown?: string;
  /** Original config (for auto-save comparison) */
  originalConfig?: PresentationConfig | null;
  /** Save content handler (for auto-save) */
  onSaveContent?: (
    markdown: string,
    config: PresentationConfig
  ) => Promise<void>;
}

export interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onOpenLoginRequiredModal?: () => void;
  onOpenExportModal?: () => void;
  updateEditingSlide?: (slideNumber: number) => void;
}
