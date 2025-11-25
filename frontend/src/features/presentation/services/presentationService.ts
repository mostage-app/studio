import { AuthService } from "@/features/auth/services/authService";

// Note: We use ID Token (not Access Token) for Cognito authentication
// ID Token contains user claims like cognito:username which backend needs

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Simple in-memory cache for presentations
const presentationCache = new Map<
  string,
  { data: Presentation; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(username: string, slug: string): string {
  return `${username}/${slug}`;
}

function getCached(username: string, slug: string): Presentation | null {
  const key = getCacheKey(username, slug);
  const cached = presentationCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(presentation: Presentation): void {
  const key = getCacheKey(presentation.username, presentation.slug);
  presentationCache.set(key, { data: presentation, timestamp: Date.now() });
}

function invalidateCache(username: string, slug: string): void {
  presentationCache.delete(getCacheKey(username, slug));
}

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL environment variable is not configured. " +
      "Please set it in your .env.local file."
  );
}

export interface Presentation {
  presentationId: string;
  userId: string;
  username: string;
  name: string;
  slug: string;
  markdown: string;
  config: Record<string, unknown>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresentationRequest {
  name: string;
  slug: string;
  markdown: string;
  config: Record<string, unknown>;
  isPublic: boolean;
}

export interface UpdatePresentationRequest {
  name?: string;
  slug?: string;
  markdown?: string;
  config?: Record<string, unknown>;
  isPublic?: boolean;
}

function getAuthHeaders(): HeadersInit {
  // Use ID Token for Cognito authentication (contains user claims like username)
  const idToken = AuthService.getIdToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  return headers;
}

export async function getPresentations(
  username: string
): Promise<Presentation[]> {
  try {
    const response = await fetch(`${API_URL}/users/${username}/presentations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch presentations: ${response.statusText}`);
    }

    const data = await response.json();
    const presentations = data.presentations || [];

    // Cache all fetched presentations
    presentations.forEach((p: Presentation) => setCache(p));

    return presentations;
  } catch (error) {
    console.error("Error fetching presentations:", error);
    throw error;
  }
}

export async function getPresentation(
  username: string,
  slug: string
): Promise<Presentation> {
  // Check cache first
  const cached = getCached(username, slug);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_URL}/users/${username}/presentations/${slug}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Presentation not found");
      }
      throw new Error(`Failed to fetch presentation: ${response.statusText}`);
    }

    const data = await response.json();
    const presentation = data.presentation || data;
    setCache(presentation);
    return presentation;
  } catch (error) {
    console.error("Error fetching presentation:", error);
    throw error;
  }
}

export async function createPresentation(
  username: string,
  data: CreatePresentationRequest
): Promise<Presentation> {
  try {
    const response = await fetch(`${API_URL}/users/${username}/presentations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to create presentation: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating presentation:", error);
    throw error;
  }
}

export async function updatePresentation(
  username: string,
  slug: string,
  data: UpdatePresentationRequest
): Promise<Presentation> {
  // Invalidate cache before update
  invalidateCache(username, slug);

  try {
    const response = await fetch(
      `${API_URL}/users/${username}/presentations/${slug}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to update presentation: ${response.statusText}`
      );
    }

    const result = await response.json();
    // Cache updated presentation if returned
    if (result.presentation) {
      setCache(result.presentation);
    }
    return result;
  } catch (error) {
    console.error("Error updating presentation:", error);
    throw error;
  }
}

export async function deletePresentation(
  username: string,
  slug: string
): Promise<void> {
  // Invalidate cache
  invalidateCache(username, slug);

  try {
    const response = await fetch(
      `${API_URL}/users/${username}/presentations/${slug}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to delete presentation: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error deleting presentation:", error);
    throw error;
  }
}
