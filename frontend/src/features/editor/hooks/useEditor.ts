"use client";

import { useState, useCallback } from "react";
import { EditorState } from "../types/editor.types";

const defaultMarkdown = ``;

export const useEditor = () => {
  const [state, setState] = useState<EditorState>({
    markdown: defaultMarkdown,
    showEditor: true,
    showPreview: true,
    editingSlide: 1,
  });

  const updateMarkdown = useCallback((markdown: string, resetSlide = false) => {
    setState((prev) => ({
      ...prev,
      markdown,
      editingSlide: resetSlide ? 1 : prev.editingSlide,
    }));
  }, []);

  const updateEditingSlide = useCallback((slideNumber: number) => {
    setState((prev) => ({ ...prev, editingSlide: slideNumber }));
  }, []);

  return {
    ...state,
    updateMarkdown,
    updateEditingSlide,
  };
};
