import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

/**
 * Lambda handler for Unsplash image search
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Check API key
    if (!UNSPLASH_ACCESS_KEY) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Unsplash API key not configured" }),
      };
    }

    // Get query parameters
    const query = event.queryStringParameters?.query;
    const page = event.queryStringParameters?.page || "1";
    const perPage = event.queryStringParameters?.per_page || "20";

    // Validate query
    if (!query || query.trim() === "") {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Search query is required" }),
      };
    }

    // Build Unsplash API URL
    const url = new URL(`${UNSPLASH_API_URL}/search/photos`);
    url.searchParams.append("query", query);
    url.searchParams.append("page", page);
    url.searchParams.append("per_page", perPage);
    url.searchParams.append("client_id", UNSPLASH_ACCESS_KEY);

    // Call Unsplash API
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        errors?: string;
      };
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: errorData.errors || "Failed to fetch from Unsplash",
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Unsplash API error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
