import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CognitoConstruct } from "../services/cognito";
import { SesConstruct } from "../services/ses";
import { ApiGatewayConstruct } from "../services/api";
import { UnsplashLambdaConstruct } from "../services/api/unsplash";
import { PresentationsLambdaConstruct } from "../services/api/presentations";
import { UsersLambdaConstruct } from "../services/api/users";
import { CognitoTriggerConstruct } from "../services/cognito-trigger";
import { ResourceGroupConstruct } from "../services/resource-group";
import { DynamoDBConstruct } from "../services/dynamodb";

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
  apiConfig?: {
    unsplashAccessKey?: string; // Unsplash API Access Key
    allowedOrigins?: string[]; // CORS allowed origins (e.g., ["https://studio.mostage.app"])
    rateLimit?: {
      requestsPerSecond?: number;
      burstLimit?: number;
    };
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
  public readonly apiUrl: string;
  public readonly resourceGroupName: string;
  public readonly presentationsTableName: string;
  public readonly usersTableName: string;

  /**
   * Abstract method that must be implemented by subclasses
   * Returns environment-specific configuration
   */
  protected abstract getConfig(): StackConfig;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const config = this.getConfig();
    const {
      environment,
      userPoolName,
      userPoolClientName,
      sesConfig,
      apiConfig,
    } = config;

    // Default tags for all resources
    // Application tag is used for Resource Group organization
    cdk.Tags.of(this).add("Application", "mostage-studio");
    cdk.Tags.of(this).add("Project", "Mostage Studio");
    cdk.Tags.of(this).add("ManagedBy", "AWS CDK");
    cdk.Tags.of(this).add("Environment", environment);

    // Resource Group - organizes all resources for easy management
    const resourceGroup = new ResourceGroupConstruct(this, "ResourceGroup", {
      environment,
      applicationName: "mostage-studio",
    });
    this.resourceGroupName = resourceGroup.resourceGroup.name || "";

    // DynamoDB Construct
    const dynamoDBConstruct = new DynamoDBConstruct(this, "DynamoDB", {
      environment,
    });
    this.presentationsTableName =
      dynamoDBConstruct.presentationsTable.tableName;
    this.usersTableName = dynamoDBConstruct.usersTable.tableName;

    // SES Construct (optional)
    const sesConstruct = new SesConstruct(this, "Ses", {
      environment,
      createResources: sesConfig?.createResources ?? false,
      fromEmail: sesConfig?.fromEmail ?? "",
      replyToEmail: sesConfig?.replyToEmail ?? "",
      configurationSetName: sesConfig?.configurationSetName ?? "",
    });

    // API Gateway Construct
    // For production: restrict CORS to specific domains
    // For dev: allow all origins for local development
    const allowedOrigins =
      apiConfig?.allowedOrigins ||
      (environment === "prod"
        ? [] // Production must specify allowed origins
        : ["*"]); // Dev allows all for local development

    const apiGateway = new ApiGatewayConstruct(this, "ApiGateway", {
      environment,
      description: "API Gateway for Mostage Studio backend services",
      corsOptions: {
        allowOrigins: allowedOrigins,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
      },
      rateLimit: apiConfig?.rateLimit,
    });

    // Cognito Trigger Lambda (create first, no API Gateway dependency)
    const cognitoTrigger = new CognitoTriggerConstruct(this, "CognitoTrigger", {
      environment,
      dynamoDB: dynamoDBConstruct,
    });

    // Cognito Construct (with Post Confirmation Lambda)
    const cognitoConstruct = new CognitoConstruct(this, "Cognito", {
      environment,
      userPoolName,
      userPoolClientName,
      sesFromEmail: sesConstruct.fromEmail,
      sesReplyToEmail: sesConstruct.replyToEmail,
      sesConfigurationSet: sesConstruct.configurationSetName,
      postConfirmationLambda: cognitoTrigger.createDefaultPresentationFunction,
    });

    const cognitoRegion = props.env?.region || "eu-central-1";

    // Users Lambda Construct (needs Cognito User Pool ID for auth)
    const usersLambdaConstruct = new UsersLambdaConstruct(this, "UsersLambda", {
      environment,
      apiGateway,
      dynamoDB: dynamoDBConstruct,
      cognitoUserPoolId: cognitoConstruct.userPool.ref,
      cognitoRegion,
    });

    // Presentations Lambda Construct (needs Cognito User Pool ID)
    new PresentationsLambdaConstruct(this, "PresentationsLambda", {
      environment,
      dynamoDB: dynamoDBConstruct,
      cognitoUserPoolId: cognitoConstruct.userPool.ref,
      cognitoRegion,
      usersResource: usersLambdaConstruct.usersResource,
    });

    // Unsplash Lambda Construct (if API key is provided)
    if (apiConfig?.unsplashAccessKey) {
      new UnsplashLambdaConstruct(this, "UnsplashLambda", {
        environment,
        apiGateway,
        unsplashAccessKey: apiConfig.unsplashAccessKey,
      });
    }

    // Stack outputs
    this.cognitoUserPoolId = cognitoConstruct.userPool.ref;
    this.cognitoUserPoolArn = cognitoConstruct.userPool.attrArn;
    this.cognitoClientId = cognitoConstruct.userPoolClient.ref;
    this.cognitoRegion = props.env?.region || "eu-central-1";
    this.apiUrl = apiGateway.apiUrl;

    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.cognitoUserPoolId,
      description: "Cognito User Pool ID",
      exportName: `mostage-studio-${environment}-cognito-user-pool-id`,
    });

    new cdk.CfnOutput(this, "UserPoolArn", {
      value: this.cognitoUserPoolArn,
      description: "Cognito User Pool ARN",
      exportName: `mostage-studio-${environment}-cognito-user-pool-arn`,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.cognitoClientId,
      description: "Cognito User Pool Client ID",
      exportName: `mostage-studio-${environment}-cognito-client-id`,
    });

    new cdk.CfnOutput(this, "UserPoolRegion", {
      value: this.cognitoRegion,
      description: "AWS Region for Cognito User Pool",
      exportName: `mostage-studio-${environment}-cognito-region`,
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: this.apiUrl,
      description: "API Gateway URL",
      exportName: `mostage-studio-${environment}-api-url`,
    });

    new cdk.CfnOutput(this, "ResourceGroupName", {
      value: this.resourceGroupName,
      description: "Resource Group name for organizing all resources",
      exportName: `mostage-studio-${environment}-resource-group-name`,
    });

    new cdk.CfnOutput(this, "PresentationsTableName", {
      value: this.presentationsTableName,
      description: "DynamoDB Presentations Table Name",
      exportName: `mostage-studio-${environment}-presentations-table-name`,
    });

    new cdk.CfnOutput(this, "UsersTableName", {
      value: this.usersTableName,
      description: "DynamoDB Users Table Name",
      exportName: `mostage-studio-${environment}-users-table-name`,
    });
  }
}
