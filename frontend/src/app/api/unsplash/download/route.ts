import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for API routes
export const dynamic = "force-dynamic";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Track image download as required by Unsplash API guidelines
 * This endpoint triggers the download event when a user uses a photo
 */
export async function POST(request: NextRequest) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: "Unsplash API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { downloadLocation } = body;

    if (!downloadLocation) {
      return NextResponse.json(
        { error: "Download location is required" },
        { status: 400 }
      );
    }

    // Trigger the download event
    // Note: downloadLocation already contains the full URL, but we need to add client_id
    // The downloadLocation URL format: https://api.unsplash.com/photos/{id}/download?client_id={access_key}
    // If it doesn't have client_id, we add it
    const downloadUrl = new URL(downloadLocation);
    if (!downloadUrl.searchParams.has("client_id")) {
      downloadUrl.searchParams.append("client_id", UNSPLASH_ACCESS_KEY);
    }

    const response = await fetch(downloadUrl.toString(), {
      method: "GET",
      headers: {
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to trigger download" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsplash download tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
