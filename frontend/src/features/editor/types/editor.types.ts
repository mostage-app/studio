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
}

export interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onOpenAuthModal?: () => void;
  onOpenExportModal?: () => void;
  updateEditingSlide?: (slideNumber: number) => void;
}
