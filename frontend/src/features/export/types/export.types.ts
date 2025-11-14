export interface ExportOptions {
  filename?: string;
  theme?: string;
}

export interface ExportResult {
  success: boolean;
  error?: string;
}

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  onOpenAuthModal?: () => void;
}

export type ExportFormat =
  | "html"
  | "pdf"
  | "pptx"
  | "jpg"
  | "config"
  | "content"
  | "mostage";
