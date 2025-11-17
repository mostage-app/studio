import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CognitoConstruct } from "../services/cognito";
import { SesConstruct } from "../services/ses";

/**
 * Configuration interface for Stack
 */
export interface StackConfig {
  environment: "dev" | "prod";
  userPoolName: string;
  userPoolClientName: string;
  sesConfig?: {
    createResources: boolean;
    fromEmail?: string;
    replyToEmail?: string;
    configurationSetName?: string;
  };
}

/**
 * Base Stack class that contains common infrastructure logic
 * Subclasses must implement getConfig() to provide environment-specific configuration
 */
export abstract class BaseStudioStack extends cdk.Stack {
  public readonly cognitoUserPoolId: string;
  public readonly cognitoUserPoolArn: string;
  public readonly cognitoClientId: string;
  public readonly cognitoRegion: string;

  /**
   * Abstract method that must be implemented by subclasses
   * Returns environment-specific configuration
   */
  protected abstract getConfig(): StackConfig;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const config = this.getConfig();
    const { environment, userPoolName, userPoolClientName, sesConfig } = config;

    // Default tags
    cdk.Tags.of(this).add("Project", "Mostage Studio");
    cdk.Tags.of(this).add("ManagedBy", "AWS CDK");
    cdk.Tags.of(this).add("Environment", environment);

    // SES Construct (optional)
    const sesConstruct = new SesConstruct(this, "Ses", {
      environment,
      createResources: sesConfig?.createResources ?? false,
      fromEmail: sesConfig?.fromEmail ?? "",
      replyToEmail: sesConfig?.replyToEmail ?? "",
      configurationSetName: sesConfig?.configurationSetName ?? "",
    });

    // Cognito Construct
    const cognitoConstruct = new CognitoConstruct(this, "Cognito", {
      environment,
      userPoolName,
      userPoolClientName,
      sesFromEmail: sesConstruct.fromEmail,
      sesReplyToEmail: sesConstruct.replyToEmail,
      sesConfigurationSet: sesConstruct.configurationSetName,
    });

    // Stack outputs
    this.cognitoUserPoolId = cognitoConstruct.userPool.ref;
    this.cognitoUserPoolArn = cognitoConstruct.userPool.attrArn;
    this.cognitoClientId = cognitoConstruct.userPoolClient.ref;
    this.cognitoRegion = props.env?.region || "eu-central-1";

    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.cognitoUserPoolId,
      description: "Cognito User Pool ID",
      exportName: `${environment}-user-pool-id`,
    });

    new cdk.CfnOutput(this, "UserPoolArn", {
      value: this.cognitoUserPoolArn,
      description: "Cognito User Pool ARN",
      exportName: `${environment}-user-pool-arn`,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.cognitoClientId,
      description: "Cognito User Pool Client ID",
      exportName: `${environment}-user-pool-client-id`,
    });

    new cdk.CfnOutput(this, "UserPoolRegion", {
      value: this.cognitoRegion,
      description: "AWS Region for Cognito User Pool",
      exportName: `${environment}-user-pool-region`,
    });
  }
}
