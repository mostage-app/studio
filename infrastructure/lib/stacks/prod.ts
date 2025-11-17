import { BaseStudioStack, StackConfig } from "./base";

/**
 * Production environment stack
 */
export class StudioStackProd extends BaseStudioStack {
  protected getConfig(): StackConfig {
    return {
      environment: "prod",
      userPoolName: "mostage-studio-users-prod",
      userPoolClientName: "mostage-studio-web-client-prod",
      sesConfig: {
        createResources: false, // Set to true if you want to create SES resources
        fromEmail: "", // Set to your verified email address
        replyToEmail: "",
        configurationSetName: "",
      },
    };
  }
}
