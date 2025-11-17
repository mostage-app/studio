import { BaseStudioStack, StackConfig } from "./base";

/**
 * Development environment stack
 */
export class StudioStackDev extends BaseStudioStack {
  protected getConfig(): StackConfig {
    return {
      environment: "dev",
      userPoolName: "mostage-studio-users-dev",
      userPoolClientName: "mostage-studio-web-client-dev",
      sesConfig: {
        createResources: false, // Set to true if you want to create SES resources
        fromEmail: "", // Set to your verified email address
        replyToEmail: "",
        configurationSetName: "",
      },
    };
  }
}
