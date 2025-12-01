import * as dotenv from "dotenv";
import * as path from "path";
import { BaseStudioStack, StackConfig } from "./base";

// Load environment variables from .env.dev.local
// Path: infrastructure/.env.dev.local
dotenv.config({ path: path.join(__dirname, "../../.env.dev.local") });

/**
 * Development environment stack
 */
export class StudioStackDev extends BaseStudioStack {
  protected getConfig(): StackConfig {
    return {
      environment: "dev",
      userPoolName: "mostage-studio-cognito-user-pool-dev",
      userPoolClientName: "mostage-studio-cognito-client-dev",
      sesConfig: {
        createResources: false, // Set to true if you want to create SES resources
        fromEmail: "", // Set to your verified email address
        replyToEmail: "",
        configurationSetName: "",
      },
      apiConfig: {
        // Get from .env.dev.local file or environment variable
        // Create infrastructure/.env.dev.local and add: UNSPLASH_ACCESS_KEY=your_key_here
        unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || "",
      },
    };
  }
}
