/**
 * Utility functions for text manipulation and analysis
 */

/**
 * Checks if a character is a word character
 * Supports English, Persian, and Arabic characters
 */
export const isWordChar = (char: string): boolean =>
  /[\w\u0600-\u06FF]/.test(char);

/**
 * Finds word boundaries around a cursor position
 * @returns {start, end} of the word, or null if not on a word
 */
export const findWordBoundaries = (
  text: string,
  cursorPos: number
): { start: number; end: number } | null => {
  if (cursorPos < 0 || cursorPos > text.length) return null;

  const charBefore = cursorPos > 0 ? text.charAt(cursorPos - 1) : " ";
  const charAfter = cursorPos < text.length ? text.charAt(cursorPos) : " ";

  if (!isWordChar(charBefore) && !isWordChar(charAfter)) return null;

  let wordStart = cursorPos;
  let wordEnd = cursorPos;

  // Move backward to find word start
  while (wordStart > 0 && isWordChar(text.charAt(wordStart - 1))) {
    wordStart--;
  }

  // Move forward to find word end
  while (wordEnd < text.length && isWordChar(text.charAt(wordEnd))) {
    wordEnd++;
  }

  return wordStart < wordEnd ? { start: wordStart, end: wordEnd } : null;
};

/**
 * Checks if selected text is already formatted with given markers
 */
export const isTextFormatted = (
  text: string,
  marker: string,
  closing: string
): boolean => {
  if (!text || text.length < marker.length + closing.length) {
    return false;
  }

  const trimmed = text.trim();

  // Check 1: Trimmed starts and ends with markers (most common case)
  if (trimmed.startsWith(marker) && trimmed.endsWith(closing)) {
    return true;
  }

  // Check 2: Full text starts and ends with markers
  if (text.startsWith(marker) && text.endsWith(closing)) {
    return true;
  }

  // Check 3: Look for markers that wrap the content (handling whitespace)
  const markerStart = text.indexOf(marker);
  const closingEnd = text.lastIndexOf(closing);

  if (markerStart !== -1 && closingEnd !== -1 && markerStart < closingEnd) {
    const beforeMarker = text.substring(0, markerStart);
    const afterClosing = text.substring(closingEnd + closing.length);
    const contentBetween = text.substring(
      markerStart + marker.length,
      closingEnd
    );

    // If there's meaningful content between markers and minimal whitespace outside
    if (contentBetween.trim().length > 0) {
      const beforeIsWhitespace = beforeMarker.trim().length === 0;
      const afterIsWhitespace = afterClosing.trim().length === 0;

      // Consider formatted if markers are at edges or only surrounded by whitespace
      if (
        (markerStart === 0 || beforeIsWhitespace) &&
        (closingEnd + closing.length === text.length || afterIsWhitespace)
      ) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Removes formatting markers from text
 */
export const removeMarkers = (
  text: string,
  marker: string,
  closing: string
): string => {
  const markerStart = text.indexOf(marker);
  const closingEnd = text.lastIndexOf(closing);

  if (markerStart === -1 || closingEnd === -1) return text;

  const beforeMarker = text.substring(0, markerStart);
  const betweenMarkers = text.substring(
    markerStart + marker.length,
    closingEnd
  );
  const afterClosing = text.substring(closingEnd + closing.length);

  return beforeMarker + betweenMarkers + afterClosing;
};

/**
 * Finds the boundaries of the current line containing the cursor
 */
export const getLineBoundaries = (
  text: string,
  cursorPos: number
): { lineStart: number; lineEnd: number; line: string } => {
  let lineStart = cursorPos;
  while (lineStart > 0 && text.charAt(lineStart - 1) !== "\n") {
    lineStart--;
  }

  let lineEnd = cursorPos;
  while (lineEnd < text.length && text.charAt(lineEnd) !== "\n") {
    lineEnd++;
  }

  const line = text.substring(lineStart, lineEnd);
  return { lineStart, lineEnd, line };
};
