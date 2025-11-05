/**
 * Utility functions for text formatting operations
 */

import { removeMarkers, isTextFormatted } from "./textUtils";

/**
 * Handles formatting for selected text
 * Simple logic: check if selected text is formatted (either itself or wrapped by markers)
 */
export const handleSelectedTextFormatting = (
  text: string,
  start: number,
  end: number,
  selectedText: string,
  marker: string,
  closing: string
): {
  newText: string;
  newStart: number;
  newEnd: number;
} | null => {
  // Check if the selected text itself is formatted
  const isFormattedInSelection = isTextFormatted(selectedText, marker, closing);

  // Check if the selection is inside formatted text (markers are outside the selection)
  const beforeSelection = text.substring(
    Math.max(0, start - marker.length),
    start
  );
  const afterSelection = text.substring(
    end,
    Math.min(text.length, end + closing.length)
  );
  const isFormattedAround =
    beforeSelection === marker && afterSelection === closing;

  // If formatted (either in selection or around it), remove formatting
  if (isFormattedInSelection || isFormattedAround) {
    if (isFormattedAround) {
      // Markers are outside - remove them
      const newText =
        text.substring(0, start - marker.length) +
        selectedText +
        text.substring(end + closing.length);
      return {
        newText,
        newStart: start - marker.length,
        newEnd: start - marker.length + selectedText.length,
      };
    } else {
      // Markers are inside the selection - remove them
      const withoutMarkers = removeMarkers(selectedText, marker, closing);
      const newText =
        text.substring(0, start) + withoutMarkers + text.substring(end);
      return {
        newText,
        newStart: start,
        newEnd: start + withoutMarkers.length,
      };
    }
  } else {
    // Add formatting to selected text
    const newText =
      text.substring(0, start) +
      marker +
      selectedText +
      closing +
      text.substring(end);
    return {
      newText,
      newStart: start + marker.length,
      newEnd: start + marker.length + selectedText.length,
    };
  }
};

/**
 * Handles formatting when no text is selected
 * Simple logic: work with the word under cursor
 */
export const handleEmptySelectionFormatting = (
  text: string,
  start: number,
  end: number,
  marker: string,
  closing: string,
  findWordBoundaries: (
    text: string,
    pos: number
  ) => { start: number; end: number } | null
): {
  newText: string;
  newPos: number;
} | null => {
  // Case 1: Check if cursor is between adjacent markers (e.g., **|**)
  const beforeCursor = text.substring(
    Math.max(0, start - marker.length),
    start
  );
  const afterCursor = text.substring(
    end,
    Math.min(text.length, end + closing.length)
  );

  if (beforeCursor === marker && afterCursor === closing) {
    // Remove the markers
    const newText =
      text.substring(0, start - marker.length) +
      text.substring(end + closing.length);
    return {
      newText,
      newPos: start - marker.length,
    };
  }

  // Case 2: Find word under cursor
  const wordBounds = findWordBoundaries(text, start);
  if (wordBounds) {
    const { start: wordStart, end: wordEnd } = wordBounds;
    const word = text.substring(wordStart, wordEnd);

    // Calculate cursor position relative to word start
    const cursorOffsetInWord = start - wordStart;

    // Check if the word itself is formatted (only check markers directly around the word)
    const beforeWord = text.substring(
      Math.max(0, wordStart - marker.length),
      wordStart
    );
    const afterWord = text.substring(
      wordEnd,
      Math.min(text.length, wordEnd + closing.length)
    );

    const isWordFormatted = beforeWord === marker && afterWord === closing;

    if (isWordFormatted) {
      // Remove formatting from word
      const newText =
        text.substring(0, wordStart - marker.length) +
        word +
        text.substring(wordEnd + closing.length);
      // Keep cursor at the same relative position in the word
      const newPos = wordStart - marker.length + cursorOffsetInWord;
      return {
        newText,
        newPos,
      };
    } else {
      // Add formatting to word
      const newText =
        text.substring(0, wordStart) +
        marker +
        word +
        closing +
        text.substring(wordEnd);
      // Keep cursor at the same relative position in the word (after the opening marker)
      const newPos = wordStart + marker.length + cursorOffsetInWord;
      return {
        newText,
        newPos,
      };
    }
  }

  // Case 3: No word found - just insert markers
  const newText =
    text.substring(0, start) + marker + closing + text.substring(end);
  return {
    newText,
    newPos: start + marker.length,
  };
};
