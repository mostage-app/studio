"use client";

import { useState, useCallback } from "react";
import { ImportResult, FileValidation } from "../types/import.types";

export const useImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): FileValidation => {
    const allowedTypes = [
      "text/markdown",
      "text/plain",
      "application/json",
      "text/html",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".md")) {
      return {
        valid: false,
        error:
          "File type not supported. Please select a Markdown, JSON, HTML, or text file.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size too large. Please select a file smaller than 10MB.",
      };
    }

    return { valid: true };
  }, []);

  const importFile = useCallback(
    async (file: File): Promise<ImportResult> => {
      setIsImporting(true);
      setImportError(null);

      try {
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const content = await file.text();

        return {
          content,
          success: true,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Import failed";
        setImportError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsImporting(false);
      }
    },
    [validateFile]
  );

  const clearError = useCallback(() => {
    setImportError(null);
  }, []);

  return {
    isImporting,
    importError,
    validateFile,
    importFile,
    clearError,
  };
};
