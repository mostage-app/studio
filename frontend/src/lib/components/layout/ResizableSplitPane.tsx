"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Constants
const COLLAPSE_THRESHOLD = 5; // Percentage threshold for collapse detection
const SNAP_THRESHOLD = 3; // Percentage threshold for snap detection
const DRAG_CLASSES = ["dragging", "no-select"];

export type PanePosition = "first" | "second";
export type SplitDirection = "horizontal" | "vertical";

export interface CollapseControl {
  isCollapsed: boolean;
  onToggle: () => void;
  pane?: PanePosition;
}

export interface ResizableSplitPaneProps {
  /** Two child panes to split */
  children: [React.ReactNode, React.ReactNode];
  /** Default size of the first pane in percentage (0-100) */
  defaultSize?: number;
  /** Minimum size of panes in percentage */
  minSize?: number;
  /** Maximum size of panes in percentage */
  maxSize?: number;
  /** Split direction */
  direction?: SplitDirection;
  /** Additional CSS classes */
  className?: string;
  /** Controlled size (external state control) */
  controlledSize?: number;
  /** Callback when size changes via drag */
  onSizeChange?: (size: number) => void;
  /** Collapse control configuration */
  collapseControl?: CollapseControl;
  /** Enable snap to edges (snap to left for first pane, snap to right for second pane) */
  enableSnap?: boolean;
}

/**
 * ResizableSplitPane Component
 *
 * A professional, flexible split-pane component that supports:
 * - Horizontal and vertical splitting
 * - Collapsible panes with configurable position (first/second)
 * - Snap to edges functionality
 * - Smooth drag interactions
 * - Touch support
 * - Controlled and uncontrolled modes
 *
 * @component
 */
