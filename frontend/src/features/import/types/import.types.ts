export interface ImportResult {
  content?: string;
  config?: Record<string, unknown>;
  success: boolean;
  error?: string;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  onImportMultiple: (files: File[]) => void;
}
