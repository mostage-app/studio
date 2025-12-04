import type { SharePlatform } from "../types";

/**
 * Generate share URL for a presentation
 */
export function getPresentationShareUrl(
  username: string,
  slug: string
): string {
  return `${window.location.origin}/${username}/${slug}/view`;
}

/**
 * Generate share text for a presentation
 */
export function getPresentationShareText(name: string): string {
  return `Check out "${name}" presentation on Mostage! #mostage #presentation `;
}

/**
 * Get social platform share URLs
 */
export function getSocialShareUrls(
  url: string,
  text: string
): Record<Exclude<SharePlatform, "copy">, string> {
  const urlEncoded = encodeURIComponent(url);
  const textEncoded = encodeURIComponent(text);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${urlEncoded}&text=${textEncoded}`,
    facebook: `https://www.facebook.com/sharer.php?u=${urlEncoded}`,
    linkedin: `https://www.linkedin.com/feed/?shareActive&mini=true&text=${textEncoded}&url=${urlEncoded}`,
  };
}

/**
 * Share presentation to clipboard
 */
export async function shareToClipboard(
  text: string,
  url: string
): Promise<void> {
  const fullText = `${text}${url}`;
  await navigator.clipboard.writeText(fullText);
}

/**
 * Share presentation using Web Share API
 */
export async function shareViaWebShareAPI(
  title: string,
  text: string,
  url: string
): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share API is not supported");
  }

  await navigator.share({
    title,
    text,
    url,
  });
}

/**
 * Open social platform share window
 */
export function openSocialShareWindow(
  platform: Exclude<SharePlatform, "copy">,
  url: string,
  text: string
): void {
  const urls = getSocialShareUrls(url, text);
  window.open(urls[platform], "_blank", "width=600,height=400");
}
