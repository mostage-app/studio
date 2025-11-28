/**
 * Generate a URL-friendly slug from a name
 * Converts to lowercase, removes special characters, replaces spaces with hyphens
 * @param name - The name to convert to a slug
 * @returns A URL-friendly slug (max 50 characters)
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}
