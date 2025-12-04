import CryptoJS from "crypto-js";

export const GRAVATAR_DEFAULT_SIZE = 96;
export const COPY_FEEDBACK_DURATION = 2000;

/**
 * Generate Gravatar URL from email
 */
export function getGravatarUrl(
  email: string,
  size: number = GRAVATAR_DEFAULT_SIZE
): string {
  const normalizedEmail = email.toLowerCase().trim();
  const emailHash = CryptoJS.MD5(normalizedEmail).toString();
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=404&r=pg`;
}

/**
 * Format date to short format (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date to full format (e.g., "January 15, 2024")
 */
export function formatFullDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}
