/**
 * Utility functions for line analysis and manipulation
 */

import { getLineBoundaries } from "./textUtils";

/**
 * Finds the boundaries of the current line containing the cursor
 */
export const getCurrentLineBoundaries = (
  text: string,
  start: number
): { lineStart: number; lineEnd: number; line: string } => {
  return getLineBoundaries(text, start);
};

/**
 * Checks if the current line is a heading
 */
export const isHeadingLine = (
  text: string,
  start: number
): { isHeading: boolean; level: number; content: string } => {
  const { line } = getCurrentLineBoundaries(text, start);
  const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
  if (headingMatch) {
    return {
      isHeading: true,
      level: headingMatch[1].length,
      content: headingMatch[2].trim(),
    };
  }

  return { isHeading: false, level: 0, content: line.trim() };
};

/**
 * Checks if the current line is a quote
 */
export const isQuoteLine = (
  text: string,
  start: number
): { isQuote: boolean; content: string } => {
  const { line } = getCurrentLineBoundaries(text, start);
  const quoteMatch = line.match(/^>\s*(.+)$/);
  if (quoteMatch) {
    return {
      isQuote: true,
      content: quoteMatch[1].trim(),
    };
  }

  return { isQuote: false, content: line.trim() };
};

/**
 * Checks if the current line or selection is already a list item
 */
export const isListLine = (
  text: string,
  start: number
): { isList: boolean; marker: string; content: string } => {
  const { line: fullLine } = getCurrentLineBoundaries(text, start);
  const line = fullLine.trim();

  // Check for unordered list (starts with - or * or +)
  const unorderedMatch = line.match(/^([-*+])\s+/);
  if (unorderedMatch) {
    return {
      isList: true,
      marker: unorderedMatch[1],
      content: line.substring(unorderedMatch[0].length),
    };
  }

  // Check for ordered list (starts with number. or number))
  const orderedMatch = line.match(/^(\d+)[.)]\s+/);
  if (orderedMatch) {
    return {
      isList: true,
      marker: orderedMatch[0].trim(),
      content: line.substring(orderedMatch[0].length),
    };
  }

  return { isList: false, marker: "", content: line };
};

/**
 * Checks if the current position is inside a code block (```...```)
 */
export const isInCodeBlock = (
  text: string,
  start: number
): { inCodeBlock: boolean; blockStart?: number; blockEnd?: number } => {
  const textBefore = text.substring(0, start);

  // Find the last ``` before cursor
  const lastOpenIndex = textBefore.lastIndexOf("```");
  if (lastOpenIndex === -1) return { inCodeBlock: false };

  // Check if there's a closing ``` after the opening
  const afterOpen = text.substring(lastOpenIndex + 3);
  const closeIndex = afterOpen.indexOf("```");
  if (closeIndex === -1) {
    // Open block without close - we're in a code block
    return {
      inCodeBlock: true,
      blockStart: lastOpenIndex,
      blockEnd: text.length,
    };
  }

  const actualCloseIndex = lastOpenIndex + 3 + closeIndex;

  // Check if cursor is between the markers
  if (start >= lastOpenIndex && start <= actualCloseIndex + 3) {
    // Check if there are any newlines between open and cursor
    const betweenOpenAndCursor = text.substring(lastOpenIndex + 3, start);
    const betweenCursorAndClose = text.substring(start, actualCloseIndex);

    // If there are newlines, it's likely a code block
    if (
      betweenOpenAndCursor.includes("\n") ||
      betweenCursorAndClose.includes("\n")
    ) {
      return {
        inCodeBlock: true,
        blockStart: lastOpenIndex,
        blockEnd: actualCloseIndex + 3,
      };
    }
  }

  return { inCodeBlock: false };
};
