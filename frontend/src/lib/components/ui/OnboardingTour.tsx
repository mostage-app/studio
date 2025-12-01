"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "./Button";
import type { TourStep } from "@/lib/config/tour.config";

interface OnboardingTourProps {
  /** Array of tour steps */
  steps: TourStep[];
  /** Whether the tour is active */
  isActive: boolean;
  /** Callback when tour is closed or completed */
  onClose: () => void;
}

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
}

// Constants
const MOBILE_BREAKPOINT = 768;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 200;
const TOOLTIP_SPACING = 24;
const ARROW_SIZE = 12;
const OVERLAY_OPACITY = 0.75;

// Button styles for focus handling
const buttonFocusStyles: React.CSSProperties = {
  outline: "none",
  boxShadow: "none",
  borderRadius: "0.125rem",
};

const handleButtonFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
  e.currentTarget.style.outline = "none";
  e.currentTarget.style.boxShadow = "none";
};

export function OnboardingTour({
  steps,
  isActive,
  onClose,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elementPosition, setElementPosition] =
    useState<ElementPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastStepRef = useRef<number>(-1);

  const currentStepData = useMemo(
    () => steps[currentStep],
    [steps, currentStep]
  );

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Find panel container for h3 elements
  const findPanelContainer = useCallback((element: Element): Element | null => {
    let parent = element.parentElement;
    let bestMatch: Element | null = null;

    while (
      parent &&
      parent !== document.body &&
      parent !== document.documentElement
    ) {
      const classList = parent.classList;

      // Content Editor: most specific container
      if (
        classList.contains("h-full") &&
        classList.contains("flex") &&
        classList.contains("flex-col") &&
        classList.contains("border-b") &&
        classList.contains("border-input") &&
        classList.contains("bg-muted")
      ) {
        return parent;
      }

      // Live Preview panel
      if (
        classList.contains("h-full") &&
        classList.contains("flex") &&
        classList.contains("flex-col") &&
        !classList.contains("border-b") &&
        parent.querySelector("h3") === element
      ) {
        bestMatch = parent;
      }

      // Presentation Settings panel
      if (
        classList.contains("bg-muted") &&
        (classList.contains("border-b") ||
          classList.contains("border-gray-200") ||
          parent.querySelector("h3") === element)
      ) {
        if (
          parent.querySelector("h3") === element ||
          (parent.querySelector("h3") && parent.children.length > 1)
        ) {
          bestMatch = parent;
        }
      }

      // Stop at layout wrapper
      if (
        parent.classList.contains("relative") &&
        parent.classList.contains("h-full") &&
        !classList.contains("flex-col")
      ) {
        break;
      }

      parent = parent.parentElement;
    }

    return bestMatch || element;
  }, []);

  // Find element by selector or text content
  const findElement = useCallback(
    (selector: string): Element | null => {
      const containsMatch = selector.match(/^(\w+):contains\("([^"]+)"\)$/);
      if (containsMatch) {
        const [, tagName, text] = containsMatch;
        const elements = Array.from(document.querySelectorAll(tagName));
        const foundElement = elements.find(
          (el) => el.textContent?.trim() === text
        );

        if (foundElement) {
          // For panel headers, find the parent container
          if (tagName === "h3") {
            return findPanelContainer(foundElement);
          }
          return foundElement;
        }
        return null;
      }

      return document.querySelector(selector);
    },
    [findPanelContainer]
  );

  // Calculate tooltip position based on element rect and preferred placement
  const calculateTooltipPosition = useCallback(
    (
      rect: DOMRect,
      preferredPosition: "top" | "bottom" | "left" | "right" | "auto"
    ): TooltipPosition => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let placement: "top" | "bottom" | "left" | "right" = "bottom";
      let top = rect.bottom + TOOLTIP_SPACING;
      let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;

      if (preferredPosition === "auto") {
        const spaceBottom = viewportHeight - rect.bottom;
        const spaceTop = rect.top;
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;

        if (spaceBottom >= TOOLTIP_HEIGHT + TOOLTIP_SPACING) {
          placement = "bottom";
          top = rect.bottom + TOOLTIP_SPACING;
          left = Math.max(
            16,
            Math.min(
              rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
              viewportWidth - TOOLTIP_WIDTH - 16
            )
          );
        } else if (spaceTop >= TOOLTIP_HEIGHT + TOOLTIP_SPACING) {
          placement = "top";
          top = rect.top - TOOLTIP_HEIGHT - TOOLTIP_SPACING;
          left = Math.max(
            16,
            Math.min(
              rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
              viewportWidth - TOOLTIP_WIDTH - 16
            )
          );
        } else if (spaceRight >= TOOLTIP_WIDTH + TOOLTIP_SPACING) {
          placement = "right";
          top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
          left = rect.right + TOOLTIP_SPACING;
        } else if (spaceLeft >= TOOLTIP_WIDTH + TOOLTIP_SPACING) {
          placement = "left";
          top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
          left = rect.left - TOOLTIP_WIDTH - TOOLTIP_SPACING;
        } else {
          // Fallback to bottom
          placement = "bottom";
          top = Math.min(
            rect.bottom + TOOLTIP_SPACING,
            viewportHeight - TOOLTIP_HEIGHT - 16
          );
          left = Math.max(
            16,
            Math.min(left, viewportWidth - TOOLTIP_WIDTH - 16)
          );
        }
      } else {
        placement = preferredPosition;
        switch (placement) {
          case "top":
            top = rect.top - TOOLTIP_HEIGHT - TOOLTIP_SPACING;
            left = Math.max(
              16,
              Math.min(
                rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
                viewportWidth - TOOLTIP_WIDTH - 16
              )
            );
            break;
          case "bottom":
            top = rect.bottom + TOOLTIP_SPACING;
            left = Math.max(
              16,
              Math.min(
                rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
                viewportWidth - TOOLTIP_WIDTH - 16
              )
            );
            break;
          case "left":
            top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
            left = rect.left - TOOLTIP_WIDTH - TOOLTIP_SPACING;
            break;
          case "right":
            top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;
            left = rect.right + TOOLTIP_SPACING;
            break;
        }
      }

      return { top, left, placement };
    },
    []
  );

  // Update element and tooltip positions
  const updateElementPosition = useCallback(() => {
    if (!currentStepData || !isActive) return;

    const element = findElement(currentStepData.target);
    if (!element) {
      // Skip to next step or close tour if element not found
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        onClose();
      }
      return;
    }

    const rect = element.getBoundingClientRect();
    setElementPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    const preferredPosition = currentStepData.position || "auto";
    const position = calculateTooltipPosition(rect, preferredPosition);
    setTooltipPosition(position);
  }, [
    currentStepData,
    isActive,
    currentStep,
    steps.length,
    onClose,
    findElement,
    calculateTooltipPosition,
  ]);

  // Update positions on scroll/resize
  useEffect(() => {
    if (!isActive) return;

    // Skip update for intro step
    if (currentStep === 0 && !elementPosition) {
      lastStepRef.current = currentStep;
      return;
    }

    // Skip if step hasn't changed
    if (lastStepRef.current === currentStep && elementPosition) {
      return;
    }

    lastStepRef.current = currentStep;

    const handleUpdate = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        updateElementPosition();
      });
    };

    const timeoutId = setTimeout(() => {
      updateElementPosition();
    }, 50);

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep]);

  // Reset to first step when tour becomes active
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
      setElementPosition(null);
      setTooltipPosition(null);
    }
  }, [isActive]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep === 0 && !elementPosition) {
      // Start tour from intro step
      lastStepRef.current = -1;
      setTimeout(() => {
        updateElementPosition();
      }, 100);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [
    currentStep,
    elementPosition,
    steps.length,
    onClose,
    updateElementPosition,
  ]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Get arrow style for tooltip
  const getArrowStyle = useMemo((): React.CSSProperties => {
    if (!tooltipPosition) return {};

    // Use white background for light mode, gray-800 for dark mode (matching the tooltip)
    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");
    const arrowColor = isDark ? "#1f2937" : "#ffffff";

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
    };

    switch (tooltipPosition.placement) {
      case "bottom":
        return {
          ...baseStyle,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid ${arrowColor}`,
          marginBottom: "-1px",
        };
      case "top":
        return {
          ...baseStyle,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderTop: `${ARROW_SIZE}px solid ${arrowColor}`,
          marginTop: "-1px",
        };
      case "left":
        return {
          ...baseStyle,
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          borderTop: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid transparent`,
          borderLeft: `${ARROW_SIZE}px solid ${arrowColor}`,
          marginLeft: "-1px",
        };
      case "right":
        return {
          ...baseStyle,
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          borderTop: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid ${arrowColor}`,
          marginRight: "-1px",
        };
    }
  }, [tooltipPosition]);

  // Early returns
  if (isMobile || !isActive) {
    return null;
  }

  const isIntroStep =
    currentStep === 0 && (!elementPosition || !currentStepData);

  // Render intro step
  if (isIntroStep) {
    return (
      <>
        <div
          className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-500 ease-in-out"
          style={{ backgroundColor: `rgba(0, 0, 0, ${OVERLAY_OPACITY})` }}
        />
        <div
          key="intro"
          className="fixed z-[9999] pointer-events-auto transition-all duration-500 ease-in-out"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "400px",
          }}
        >
          <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0 shadow-md">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Welcome to Mostage Studio
                </h3>
              </div>
              <button
                onClick={handleCancel}
                className="flex-shrink-0 p-1 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Let&apos;s take a quick tour to help you get started. <br />
              We&apos;ll show you the main features.
            </p>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex-1 !rounded-sm"
                style={buttonFocusStyles}
                onFocus={handleButtonFocus}
              >
                Skip Tour
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="flex-1 !rounded-sm"
                style={buttonFocusStyles}
                onFocus={handleButtonFocus}
              >
                Start Tour
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!elementPosition || !currentStepData) {
    return null;
  }

  // Calculate clip-path for overlay
  const { top, left, width, height } = elementPosition;
  const right = left + width;
  const bottom = top + height;

  return (
    <>
      {/* Overlay with rectangular spotlight */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-500 ease-in-out"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${OVERLAY_OPACITY})`,
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            ${left}px 100%,
            ${left}px ${top}px,
            ${right}px ${top}px,
            ${right}px ${bottom}px,
            ${left}px ${bottom}px,
            ${left}px 100%,
            100% 100%,
            100% 0%
          )`,
        }}
      />

      {/* Border around highlighted element */}
      <div
        className="fixed z-[9997] pointer-events-none transition-all duration-500 ease-in-out"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: "2px solid",
          borderColor: "rgb(99, 102, 241)", // indigo-500
          borderRadius: "0.375rem", // rounded-md
          boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.1)",
        }}
      />

      {/* Tooltip */}
      {tooltipPosition && (
        <div
          key={currentStep}
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-auto transition-all duration-500 ease-in-out"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            maxWidth: `${TOOLTIP_WIDTH}px`,
          }}
        >
          <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl p-5">
            <div style={getArrowStyle} />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0 shadow-md">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={handleCancel}
                className="flex-shrink-0 p-1 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {currentStepData.content}
            </p>

            {/* Progress indicator */}
            <div className="mb-4">
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index === currentStep
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                        : index < currentStep
                        ? "bg-indigo-400 dark:bg-indigo-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1 !rounded-sm"
                style={buttonFocusStyles}
                onFocus={handleButtonFocus}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="flex-1 !rounded-sm"
                style={buttonFocusStyles}
                onFocus={handleButtonFocus}
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                {currentStep < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
