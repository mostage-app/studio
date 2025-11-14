"use client";

import { useState, useCallback } from "react";
import {
  ExportResult,
  ExportFormat,
  ExportOptions,
} from "../types/export.types";
import { exportConfig, exportContent } from "../services/exportUtils";

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportToFormat = useCallback(
    async (
      format: ExportFormat,
      content: string,
      config: Record<string, unknown>,
      options: ExportOptions = {}
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setExportError(null);

      try {
        switch (format) {
          case "config":
            await exportConfig(config, options);
            break;
          case "content":
            await exportContent(content, options);
            break;
          case "html":
          case "pdf":
          case "pptx":
          case "jpg":
          case "mostage":
            // TODO: Implement these export formats
            console.log(`${format} export not implemented yet`);
            break;
          default:
            throw new Error(`Unsupported export format: ${format}`);
        }

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Export failed";
        setExportError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    isExporting,
    exportError,
    exportToFormat,
    clearError,
  };
};
