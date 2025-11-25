import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { DynamoDBConstruct } from "../dynamodb";
import * as path from "path";

export interface CognitoTriggerProps {
  environment: "dev" | "prod";
  dynamoDB: DynamoDBConstruct;
}

/**
 * Cognito Trigger Lambda construct
 * Creates Lambda functions for Cognito triggers (Post Confirmation)
 * Separated from API Lambda to avoid circular dependencies
 */
export class CognitoTriggerConstruct extends Construct {
  public readonly createDefaultPresentationFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: CognitoTriggerProps) {
    super(scope, id);

    const { environment, dynamoDB } = props;

    // Lambda execution role with DynamoDB permissions
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      roleName: `mostage-studio-lambda-role-cognito-trigger-${environment}`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant DynamoDB permissions
    dynamoDB.usersTable.grantReadWriteData(lambdaRole);
    dynamoDB.presentationsTable.grantReadWriteData(lambdaRole);

    // Path to backend root
    const backendRootPath = path.resolve(__dirname, "../../../..", "backend");

    // Environment variables for Lambda functions
    const lambdaEnvironment = {
      ENVIRONMENT: environment,
      PRESENTATIONS_TABLE_NAME: dynamoDB.presentationsTable.tableName,
      USERS_TABLE_NAME: dynamoDB.usersTable.tableName,
    };

    // Bundling command
    const bundlingCommand = [
      "bash",
      "-c",
      [
        "cd /asset-input",
        "npm install",
        "mkdir -p /asset-output",
        // Compile handler
        "npx tsc src/lambda/users/createDefaultPresentation.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src",
        // Compile utils
        "npx tsc src/utils/dynamodb.ts src/utils/auth.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src",
        // Compile types
        "npx tsc src/types/presentation.ts src/types/user.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src",
        // Copy package.json and install production deps
        "cp package.json /asset-output/",
        "cd /asset-output && npm install --production --no-audit --no-fund",
      ].join(" && "),
    ];

    // Create Default Presentation Lambda (Cognito Trigger)
    this.createDefaultPresentationFunction = new lambda.Function(
      this,
      "CreateDefaultPresentationFunction",
      {
        functionName: `mostage-studio-lambda-cognito-post-confirmation-${environment}`,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "lambda/users/createDefaultPresentation.handler",
        code: lambda.Code.fromAsset(backendRootPath, {
          bundling: {
            image: lambda.Runtime.NODEJS_20_X.bundlingImage,
            command: bundlingCommand,
            user: "root",
          },
        }),
        role: lambdaRole,
        environment: lambdaEnvironment,
        timeout: cdk.Duration.seconds(60),
        memorySize: 256,
        description:
          "Create default presentation for new users (Cognito Post Confirmation Trigger)",
      }
    );
  }
}
