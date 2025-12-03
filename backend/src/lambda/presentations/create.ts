import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { PresentationsTable } from "../../utils/dynamodb";
import { extractUserFromEvent, isAuthorized } from "../../utils/auth";
import {
  CreatePresentationRequest,
  Presentation,
} from "../../types/presentation";

/**
 * Validate slug format (URL-friendly)
 */
function validateSlug(slug: string): boolean {
  // Slug should be lowercase, alphanumeric, and hyphens only
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Lambda handler for creating a presentation
 * POST /users/{username}/presentations
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get username from path parameters
    const username = event.pathParameters?.username;
    if (!username) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Username is required" }),
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

    // Get user info
    const user = await extractUserFromEvent(event);
    if (!user) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Unauthorized" }),
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

    const requestData: CreatePresentationRequest = JSON.parse(event.body);

    // Validate required fields (markdown can be empty string)
    if (
      !requestData.name ||
      !requestData.slug ||
      requestData.markdown === undefined ||
      !requestData.config
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Missing required fields: name, slug, markdown, config",
        }),
      };
    }

    // Validate slug format
    if (!validateSlug(requestData.slug)) {
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

    // Check if slug already exists for this user
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

    // Create presentation
    const now = new Date().toISOString();
    const presentation: Presentation = {
      presentationId: uuidv4(),
      userId: user.userId,
      username: username,
      name: requestData.name,
      slug: requestData.slug,
      markdown: requestData.markdown,
      config: requestData.config,
      isPublic: requestData.isPublic ?? false,
      isTemplate: requestData.isTemplate ?? false,
      createdAt: now,
      updatedAt: now,
    };

    await PresentationsTable.create(presentation);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(presentation),
    };
  } catch (error) {
    console.error("Error creating presentation:", error);
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
