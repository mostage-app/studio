import { CognitoUserPoolTriggerEvent } from "aws-lambda";
import { PresentationsTable, UsersTable } from "../../utils/dynamodb";
import { Presentation } from "../../types/presentation";
import { User } from "../../types/user";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

// Read template files from shared directory
// In Lambda runtime, templates are copied to /asset-output/templates during bundling
const getTemplatePath = (filename: string): string => {
  // Try Lambda runtime path first (bundled)
  const bundledPath = path.join(
    __dirname,
    "../../../templates/samples/basic",
    filename
  );
  if (fs.existsSync(bundledPath)) {
    return bundledPath;
  }

  // Fallback to shared directory (for local development/testing)
  const sharedPath = path.join(
    __dirname,
    "../../../../shared/samples/basic",
    filename
  );
  if (fs.existsSync(sharedPath)) {
    return sharedPath;
  }

  throw new Error(`Template file not found: ${filename}`);
};

const SAMPLE_MARKDOWN = fs.readFileSync(getTemplatePath("content.md"), "utf-8");
const SAMPLE_CONFIG = JSON.parse(
  fs.readFileSync(getTemplatePath("config.json"), "utf-8")
);

/**
 * Lambda handler for Cognito Post Confirmation trigger
 * Creates default presentation and user record for new users
 */
export const handler = async (
  event: CognitoUserPoolTriggerEvent
): Promise<CognitoUserPoolTriggerEvent> => {
  console.log("PostConfirmation trigger received:", JSON.stringify(event));

  try {
    // Extract user info from Cognito event
    const userId = event.request.userAttributes.sub;
    const username = event.userName;
    const email = event.request.userAttributes.email;
    const givenName = event.request.userAttributes.given_name;
    const familyName = event.request.userAttributes.family_name;

    console.log(`Processing user: ${username} (${userId})`);

    if (!userId || !username) {
      console.error("Missing userId or username in Cognito event");
      return event;
    }

    const now = new Date().toISOString();

    // Create user record in DynamoDB
    const user: User = {
      userId,
      username,
      email: email || "",
      name:
        givenName && familyName
          ? `${givenName} ${familyName}`
          : givenName || familyName || username,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await UsersTable.create(user);
      console.log(`User record created for: ${username}`);
    } catch (userError) {
      console.error("Error creating user record:", userError);
      // Continue to create presentation even if user record fails
    }

    // Check if default presentation already exists
    const existingPresentation = await PresentationsTable.getByUsernameAndSlug(
      username,
      SAMPLE_CONFIG.slug
    );

    if (existingPresentation) {
      console.log("Default presentation already exists for user:", username);
      return event;
    }

    // Create default presentation
    const presentation: Presentation = {
      presentationId: uuidv4(),
      userId: userId,
      username: username,
      name: SAMPLE_CONFIG.name,
      slug: SAMPLE_CONFIG.slug,
      markdown: SAMPLE_MARKDOWN,
      config: SAMPLE_CONFIG as unknown as Presentation["config"],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };

    await PresentationsTable.create(presentation);

    console.log(
      `Default presentation "${SAMPLE_CONFIG.name}" created for user: ${username} (${userId})`
    );

    return event;
  } catch (error) {
    console.error("Error in PostConfirmation trigger:", error);
    // Don't fail the user registration if this fails
    return event;
  }
};
