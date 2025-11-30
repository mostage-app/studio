import * as dotenv from "dotenv";
import * as path from "path";
import { BaseStudioStack, StackConfig } from "./base";

// Load environment variables from .env.prod.local
// Path: infrastructure/.env.prod.local
dotenv.config({ path: path.join(__dirname, "../../.env.prod.local") });

/**
 * Production environment stack
 */
export class StudioStackProd extends BaseStudioStack {
  protected getConfig(): StackConfig {
    return {
      environment: "prod",
      userPoolName: "mostage-studio-cognito-user-pool-prod",
      userPoolClientName: "mostage-studio-cognito-client-prod",
      sesConfig: {
        createResources: false, // Set to true if you want to create SES resources
        fromEmail: "", // Set to your verified email address
        replyToEmail: "",
        configurationSetName: "",
      },
      apiConfig: {
        // Get from .env.prod.local file or environment variable
        // Create infrastructure/.env.prod.local and add: UNSPLASH_ACCESS_KEY=your_key_here
        unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || "",
        // Production: Restrict CORS to your frontend domain(s)
        // Example: ["https://studio.mostage.app", "https://www.mostage.app"]
        allowedOrigins: process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
          : [], // Must be set for production!
        // Rate limiting for production
        rateLimit: {
          requestsPerSecond: 100, // Max 100 requests per second
          burstLimit: 200, // Max 200 requests in burst
        },
      },
      amplifyConfig: {
        repository:
          process.env.AMPLIFY_REPOSITORY ||
          "https://github.com/mostage-app/studio",
        branch: process.env.AMPLIFY_BRANCH || "main",
        // Optional: GitHub token secret ARN from AWS Secrets Manager
        // githubTokenSecretArn: process.env.GITHUB_TOKEN_SECRET_ARN,
        // Optional: Custom build spec
        // buildSpec: "...",
        // Optional: Additional environment variables
        environmentVariables: {
          // Add any additional env vars here (e.g., GA_MEASUREMENT_ID)
        },
        // Optional: Custom domain for production
        // customDomain: {
        //   domainName: "studio.mostage.app",
        //   certificateArn: "arn:aws:acm:...",
        // },
      },
    };
  }
}
