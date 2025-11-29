import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ViewPresentationClient } from "./ViewPresentationClient";

interface ViewPresentationPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

/**
 * Generate metadata for the presentation view page
 */
export async function generateMetadata({
  params,
}: ViewPresentationPageProps): Promise<Metadata> {
  const { username, slug } = await params;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    return {
      title: "Mostage - View Presentation",
      description: "Presentation Framework",
    };
  }

  // Get authentication token from cookies for metadata generation
  const cookieStore = await cookies();
  const idToken = cookieStore.get("mostage-id-token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  try {
    const response = await fetch(
      `${API_URL}/users/${username}/presentations/${slug}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      const presentation = data.presentation || data;
      return {
        title: `Mostage - ${presentation.name}`,
        description: `View ${presentation.name} presentation by ${username}`,
      };
    }
  } catch (error) {
    console.error("Error fetching presentation for metadata:", error);
  }

  return {
    title: "Mostage - View Presentation",
    description: "Presentation Framework",
  };
}

/**
 * Server Component for view-only presentation pages
 * Fetches presentation data and passes it to client component
 */
export default async function ViewPresentationPage({
  params,
}: ViewPresentationPageProps) {
  const { username, slug } = await params;

  if (!username || !slug) {
    notFound();
  }

  // Fetch presentation from API
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  // Get authentication token from cookies (if available)
  // Note: Tokens are stored in localStorage on client-side, but for Server Components
  // we check cookies. If tokens are not in cookies, we'll send request without auth
  // and backend will handle authorization appropriately.
  const cookieStore = await cookies();
  const idToken = cookieStore.get("mostage-id-token")?.value;

  // Prepare headers with authentication if token is available
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  try {
    const response = await fetch(
      `${API_URL}/users/${username}/presentations/${slug}`,
      {
        method: "GET",
        headers,
        // Disable caching for fresh data
        cache: "no-store",
      }
    );

    if (!response.ok) {
      // Backend returns 404 for:
      // - Presentation doesn't exist
      // - Presentation is private AND user is not the owner
      // - User is not authenticated and presentation is private
      if (response.status === 404 || response.status === 403) {
        notFound();
      }
      throw new Error(`Failed to fetch presentation: ${response.statusText}`);
    }

    const data = await response.json();
    const presentation = data.presentation || data;

    // Authorization check:
    // - Backend already verifies authorization and returns 404 if:
    //   - Presentation is private AND user is not the owner
    //   - Presentation is private AND user is not authenticated
    // - If we reach here with a successful response, it means:
    //   - Presentation is public (anyone can view), OR
    //   - Presentation is private AND user is authenticated AND user is the owner (backend verified)
    // - No additional client-side check needed as backend handles all authorization

    return (
      <ViewPresentationClient
        markdown={presentation.markdown}
        config={presentation.config}
        presentationName={presentation.name}
      />
    );
  } catch (error) {
    console.error("Error fetching presentation:", error);
    notFound();
  }
}
