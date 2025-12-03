import * as AWS from "aws-sdk";
import { Presentation } from "../types/presentation";
import { User } from "../types/user";

const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Get environment variable for table name
 */
function getTableName(tableType: "presentations" | "users"): string {
  const env = process.env.ENVIRONMENT || "dev";
  return `mostage-studio-${tableType}-${env}`;
}

/**
 * Presentations Table Operations
 */
export const PresentationsTable = {
  /**
   * Get presentation by ID
   */
  async getById(presentationId: string): Promise<Presentation | null> {
    const result = await dynamodb
      .get({
        TableName: getTableName("presentations"),
        Key: { presentationId },
      })
      .promise();

    return (result.Item as Presentation) || null;
  },

  /**
   * Get presentation by username and slug (using GSI)
   */
  async getByUsernameAndSlug(
    username: string,
    slug: string
  ): Promise<Presentation | null> {
    const result = await dynamodb
      .query({
        TableName: getTableName("presentations"),
        IndexName: "username-slug-index",
        KeyConditionExpression: "username = :username AND slug = :slug",
        ExpressionAttributeValues: {
          ":username": username,
          ":slug": slug,
        },
        Limit: 1,
      })
      .promise();

    return (result.Items?.[0] as Presentation) || null;
  },

  /**
   * List presentations by username (using GSI)
   */
  async listByUsername(
    username: string,
    includePrivate: boolean = false
  ): Promise<Presentation[]> {
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: getTableName("presentations"),
      IndexName: "username-index",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    };

    // Filter out private presentations if not owner
    if (!includePrivate) {
      params.FilterExpression = "isPublic = :isPublic";
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues,
        ":isPublic": true,
      };
    }

    const result = await dynamodb.query(params).promise();
    return (result.Items as Presentation[]) || [];
  },

  /**
   * Create presentation
   */
  async create(presentation: Presentation): Promise<void> {
    await dynamodb
      .put({
        TableName: getTableName("presentations"),
        Item: presentation,
      })
      .promise();
  },

  /**
   * Update presentation
   */
  async update(
    presentationId: string,
    updates: Partial<Presentation>
  ): Promise<void> {
    const setExpressions: string[] = [];
    const removeExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.keys(updates).forEach((key) => {
      if (key === "presentationId") {
        return; // Skip presentationId
      }

      const attrName = `#${key}`;
      expressionAttributeNames[attrName] = key;

      // If value is undefined, remove the attribute
      if (updates[key as keyof Presentation] === undefined) {
        removeExpressions.push(attrName);
      } else {
        // Otherwise, set the attribute
        const attrValue = `:${key}`;
        setExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeValues[attrValue] =
          updates[key as keyof Presentation];
      }
    });

    // Always update updatedAt
    setExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    // Build the final update expression
    const updateParts: string[] = [];
    if (setExpressions.length > 0) {
      updateParts.push(`SET ${setExpressions.join(", ")}`);
    }
    if (removeExpressions.length > 0) {
      updateParts.push(`REMOVE ${removeExpressions.join(", ")}`);
    }

    // Only perform update if there are changes
    if (updateParts.length > 0) {
      await dynamodb
        .update({
          TableName: getTableName("presentations"),
          Key: { presentationId },
          UpdateExpression: updateParts.join(" "),
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues:
            Object.keys(expressionAttributeValues).length > 0
              ? expressionAttributeValues
              : undefined,
        })
        .promise();
    }
  },

  /**
   * Delete presentation
   */
  async delete(presentationId: string): Promise<void> {
    await dynamodb
      .delete({
        TableName: getTableName("presentations"),
        Key: { presentationId },
      })
      .promise();
  },

  /**
   * Check if slug exists for user
   */
  async slugExists(username: string, slug: string): Promise<boolean> {
    const presentation = await this.getByUsernameAndSlug(username, slug);
    return presentation !== null;
  },
};

/**
 * Users Table Operations
 */
export const UsersTable = {
  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<User | null> {
    const result = await dynamodb
      .get({
        TableName: getTableName("users"),
        Key: { userId },
      })
      .promise();

    return (result.Item as User) || null;
  },

  /**
   * Get user by username (using GSI)
   */
  async getByUsername(username: string): Promise<User | null> {
    const result = await dynamodb
      .query({
        TableName: getTableName("users"),
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
          ":username": username,
        },
        Limit: 1,
      })
      .promise();

    return (result.Items?.[0] as User) || null;
  },

  /**
   * Create user
   */
  async create(user: User): Promise<void> {
    await dynamodb
      .put({
        TableName: getTableName("users"),
        Item: user,
      })
      .promise();
  },

  /**
   * Update user
   */
  async update(userId: string, updates: Partial<User>): Promise<void> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression dynamically
    Object.keys(updates).forEach((key) => {
      if (key !== "userId" && updates[key as keyof User] !== undefined) {
        const attrName = `#${key}`;
        const attrValue = `:${key}`;
        updateExpression.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = updates[key as keyof User];
      }
    });

    // Always update updatedAt
    updateExpression.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    await dynamodb
      .update({
        TableName: getTableName("users"),
        Key: { userId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  },
};
