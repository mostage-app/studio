"use client";

import { usePathname } from "next/navigation";
import { GlobalHeader } from "./GlobalHeader";

/**
 * Conditionally renders GlobalHeader based on pathname
 * Hides header for /view routes (/{username}/{slug}/view)
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  const isViewRoute = pathname?.endsWith("/view");

  if (isViewRoute) {
    return null;
  }

  return <GlobalHeader />;
}
