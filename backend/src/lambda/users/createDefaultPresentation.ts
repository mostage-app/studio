import { CognitoUserPoolTriggerEvent } from "aws-lambda";
import { PresentationsTable, UsersTable } from "../../utils/dynamodb";
import { Presentation } from "../../types/presentation";
import { User } from "../../types/user";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

// Read template files from shared directory
// In Lambda runtime, templates are copied to /var/task/templates during bundling
const getTemplatePath = (filename: string): string => {
  // Try Lambda runtime path first (bundled)
  // In Lambda, __dirname points to /var/task/lambda/users
  // So templates should be at /var/task/templates/samples/basic
  const bundledPath = path.join(
    __dirname,
    "../../templates/samples/basic",
    filename
  );
  if (fs.existsSync(bundledPath)) {
    return bundledPath;
  }

  // Alternative path (if bundled differently)
  const altPath = path.join("/var/task/templates/samples/basic", filename);
  if (fs.existsSync(altPath)) {
    return altPath;
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

  throw new Error(
    `Template file not found: ${filename}. Tried: ${bundledPath}, ${altPath}, ${sharedPath}`
  );
};

// Load templates lazily in handler to ensure files are available
let SAMPLE_MARKDOWN: string | null = null;
let SAMPLE_CONFIG: Record<string, unknown> | null = null;

function loadTemplates(): {
  SAMPLE_MARKDOWN: string;
  SAMPLE_CONFIG: Record<string, unknown>;
} {
  if (SAMPLE_MARKDOWN === null || SAMPLE_CONFIG === null) {
    SAMPLE_MARKDOWN = fs.readFileSync(getTemplatePath("content.md"), "utf-8");
    SAMPLE_CONFIG = JSON.parse(
      fs.readFileSync(getTemplatePath("config.json"), "utf-8")
    ) as Record<string, unknown>;
  }
  return {
    SAMPLE_MARKDOWN: SAMPLE_MARKDOWN,
    SAMPLE_CONFIG: SAMPLE_CONFIG as Record<string, unknown>,
  };
}

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

    // Load templates
    const { SAMPLE_MARKDOWN: markdown, SAMPLE_CONFIG: config } =
      loadTemplates();

    // Check if default presentation already exists
    const existingPresentation = await PresentationsTable.getByUsernameAndSlug(
      username,
      config.slug as string
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
      name: config.name as string,
      slug: config.slug as string,
      markdown: markdown,
      config: config as unknown as Presentation["config"],
      isPublic: false,
      isTemplate: false,
      createdAt: now,
      updatedAt: now,
    };

    await PresentationsTable.create(presentation);

    console.log(
      `Default presentation "${config.name}" created for user: ${username} (${userId})`
    );

    return event;
  } catch (error) {
    console.error("Error in PostConfirmation trigger:", error);
    // Don't fail the user registration if this fails
    return event;
  }
};
