import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for API routes
export const dynamic = "force-dynamic";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

export async function GET(request: NextRequest) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: "Unsplash API key not configured" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "20";

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const url = new URL(`${UNSPLASH_API_URL}/search/photos`);
    url.searchParams.append("query", query);
    url.searchParams.append("page", page);
    url.searchParams.append("per_page", perPage);
    url.searchParams.append("client_id", UNSPLASH_ACCESS_KEY);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.errors || "Failed to fetch from Unsplash" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unsplash API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
