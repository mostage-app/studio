import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PresentationsTable } from "../../utils/dynamodb";
import { isAuthorized } from "../../utils/auth";
import { UpdatePresentationRequest } from "../../types/presentation";

/**
 * Validate slug format (URL-friendly)
 */
function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Lambda handler for updating a presentation
 * PUT /users/{username}/presentations/{slug}
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
    const existingPresentation = await PresentationsTable.getByUsernameAndSlug(
      username,
      slug
    );
    if (!existingPresentation) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Presentation not found" }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Request body is required" }),
      };
    }

    const requestData: UpdatePresentationRequest = JSON.parse(event.body);

    // Validate slug format if provided
    if (requestData.slug && !validateSlug(requestData.slug)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error:
            "Invalid slug format. Slug must be lowercase, alphanumeric, and contain only hyphens",
        }),
      };
    }

    // Check slug uniqueness if slug is being changed
    if (requestData.slug && requestData.slug !== slug) {
      const slugExists = await PresentationsTable.slugExists(
        username,
        requestData.slug
      );
      if (slugExists) {
        return {
          statusCode: 409,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            error: "A presentation with this slug already exists",
          }),
        };
      }
    }

    // Update presentation
    await PresentationsTable.update(
      existingPresentation.presentationId,
      requestData
    );

    // Get updated presentation
    const updatedPresentation = requestData.slug
      ? await PresentationsTable.getByUsernameAndSlug(
          username,
          requestData.slug
        )
      : await PresentationsTable.getByUsernameAndSlug(username, slug);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(updatedPresentation),
    };
  } catch (error) {
    console.error("Error updating presentation:", error);
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
