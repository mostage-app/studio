import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Custom hook to warn users before leaving the page with unsaved changes
 * Handles both browser navigation (beforeunload) and Next.js route changes
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  const pathname = usePathname();
  const isNavigatingRef = useRef(false);
  const currentPathRef = useRef(pathname);

  // Update current path when it changes
  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname]);

  // Handle browser navigation (closing tab/window, refreshing, etc.)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers ignore custom messages and show their own
      // But we still need to call preventDefault() and set returnValue
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle Next.js route changes via link clicks
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        const href = link.getAttribute("href");
        if (!href) return;

        // Check if it's an internal Next.js link
        const isInternalLink =
          href.startsWith("/") ||
          href.startsWith(window.location.origin) ||
          (!href.startsWith("http") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:"));

        // Skip if it's an external link, download, or opens in new tab
        const isExternal =
          link.target === "_blank" ||
          link.hasAttribute("download") ||
          href.startsWith("http") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:");

        // Only intercept internal navigation
        if (isInternalLink && !isExternal) {
          // Check if it's a different route
          const url = new URL(href, window.location.origin);
          const isDifferentRoute = url.pathname !== currentPathRef.current;

          if (isDifferentRoute) {
            const shouldLeave = window.confirm(
              "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
            );

            if (!shouldLeave) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            } else {
              // Mark that navigation was confirmed
              isNavigatingRef.current = true;
            }
          }
        }
      }
    };

    // Intercept browser back/forward buttons
    const handlePopState = (e: PopStateEvent) => {
      if (!hasUnsavedChanges) return;

      const shouldLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      );

      if (!shouldLeave) {
        // Push current state back to prevent navigation
        window.history.pushState(null, "", window.location.href);
        e.preventDefault();
      } else {
        // Mark that navigation was confirmed
        isNavigatingRef.current = true;
      }
    };

    // Use capture phase to intercept before Next.js router handles it
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      isNavigatingRef.current = false;
    };
  }, [hasUnsavedChanges]);
}
