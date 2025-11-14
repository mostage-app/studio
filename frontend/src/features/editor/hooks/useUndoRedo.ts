"use client";

import { useCallback, useRef, useReducer } from "react";

/**
 * Hook for managing undo/redo functionality
 * Supports both programmatic changes (from toolbar) and user typing
 */
export interface UseUndoRedoOptions {
  /**
   * Initial value
   */
  initialValue: string;
  /**
   * Maximum number of history states to keep
   * Each entry stores a full copy of the content, so memory usage = maxHistorySize × contentSize
   * For small/medium content (<100KB): 500-1000 is safe
   * For large content (>500KB): consider using 100-200 to avoid memory issues
   * @default 500
   */
  maxHistorySize?: number;
}

export interface UseUndoRedoReturn {
  /**
   * Current value
   */
  value: string;
  /**
   * Whether undo is available
   */
  canUndo: boolean;
  /**
   * Whether redo is available
   */
  canRedo: boolean;
  /**
   * Execute a command (for programmatic changes like toolbar)
   * This immediately adds to history
   */
  executeCommand: (newValue: string, cursorPosition?: number) => void;
  /**
   * Handle onChange for textarea (immediate history addition)
   */
  handleChange: (newValue: string) => void;
  /**
   * Undo the last change
   */
  undo: () => void;
  /**
   * Redo the last undone change
   */
  redo: () => void;
  /**
   * Reset history (useful when loading new content)
   */
  reset: (newValue: string) => void;
}

interface HistoryState {
  history: string[];
  currentIndex: number;
}

type HistoryAction =
  | { type: "ADD"; value: string; maxSize: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; value: string };

/**
 * Reducer for managing history state
 * This ensures atomic updates and prevents stale closures
 */
const historyReducer = (
  state: HistoryState,
  action: HistoryAction
): HistoryState => {
  switch (action.type) {
    case "ADD": {
      // Remove any future states if we're not at the end
      const trimmedHistory = state.history.slice(0, state.currentIndex + 1);

      // Add new state
      const newHistory = [...trimmedHistory, action.value];

      // Limit history size
      const finalHistory =
        newHistory.length > action.maxSize
          ? newHistory.slice(-action.maxSize)
          : newHistory;

      return {
        history: finalHistory,
        currentIndex: finalHistory.length - 1,
      };
    }

    case "UNDO": {
      if (state.currentIndex > 0) {
        return {
          ...state,
          currentIndex: state.currentIndex - 1,
        };
      }
      return state;
    }

    case "REDO": {
      if (state.currentIndex < state.history.length - 1) {
        return {
          ...state,
          currentIndex: state.currentIndex + 1,
        };
      }
      return state;
    }

    case "RESET": {
      return {
        history: [action.value],
        currentIndex: 0,
      };
    }

    default:
      return state;
  }
};

/**
 * Custom hook for undo/redo functionality
 *
 * This hook manages a history stack for text editing operations.
 * All changes (both programmatic and user typing) are added to history immediately.
 * Each character typed creates a new history entry, allowing fine-grained undo control.
 *
 * Uses useReducer for atomic state updates to avoid stale closure issues.
 */
export const useUndoRedo = ({
  initialValue,
  maxHistorySize = 500,
}: UseUndoRedoOptions): UseUndoRedoReturn => {
  const [{ history, currentIndex }, dispatch] = useReducer(historyReducer, {
    history: [initialValue],
    currentIndex: 0,
  });

  const isTypingRef = useRef(false);
  const lastTypedValueRef = useRef(initialValue);

  /**
   * Get current value from history
   */
  const currentValue = history[currentIndex];

  /**
   * Execute a command (for programmatic changes)
   * This immediately adds to history
   */
  const executeCommand = useCallback(
    (newValue: string) => {
      // Don't add to history if value hasn't changed
      if (newValue === currentValue) {
        return;
      }

      isTypingRef.current = false;
      lastTypedValueRef.current = newValue;
      dispatch({ type: "ADD", value: newValue, maxSize: maxHistorySize });
    },
    [currentValue, maxHistorySize]
  );

  /**
   * Handle onChange for textarea (immediate history addition)
   */
  const handleChange = useCallback(
    (newValue: string) => {
      // Don't add to history if value hasn't changed
      if (newValue === currentValue) {
        return;
      }

      isTypingRef.current = true;
      lastTypedValueRef.current = newValue;
      dispatch({ type: "ADD", value: newValue, maxSize: maxHistorySize });
      isTypingRef.current = false;
    },
    [currentValue, maxHistorySize]
  );

  /**
   * Undo the last change
   */
  const undo = useCallback(() => {
    // If we're in the middle of typing, save current state first
    if (isTypingRef.current && lastTypedValueRef.current !== currentValue) {
      dispatch({
        type: "ADD",
        value: lastTypedValueRef.current,
        maxSize: maxHistorySize,
      });
      isTypingRef.current = false;
    }

    dispatch({ type: "UNDO" });
  }, [currentValue, maxHistorySize]);

  /**
   * Redo the last undone change
   */
  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  /**
   * Reset history (useful when loading new content)
   */
  const reset = useCallback((newValue: string) => {
    isTypingRef.current = false;
    lastTypedValueRef.current = newValue;
    dispatch({ type: "RESET", value: newValue });
  }, []);

  return {
    value: currentValue,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    executeCommand,
    handleChange,
    undo,
    redo,
    reset,
  };
};
