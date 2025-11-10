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
}

export interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onOpenAuthModal?: () => void;
  onOpenExportModal?: () => void;
  updateEditingSlide?: (slideNumber: number) => void;
}