export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
  children,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  direction = "horizontal",
  className = "",
  controlledSize,
  onSizeChange,
  collapseControl,
  enableSnap = false,
}) => {
  // Internal state
  const [internalSize, setInternalSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const startSizeRef = useRef<number>(0);

  // Computed values
  const isHorizontal = direction === "horizontal";
  const panePosition = collapseControl?.pane ?? "first";
  const isFirstPane = panePosition === "first";
  const isSecondPane = panePosition === "second";

  // Use controlled size if provided, otherwise use internal state
  const currentSize = controlledSize ?? internalSize;

  /**
   * Get current mouse/touch position
   */
  const getCurrentPosition = useCallback(
    (e: MouseEvent | TouchEvent): number => {
      if ("touches" in e) {
        return isHorizontal ? e.touches[0].clientX : e.touches[0].clientY;
      }
      return isHorizontal ? e.clientX : e.clientY;
    },
    [isHorizontal]
  );

  /**
   * Get container size (width for horizontal, height for vertical)
   */
  const getContainerSize = useCallback((): number => {
    if (!containerRef.current) return 0;
    return isHorizontal
      ? containerRef.current.offsetWidth
      : containerRef.current.offsetHeight;
  }, [isHorizontal]);

  /**
   * Apply snap logic if enabled
   */
  const applySnapLogic = useCallback(
    (rawSize: number): number => {
      if (!enableSnap) return rawSize;

      // Snap first pane to left (0)
      if (isFirstPane && rawSize <= SNAP_THRESHOLD) {
        return 0;
      }

      // Snap second pane to right (100)
      // For second pane, we need to check the second pane's size (100 - firstPaneSize)
      if (isSecondPane) {
        const secondPaneSize = 100 - rawSize;
        if (secondPaneSize <= SNAP_THRESHOLD) {
          return 100; // First pane takes 100%, second pane is snapped to right (0%)
        }
      }

      return rawSize;
    },
    [enableSnap, isFirstPane, isSecondPane]
  );

  /**
   * Calculate new size based on drag delta
   */
  const calculateNewSize = useCallback(
    (delta: number): number => {
      const containerSize = getContainerSize();
      if (!containerSize) return currentSize;

      const deltaPercentage = (delta / containerSize) * 100;
      const rawSize = startSizeRef.current + deltaPercentage;

      // Apply snap logic first
      const snappedSize = applySnapLogic(rawSize);

      // If snapped to edge (0 or 100), return immediately (bypass clamp)
      if (snappedSize === 0 || snappedSize === 100) {
        return snappedSize;
      }

      // Handle collapse: allow collapsing to 0
      if (snappedSize <= COLLAPSE_THRESHOLD) {
        return 0;
      }

      // Clamp to min/max bounds
      const clampedSize = Math.max(minSize, Math.min(maxSize, snappedSize));
      return clampedSize;
    },
    [currentSize, minSize, maxSize, getContainerSize, applySnapLogic]
  );

  /**
   * Update size state and notify parent
   */
  const updateSize = useCallback(
    (newSize: number) => {
      setInternalSize(newSize);
      onSizeChange?.(newSize);
    },
    [onSizeChange]
  );

  /**
   * Start drag operation
   */
  const startDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      document.body.classList.add(...DRAG_CLASSES);

      const currentPos = getCurrentPosition(e);
      startPosRef.current = currentPos;
      startSizeRef.current = currentSize;
    },
    [currentSize, getCurrentPosition]
  );

  /**
   * Handle drag movement
   */
  const handleDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const currentPos = getCurrentPosition(e);
      const delta = currentPos - startPosRef.current;
      const newSize = calculateNewSize(delta);

      // Only update if controlled size is not set (uncontrolled mode)
      if (controlledSize === undefined) {
        updateSize(newSize);
      } else {
        // In controlled mode, still call onSizeChange
        onSizeChange?.(newSize);
      }
    },
    [
      isDragging,
      getCurrentPosition,
      calculateNewSize,
      controlledSize,
      updateSize,
      onSizeChange,
    ]
  );

  /**
   * End drag operation
   */
  const endDrag = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove(...DRAG_CLASSES);
  }, []);

  /**
   * Setup drag event listeners
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleDrag(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleDrag(e);
    };

    const handleMouseUp = () => {
      endDrag();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      endDrag();
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleDrag, endDrag]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      document.body.classList.remove(...DRAG_CLASSES);
    };
  }, []);

  /**
   * Setup resizer element event listeners
   */
  useEffect(() => {
    const resizer = containerRef.current?.querySelector("[data-resizer]");
    if (!resizer) return;

    const handleMouseDown = (e: Event) => startDrag(e as MouseEvent);
    const handleTouchStart = (e: Event) => startDrag(e as TouchEvent);

    resizer.addEventListener("mousedown", handleMouseDown, { passive: false });
    resizer.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    return () => {
      resizer.removeEventListener("mousedown", handleMouseDown);
      resizer.removeEventListener("touchstart", handleTouchStart);
    };
  }, [startDrag]);

  /**
   * Sync with controlled size
   */
  useEffect(() => {
    if (typeof controlledSize === "number") {
      const clamped =
        controlledSize === 0
          ? 0
          : Math.max(minSize, Math.min(maxSize, controlledSize));
      setInternalSize(clamped);
    }
  }, [controlledSize, minSize, maxSize]);

  /**
   * Render drag handle dots indicator
   */
  const renderDotsIndicator = () => (
    <div className={`flex gap-0.5 ${isHorizontal ? "flex-col" : "flex-row"}`}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`rounded-full bg-white dark:bg-gray-200 ${
            isHorizontal ? "w-1 h-1" : "h-1 w-1"
          }`}
        />
      ))}
    </div>
  );

  /**
   * Render collapse button
   */
  const renderCollapseButton = () => {
    if (!collapseControl || !isHorizontal) return null;

    const isCollapsedNow = collapseControl.isCollapsed;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          collapseControl.onToggle();
        }}
        className={`
          pointer-events-auto absolute z-30
          top-[calc(50%+50px)] -translate-y-1/2
          ${
            isSecondPane
              ? "right-1/2 translate-x-1/2"
              : "left-1/2 -translate-x-1/2"
          }
          inline-flex items-center justify-center w-3 h-8 rounded
          bg-gray-400 dark:bg-gray-500 text-white
          group-hover:bg-blue-500 dark:group-hover:bg-blue-400
          transition-colors shadow-sm cursor-pointer
        `}
        title={isCollapsedNow ? "Expand" : "Collapse"}
        aria-label={isCollapsedNow ? "Expand panel" : "Collapse panel"}
      >
        {isCollapsedNow ? (
          // Show expand icon (pointing to collapsed pane)
          isSecondPane ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )
        ) : // Show collapse icon (pointing away from pane)
        isSecondPane ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    );
  };

  // Calculate pane sizes
  const firstPaneSize = currentSize;
  const secondPaneSize = 100 - currentSize;

  return (
    <div
      ref={containerRef}
      className={`flex ${
        isHorizontal ? "flex-row" : "flex-col"
      } h-full w-full ${className}`}
    >
      {/* First Pane */}
      <div
        className={`${isHorizontal ? "h-full" : "w-full"} overflow-hidden`}
        style={{
          [isHorizontal ? "width" : "height"]: `${firstPaneSize}%`,
        }}
      >
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        data-resizer
        className={`
          relative z-20 flex items-center justify-center
          ${isHorizontal ? "w-3 h-full sm:w-1" : "h-3 w-full sm:h-1"}
          ${isDragging ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}
          hover:bg-blue-400 dark:hover:bg-blue-500
          cursor-${isHorizontal ? "col-resize" : "row-resize"}
          transition-colors duration-200 group
        `}
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {/* Drag Handle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <div
              className={`
                ${isHorizontal ? "w-3 h-8" : "h-3 w-8"}
                -m-1 rounded flex items-center justify-center
                bg-gray-400 dark:bg-gray-500
                group-hover:bg-blue-500 dark:group-hover:bg-blue-400
                transition-colors duration-200
                ${isDragging ? "bg-blue-600 dark:bg-blue-500" : ""}
              `}
            >
              {renderDotsIndicator()}
            </div>
          </div>
          {renderCollapseButton()}
        </div>
      </div>

      {/* Second Pane */}
      <div
        className={`${isHorizontal ? "h-full" : "w-full"} overflow-hidden`}
        style={{
          [isHorizontal ? "width" : "height"]: `${secondPaneSize}%`,
        }}
      >
        {children[1]}
      </div>
    </div>
  );
};
