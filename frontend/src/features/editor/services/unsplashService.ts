/**
 * Unsplash API Service
 * Handles image search and download tracking through secure API routes
 */

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    links: {
      self: string;
      html: string;
    };
  };
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface UnsplashSearchParams {
  query: string;
  page?: number;
  perPage?: number;
}

/**
 * Search for photos on Unsplash
 */
export async function searchUnsplashPhotos(
  params: UnsplashSearchParams
): Promise<UnsplashSearchResponse> {
  const { query, page = 1, perPage = 20 } = params;

  const url = new URL("/api/unsplash/search", window.location.origin);
  url.searchParams.append("query", query);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("per_page", perPage.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to search images",
    }));
    throw new Error(error.error || "Failed to search images");
  }

  return response.json();
}

/**
 * Track image download as required by Unsplash API guidelines
 * This must be called when a user uses a photo
 */
export async function trackUnsplashDownload(
  downloadLocation: string
): Promise<void> {
  try {
    const response = await fetch("/api/unsplash/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ downloadLocation }),
    });

    if (!response.ok) {
      // Don't throw error - download tracking is not critical for user experience
      console.warn("Failed to track Unsplash download");
    }
  } catch (error) {
    // Silently fail - download tracking should not break user experience
    console.warn("Error tracking Unsplash download:", error);
  }
}

/**
 * Generate attribution text for Unsplash photos
 * Format: Photo by [Photographer Name] on Unsplash
 * Required by Unsplash API guidelines
 */
export function generateAttribution(photo: UnsplashPhoto): string {
  const photographerName = photo.user.name || photo.user.username;
  const unsplashLink = `https://unsplash.com/?utm_source=mostage-studio&utm_medium=referral`;
  const photographerLink = photo.user.links.html || unsplashLink;

  return `Photo by [${photographerName}](${photographerLink}) on [Unsplash](${unsplashLink})`;
}

/**
 * Generate markdown image syntax with attribution
 * Uses hotlink to original Unsplash URL as required
 */
export function generateMarkdownImage(
  photo: UnsplashPhoto,
  altText?: string,
  size: "small" | "regular" | "full" = "regular"
): string {
  // Use selected size for image URL
  // This is the hotlinked URL as required by Unsplash
  const imageUrl = photo.urls[size];
  const alt =
    altText || photo.alt_description || photo.description || "Unsplash image";

  // Generate markdown with attribution
  const markdown = `![${alt}](${imageUrl})`;
  const attribution = generateAttribution(photo);

  return `${markdown}\n\n*${attribution}*`;
}
