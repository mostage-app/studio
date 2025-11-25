import { CognitoUserPoolTriggerEvent } from "aws-lambda";
import { PresentationsTable, UsersTable } from "../../utils/dynamodb";
import { Presentation } from "../../types/presentation";
import { User } from "../../types/user";
import { v4 as uuidv4 } from "uuid";

// Sample presentation content (from frontend/public/samples/basic)
const SAMPLE_MARKDOWN = `# Welcome to Mostage

## Presentation Framework

---

## What is Mostage?

#### Presentation framework

###### based on

#### Markdown and HTML

---

## Key Features

- **Markdown Support** - Write in Markdown
- **HTML Support** - Use HTML when needed
- **Web-based** - Runs in any modern browser

---

## How can I use Mostage?

- ##### Use the CLI
- ##### Use the NPM package
- ##### Use the Online Editor

---

<!-- confetti -->

### Happy presenting with Mostage!

#### Get started now [mo.js.org](https://mo.js.org)

---

<!-- confetti -->

![LOGO](https://mostage.app/images/logo.svg)

---
`;

const SAMPLE_CONFIG = {
  name: "Basic Example",
  slug: "basic-example",
  theme: "dark",
  scale: 1.0,
  loop: false,
  keyboard: true,
  touch: true,
  urlHash: true,
  transition: {
    type: "horizontal",
    duration: 300,
    easing: "ease-in-out",
  },
  centerContent: {
    vertical: true,
    horizontal: true,
  },
  header: {
    enabled: true,
    content: "# Mostage",
    position: "top-left",
    showOnFirstSlide: false,
  },
  footer: {
    enabled: true,
    content: "#### Presentation framework",
    position: "bottom-left",
    showOnFirstSlide: false,
  },
  plugins: {
    ProgressBar: {
      enabled: true,
      position: "bottom",
      height: "12px",
      color: "#007acc",
    },
    SlideNumber: {
      enabled: true,
      position: "bottom-right",
      format: "current/total",
    },
    Controller: {
      enabled: true,
      position: "bottom-center",
    },
    Confetti: {
      enabled: true,
      particleCount: 50,
      size: { min: 5, max: 10 },
      duration: 3000,
      delay: 0,
      colors: [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#96ceb4",
        "#feca57",
        "#ff9ff3",
        "#54a0ff",
      ],
    },
  },
  background: [
    {
      imagePath: "https://mostage.app/demo/images/background.svg",
      size: "cover",
      position: "center",
      repeat: "no-repeat",
      bgColor: "#000000",
      global: false,
      allSlidesExcept: [4, 5],
    },
    {
      imagePath: "https://mostage.app/demo/images/background-end.svg",
      size: "cover",
      position: "center",
      repeat: "no-repeat",
      bgColor: "#000000",
      global: false,
      allSlides: [5],
    },
  ],
};

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
