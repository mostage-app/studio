import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PresentationsTable } from "../../utils/dynamodb";
import { isAuthorized } from "../../utils/auth";

/**
 * Lambda handler for deleting a presentation
 * DELETE /users/{username}/presentations/{slug}
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

    // Check authorization
    const isOwner = await isAuthorized(event, username);
    if (!isOwner) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Forbidden" }),
      };
    }

    // Get existing presentation
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

    // Delete presentation
    await PresentationsTable.delete(presentation.presentationId);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Presentation deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting presentation:", error);
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
