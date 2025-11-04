"use client";

import { ContentEditorProps } from "../types/editor.types";
import { useState, useRef, useEffect } from "react";
import { AIModal } from "./AIModal";
import { SaveModal } from "./SaveModal";
import { NewFileConfirmationModal } from "./NewFileConfirmationModal";
import { MarkdownToolbar } from "./MarkdownToolbar";
import {
  findWordBoundaries,
  isTextFormatted,
  checkMarkersAroundSelection,
  handleSelectedTextFormatting as formatSelectedText,
  handleEmptySelectionFormatting as formatEmptySelection,
  getCurrentLineBoundaries,
  isHeadingLine,
  isQuoteLine,
  isListLine,
  isInCodeBlock,
} from "../utils";
import { useUndoRedo } from "../hooks/useUndoRedo";

export const ContentEditor: React.FC<ContentEditorProps> = ({
  value: externalValue,
  onChange,
  placeholder = "Start typing your markdown here...",
  onOpenAuthModal,
  onOpenExportModal,
  updateEditingSlide,
}) => {
  // ==================== State Management ====================
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showNewFileConfirmation, setShowNewFileConfirmation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ==================== Undo/Redo Management ====================
  const {
    value,
    canUndo,
    canRedo,
    executeCommand,
    handleChange: handleUndoRedoChange,
    undo,
    redo,
    reset: resetUndoRedo,
  } = useUndoRedo({
    initialValue: externalValue,
    maxHistorySize: 500, // Optimized for most content sizes (can handle up to ~500KB total safely)
  });

  const isInternalChangeRef = useRef(false);

  // Sync external value changes (e.g., when loading new file)
  useEffect(() => {
    // Only sync if change came from outside (not from our internal changes)
    if (!isInternalChangeRef.current && externalValue !== value) {
      resetUndoRedo(externalValue);
    }
    isInternalChangeRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue]);

  // Sync internal value changes to parent
  useEffect(() => {
    if (value !== externalValue) {
      isInternalChangeRef.current = true;
      onChange(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ==================== Event Handlers ====================
  /**
   * Handles cursor position changes to update the current slide
   * Calculates the slide number based on slide separators (---)
   */
  const handleCursorChange = () => {
    const textarea = textareaRef.current;
    if (!textarea || !updateEditingSlide) return;

    const beforeCursor = value.substring(0, textarea.selectionStart);
    const currentSlide = (beforeCursor.match(/^---$/gm) || []).length + 1;

    updateEditingSlide(currentSlide);
  };

  // ==================== Text Manipulation Functions ====================
  /**
   * Inserts text at the current cursor position
   * @param before - Text to insert before the selection
   * @param after - Text to insert after the selection
   * @param placeholder - Placeholder text if nothing is selected
   */
  const insertText = (
    before: string,
    after: string = "",
    placeholder: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);
    executeCommand(newText);

    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos =
        start + before.length + textToInsert.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  /**
   * Updates textarea selection and cursor position
   * Used after text modifications to maintain cursor position
   */
  const updateTextareaSelection = (
    newStart: number,
    newEnd: number = newStart
  ) => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newStart, newEnd);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // ==================== Formatting Toggle Functions ====================
  /**
   * Main function to toggle formatting (bold, italic, etc.)
   * Routes to appropriate handler based on selection state
   */
  const toggleFormatting = (marker: string, closingMarker?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const closing = closingMarker || marker;

    if (selectedText.trim()) {
      const isFormatted = isTextFormatted(selectedText, marker, closing);
      const markersAroundResult = checkMarkersAroundSelection(
        value,
        start,
        end,
        selectedText,
        marker,
        closing
      );

      const result = formatSelectedText(
        value,
        start,
        end,
        selectedText,
        marker,
        closing,
        isFormatted,
        markersAroundResult
      );

      if (result) {
        executeCommand(result.newText);
        updateTextareaSelection(result.newStart, result.newEnd);
      }
    } else {
      const result = formatEmptySelection(
        value,
        start,
        end,
        marker,
        closing,
        findWordBoundaries
      );

      if (result) {
        executeCommand(result.newText);
        updateTextareaSelection(result.newPos);
      }
    }
  };

  // ==================== File Operations ====================
  /**
   * Opens a file picker and loads the selected markdown file
   */
  const handleFileOpen = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          executeCommand(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  /**
   * Downloads the current markdown content as a file
   */
  const handleFileDownload = () => {
    const blob = new Blob([value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Resets the editor content to empty
   */
  const handleNewFile = () => {
    executeCommand("");
  };

  // ==================== Utility Functions ====================
  /**
   * Gets the currently selected text from textarea
   */
  const getSelectedText = (): string => {
    const textarea = textareaRef.current;
    if (!textarea) return "";

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    return value.substring(start, end);
  };

  // ==================== Block Formatting Functions ====================
  /**
   * Applies heading formatting to selected text or current line
   */
  const applyHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const { lineStart, lineEnd } = getCurrentLineBoundaries(value, start);
    const headingInfo = isHeadingLine(value, start);
    const quoteInfo = isQuoteLine(value, start);

    // If text is selected
    if (selectedText.trim()) {
      let textToFormat = selectedText.trim();

      // Remove existing formatting
      if (headingInfo.isHeading) {
        textToFormat = headingInfo.content;
      } else if (quoteInfo.isQuote) {
        textToFormat = quoteInfo.content;
      }

      const heading = `${"#".repeat(level)} ${textToFormat}`;
      const newText =
        value.substring(0, lineStart) + heading + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newEnd = lineStart + heading.length;
        textarea.setSelectionRange(newEnd, newEnd);
        textarea.focus();
      }, 0);
      return;
    }

    // No selection - toggle or convert current line
    if (headingInfo.isHeading) {
      if (headingInfo.level === level) {
        // Same level - remove heading
        const newLine = headingInfo.content;
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      } else {
        // Different level - change level
        const newLine = `${"#".repeat(level)} ${headingInfo.content}`;
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    } else if (quoteInfo.isQuote) {
      // Convert quote to heading
      const newLine = `${"#".repeat(level)} ${quoteInfo.content}`;
      const newText =
        value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newPos = lineStart + newLine.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    } else {
      // Add heading to current line
      const line = value.substring(lineStart, lineEnd).trim();
      if (line) {
        const newLine = `${"#".repeat(level)} ${line}`;
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      } else {
        // Empty line - just add heading
        const newLine = `${"#".repeat(level)} `;
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    }
  };

  /**
   * Applies quote formatting to selected text or current line
   */
  const applyQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const { lineStart, lineEnd } = getCurrentLineBoundaries(value, start);
    const headingInfo = isHeadingLine(value, start);
    const quoteInfo = isQuoteLine(value, start);

    // If text is selected
    if (selectedText.trim()) {
      let textToFormat = selectedText.trim();

      // Remove existing formatting
      if (headingInfo.isHeading) {
        textToFormat = headingInfo.content;
      } else if (quoteInfo.isQuote) {
        textToFormat = quoteInfo.content;
      }

      const quote = `> ${textToFormat}`;
      const newText =
        value.substring(0, lineStart) + quote + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newEnd = lineStart + quote.length;
        textarea.setSelectionRange(newEnd, newEnd);
        textarea.focus();
      }, 0);
      return;
    }

    // No selection - toggle current line
    if (quoteInfo.isQuote) {
      // Remove quote
      const newLine = quoteInfo.content;
      const newText =
        value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newPos = lineStart + newLine.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    } else if (headingInfo.isHeading) {
      // Convert heading to quote
      const newLine = `> ${headingInfo.content}`;
      const newText =
        value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newPos = lineStart + newLine.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    } else {
      // Add quote to current line
      const line = value.substring(lineStart, lineEnd).trim();
      if (line) {
        const newLine = `> ${line}`;
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      } else {
        // Empty line - just add quote
        const newLine = "> ";
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    }
  };

  /**
   * Applies paragraph formatting (removes formatting, adds newlines)
   */
  const applyParagraph = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const { lineStart, lineEnd } = getCurrentLineBoundaries(value, start);
    const headingInfo = isHeadingLine(value, start);
    const quoteInfo = isQuoteLine(value, start);

    // If text is selected
    if (selectedText.trim()) {
      let textToFormat = selectedText.trim();

      // Remove existing formatting
      if (headingInfo.isHeading) {
        textToFormat = headingInfo.content;
      } else if (quoteInfo.isQuote) {
        textToFormat = quoteInfo.content;
      }

      // Add paragraph formatting (double newline before)
      const needsNewlineBefore =
        lineStart === 0 || value.charAt(lineStart - 1) !== "\n";
      const paragraph = (needsNewlineBefore ? "\n\n" : "") + textToFormat;
      const newText =
        value.substring(0, lineStart) + paragraph + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newEnd = lineStart + paragraph.length;
        textarea.setSelectionRange(newEnd, newEnd);
        textarea.focus();
      }, 0);
      return;
    }

    // No selection - convert current line to paragraph
    if (headingInfo.isHeading) {
      // Convert heading to paragraph
      const newLine = headingInfo.content;
      const newText =
        value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newPos = lineStart + newLine.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    } else if (quoteInfo.isQuote) {
      // Convert quote to paragraph
      const newLine = quoteInfo.content;
      const newText =
        value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newPos = lineStart + newLine.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    } else {
      // Add paragraph formatting (double newline before)
      const needsNewlineBefore =
        lineStart === 0 || value.charAt(lineStart - 1) !== "\n";
      const paragraph = needsNewlineBefore ? "\n\n" : "";
      const newText =
        value.substring(0, lineStart) + paragraph + value.substring(lineEnd);
      executeCommand(newText);

      setTimeout(() => {
        const newPos = lineStart + paragraph.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
  };

  /**
   * Toggles list formatting for selected text or current line
   */
  const toggleList = (listType: "unordered" | "ordered") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // If text is selected, convert each line to list item or toggle
    if (selectedText.trim()) {
      const lines = selectedText.split("\n");
      let allLinesAreLists = true;

      // Check what type of lists we have
      let allLinesAreOrdered = true;
      let allLinesAreUnordered = true;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const unorderedMatch = trimmedLine.match(/^[-*+]\s+/);
        const orderedMatch = trimmedLine.match(/^\d+[.)]\s+/);

        if (!unorderedMatch && !orderedMatch) {
          allLinesAreLists = false;
          allLinesAreOrdered = false;
          allLinesAreUnordered = false;
          break;
        }

        if (!unorderedMatch) {
          allLinesAreUnordered = false;
        }
        if (!orderedMatch) {
          allLinesAreOrdered = false;
        }
      }

      // If all lines are ordered lists and user wants unordered -> convert
      if (allLinesAreLists && allLinesAreOrdered && listType === "unordered") {
        const listItems = lines.map((line) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return line;

          const orderedMatch = trimmedLine.match(/^\d+[.)]\s+/);
          if (orderedMatch) {
            const content = trimmedLine.substring(orderedMatch[0].length);
            return "- " + content;
          }
          return line;
        });

        const newText =
          value.substring(0, start) +
          listItems.join("\n") +
          value.substring(end);
        executeCommand(newText);

        setTimeout(() => {
          const newEnd = start + listItems.join("\n").length;
          textarea.setSelectionRange(start, newEnd);
          textarea.focus();
        }, 0);
        return;
      }

      // If all lines are unordered lists and user wants ordered -> convert
      if (allLinesAreLists && allLinesAreUnordered && listType === "ordered") {
        const listItems = lines.map((line, index) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return line;

          const unorderedMatch = trimmedLine.match(/^[-*+]\s+/);
          if (unorderedMatch) {
            const content = trimmedLine.substring(unorderedMatch[0].length);
            return `${index + 1}. ` + content;
          }
          return line;
        });

        const newText =
          value.substring(0, start) +
          listItems.join("\n") +
          value.substring(end);
        executeCommand(newText);

        setTimeout(() => {
          const newEnd = start + listItems.join("\n").length;
          textarea.setSelectionRange(start, newEnd);
          textarea.focus();
        }, 0);
        return;
      }

      // If all lines are the same type of list as requested, toggle them off
      if (
        allLinesAreLists &&
        ((allLinesAreOrdered && listType === "ordered") ||
          (allLinesAreUnordered && listType === "unordered"))
      ) {
        const listItems = lines.map((line) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return line;

          const listMatch = trimmedLine.match(/^([-*+]|\d+[.)])\s+/);
          if (listMatch) {
            return trimmedLine.substring(listMatch[0].length);
          }
          return line;
        });

        const newText =
          value.substring(0, start) +
          listItems.join("\n") +
          value.substring(end);
        executeCommand(newText);

        setTimeout(() => {
          const newEnd = start + listItems.join("\n").length;
          textarea.setSelectionRange(start, newEnd);
          textarea.focus();
        }, 0);
        return;
      }

      // Convert lines to list items (mix of lists and non-lists, or different types)
      const listItems = lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return line;

        const listMatch = trimmedLine.match(/^([-*+]|\d+[.)])\s+/);
        if (listMatch) {
          const withoutMarker = trimmedLine.substring(listMatch[0].length);
          const marker = listType === "unordered" ? "- " : `${index + 1}. `;
          return marker + withoutMarker;
        }

        const marker = listType === "unordered" ? "- " : `${index + 1}. `;
        return marker + trimmedLine;
      });

      const newText =
        value.substring(0, start) + listItems.join("\n") + value.substring(end);
      executeCommand(newText);

      // Keep selection after formatting
      setTimeout(() => {
        const newEnd = start + listItems.join("\n").length;
        textarea.setSelectionRange(start, newEnd);
        textarea.focus();
      }, 0);
      return;
    }

    // No selection - toggle or convert current line
    const listInfo = isListLine(value, start);
    const { lineStart, lineEnd, line } = getCurrentLineBoundaries(value, start);

    if (listInfo.isList) {
      const orderedMatch = line.match(/^\d+[.)]\s+/);
      const unorderedMatch = line.match(/^[-*+]\s+/);

      // Check if we need to convert between list types
      if (orderedMatch && listType === "unordered") {
        // Convert ordered to unordered
        const content = line.substring(orderedMatch[0].length);
        const newLine = "- " + content.trim();
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
        return;
      }

      if (unorderedMatch && listType === "ordered") {
        // Convert unordered to ordered
        const content = line.substring(unorderedMatch[0].length);
        const newLine = "1. " + content.trim();
        const newText =
          value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
        return;
      }

      // Same type - remove list marker (toggle off)
      const markerMatch = line.match(/^([-*+]|\d+[.)])\s+/);
      if (markerMatch && markerMatch.index !== undefined) {
        const contentAfterMarker = line.substring(
          markerMatch.index + markerMatch[0].length
        );
        const withoutMarker =
          line.substring(0, markerMatch.index) + contentAfterMarker;
        const newText =
          value.substring(0, lineStart) +
          withoutMarker +
          value.substring(lineEnd);
        executeCommand(newText);

        setTimeout(() => {
          const newPos = start - markerMatch[0].length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    } else {
      // Add list marker to current line
      const trimmedLine = line.trim();
      const beforeLine = value.substring(0, lineStart);
      const afterLine = value.substring(lineEnd);

      if (trimmedLine) {
        const marker = listType === "unordered" ? "- " : "1. ";
        const newText = beforeLine + marker + trimmedLine + afterLine;
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + marker.length + trimmedLine.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      } else {
        // Empty line - just add marker
        const marker = listType === "unordered" ? "- " : "1. ";
        const newText = beforeLine + marker + afterLine;
        executeCommand(newText);

        setTimeout(() => {
          const newPos = lineStart + marker.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    }
  };

  /**
   * Applies code block formatting to selected text or current position
   */
  const applyCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Check if we're inside a code block
    const codeBlockInfo = isInCodeBlock(value, start);
    if (codeBlockInfo.inCodeBlock && codeBlockInfo.blockStart !== undefined) {
      // Toggle off: Remove code block
      const beforeBlock = value.substring(0, codeBlockInfo.blockStart);

      // Extract content between markers
      let content = "";
      if (
        codeBlockInfo.blockEnd !== undefined &&
        codeBlockInfo.blockEnd < value.length
      ) {
        content = value.substring(
          codeBlockInfo.blockStart + 3,
          codeBlockInfo.blockEnd - 3
        );
      } else {
        content = value.substring(codeBlockInfo.blockStart + 3);
      }

      // Remove leading/trailing newlines from content
      content = content.replace(/^\n+|\n+$/g, "");

      // Determine what comes after the block
      const afterBlock = codeBlockInfo.blockEnd
        ? value.substring(codeBlockInfo.blockEnd)
        : "";

      const newText = beforeBlock + content + afterBlock;
      executeCommand(newText);

      setTimeout(() => {
        // Position cursor at the start of the content
        if (codeBlockInfo.blockStart !== undefined) {
          const newPos = codeBlockInfo.blockStart + content.length;
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }
      }, 0);
      return;
    }

    // If text is selected, wrap it in code block
    if (selectedText.trim()) {
      // Check if selection spans multiple lines
      const hasNewlines = selectedText.includes("\n");

      if (hasNewlines) {
        // Multi-line selection - use code block format
        const codeBlock = `\`\`\`\n${selectedText}\n\`\`\``;
        const newText =
          value.substring(0, start) + codeBlock + value.substring(end);
        executeCommand(newText);

        setTimeout(() => {
          // Position cursor after the closing markers
          const newEnd = start + codeBlock.length;
          textarea.setSelectionRange(newEnd, newEnd);
          textarea.focus();
        }, 0);
      } else {
        // Single line - use inline code
        const inlineCode = `\`${selectedText}\``;
        const newText =
          value.substring(0, start) + inlineCode + value.substring(end);
        executeCommand(newText);

        setTimeout(() => {
          // Position cursor after the closing backtick
          const newEnd = start + inlineCode.length;
          textarea.setSelectionRange(newEnd, newEnd);
          textarea.focus();
        }, 0);
      }
      return;
    }

    // No selection - add code block markers with cursor between them
    // Check if we're at the start of a line
    const { lineStart } = getCurrentLineBoundaries(value, start);
    const needsNewlineBefore =
      lineStart === start || value.charAt(start - 1) === "\n";
    const needsNewlineAfter =
      start >= value.length || value.charAt(start) === "\n";

    let codeBlockMarkers = "```\n\n```";
    if (!needsNewlineBefore && lineStart > 0) {
      codeBlockMarkers = "\n" + codeBlockMarkers;
    }
    if (!needsNewlineAfter && start < value.length) {
      codeBlockMarkers = codeBlockMarkers + "\n";
    }

    const newText =
      value.substring(0, start) + codeBlockMarkers + value.substring(end);
    onChange(newText);

    setTimeout(() => {
      // Position cursor between markers (after first ```\n)
      const cursorOffset = needsNewlineBefore && lineStart > 0 ? 5 : 4; // "\n```\n" or "```\n"
      const newPos = start + cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  };

  return (
    <div className="h-full flex flex-col border-b border-input bg-muted">
      {/* Content Editor Header */}
      <div className="flex items-center justify-between p-[1.1rem]">
        <h3 className="text-sm font-semibold text-card-foreground">
          Content Editor
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Markdown Toolbar */}
        <MarkdownToolbar
          onInsert={insertText}
          onToggleFormatting={toggleFormatting}
          onToggleList={toggleList}
          onApplyHeading={applyHeading}
          onApplyQuote={applyQuote}
          onApplyParagraph={applyParagraph}
          onApplyCodeBlock={applyCodeBlock}
          onOpenNewFileConfirmation={() => setShowNewFileConfirmation(true)}
          onOpenFile={handleFileOpen}
          onOpenSaveModal={() => setShowSaveModal(true)}
          onOpenAIModal={() => setShowAIModal(true)}
          onOpenAuthModal={onOpenAuthModal || (() => {})}
          getSelectedText={getSelectedText}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            handleUndoRedoChange(e.target.value);
          }}
          onKeyDown={(e) => {
            // Handle keyboard shortcuts
            // Use e.code instead of e.key for language-independent detection
            // e.code represents the physical key pressed, not the character produced
            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) - universal standard
            // Must NOT have Shift key pressed
            // KeyZ is the physical Z key regardless of keyboard layout
            if (isCtrlOrCmd && !isShift && e.code === "KeyZ") {
              e.preventDefault();
              if (canUndo) {
                undo();
              }
            }
            // Redo:
            // - Ctrl+Y (Windows standard) or Cmd+Y (Mac) - KeyY
            // - Ctrl+Shift+Z (Linux/Mac standard) or Cmd+Shift+Z - KeyZ with Shift
            // We support both for cross-platform compatibility
            else if (
              isCtrlOrCmd &&
              (e.code === "KeyY" || (e.code === "KeyZ" && isShift))
            ) {
              e.preventDefault();
              if (canRedo) {
                redo();
              }
            }
            // Bold: Ctrl+B / Cmd+B
            else if (isCtrlOrCmd && !isShift && e.code === "KeyB") {
              e.preventDefault();
              toggleFormatting("**");
            }
            // Italic: Ctrl+I / Cmd+I
            else if (isCtrlOrCmd && !isShift && e.code === "KeyI") {
              e.preventDefault();
              toggleFormatting("_");
            }
            // Underline: Ctrl+U / Cmd+U
            else if (isCtrlOrCmd && !isShift && e.code === "KeyU") {
              e.preventDefault();
              toggleFormatting("<u>", "</u>");
            }
            // Strikethrough: Ctrl+Shift+S / Cmd+Shift+S
            else if (isCtrlOrCmd && isShift && e.code === "KeyS") {
              e.preventDefault();
              toggleFormatting("~~");
            }
          }}
          onKeyUp={handleCursorChange}
          onMouseUp={handleCursorChange}
          onFocus={handleCursorChange}
          placeholder={placeholder}
          className="
              flex-1 w-full p-4 border-0 resize-none outline-none
              bg-background text-foreground
              font-mono text-sm leading-relaxed
              placeholder-muted-foreground
              whitespace-nowrap
              min-h-[300px]
            "
          style={{
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
      </div>

      {/* AI Modal */}
      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onInsertContent={(content) => {
          // Insert content at cursor position
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue =
              value.substring(0, start) + content + value.substring(end);
            executeCommand(newValue);

            // Set cursor position after inserted content
            setTimeout(() => {
              const newCursorPos = start + content.length;
              textarea.setSelectionRange(newCursorPos, newCursorPos);
              textarea.focus();
            }, 0);
          }
        }}
        onOpenAuthModal={onOpenAuthModal || (() => {})}
      />

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onDownload={handleFileDownload}
        onOpenExportModal={onOpenExportModal || (() => {})}
      />

      {/* New File Confirmation Modal */}
      <NewFileConfirmationModal
        isOpen={showNewFileConfirmation}
        onClose={() => setShowNewFileConfirmation(false)}
        onConfirm={handleNewFile}
      />
    </div>
  );
};
