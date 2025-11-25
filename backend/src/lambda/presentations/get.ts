import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PresentationsTable } from "../../utils/dynamodb";
import { isAuthorized } from "../../utils/auth";

/**
 * Lambda handler for getting a presentation by slug
 * GET /users/{username}/presentations/{slug}
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get username and slug from path parameters
    const username = event.pathParameters?.username;
    const slug = event.pathParameters?.slug;

    if (!username || !slug) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Username and slug are required",
        }),
      };
    }

    // Get presentation
    const presentation = await PresentationsTable.getByUsernameAndSlug(
      username,
      slug
    );

    if (!presentation) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Presentation not found" }),
      };
    }

    // Check authorization: if not owner and not public, return 404
    const isOwner = await isAuthorized(event, username);
    if (!isOwner && !presentation.isPublic) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Presentation not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(presentation),
    };
  } catch (error) {
    console.error("Error getting presentation:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
    };
  }
};
