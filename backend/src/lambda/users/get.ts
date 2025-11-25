import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { UsersTable } from "../../utils/dynamodb";
import { PublicUserInfo } from "../../types/user";

/**
 * Lambda handler for getting user info
 * GET /users/{username}
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

    // Get user from DynamoDB
    const user = await UsersTable.getByUsername(username);

    if (!user) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Return public user info only
    const publicUserInfo: PublicUserInfo = {
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(publicUserInfo),
    };
  } catch (error) {
    console.error("Error getting user:", error);
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
