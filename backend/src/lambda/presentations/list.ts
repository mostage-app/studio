import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PresentationsTable } from "../../utils/dynamodb";
import { isAuthorized } from "../../utils/auth";

/**
 * Lambda handler for listing presentations
 * GET /users/{username}/presentations
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

    // Check if user is authorized (can see private presentations)
    const includePrivate = await isAuthorized(event, username);

    // Get presentations
    const presentations = await PresentationsTable.listByUsername(
      username,
      includePrivate
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ presentations }),
    };
  } catch (error) {
    console.error("Error listing presentations:", error);
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
