import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { ApiGatewayConstruct } from "../index";
import { DynamoDBConstruct } from "../../dynamodb";
import * as path from "path";

export interface UsersLambdaProps {
  environment: "dev" | "prod";
  apiGateway: ApiGatewayConstruct;
  dynamoDB: DynamoDBConstruct;
  cognitoUserPoolId: string;
  cognitoRegion: string;
}

/**
 * Users Lambda functions construct
 * Creates Lambda functions for user operations
 */
export class UsersLambdaConstruct extends Construct {
  public readonly getFunction: lambda.Function;
  public readonly usersResource: apigateway.IResource;

  constructor(scope: Construct, id: string, props: UsersLambdaProps) {
    super(scope, id);

    const {
      environment,
      apiGateway,
      dynamoDB,
      cognitoUserPoolId,
      cognitoRegion,
    } = props;

    // Lambda execution role with DynamoDB permissions
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      roleName: `mostage-studio-lambda-role-users-${environment}`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant DynamoDB permissions
    dynamoDB.usersTable.grantReadData(lambdaRole);
    dynamoDB.presentationsTable.grantReadWriteData(lambdaRole);

    // Path to backend root
    const backendRootPath = path.resolve(
      __dirname,
      "../../../../..",
      "backend"
    );

    // Environment variables for Lambda functions
    const lambdaEnvironment = {
      ENVIRONMENT: environment,
      PRESENTATIONS_TABLE_NAME: dynamoDB.presentationsTable.tableName,
      USERS_TABLE_NAME: dynamoDB.usersTable.tableName,
      COGNITO_USER_POOL_ID: cognitoUserPoolId,
      COGNITO_REGION: cognitoRegion,
    };

    // Common bundling command
    const createBundlingCommand = (handlerFile: string) => [
      "bash",
      "-c",
      [
        "cd /asset-input",
        "npm install",
        "mkdir -p /asset-output",
        // Compile handler
        `npx tsc src/lambda/users/${handlerFile}.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src`,
        // Compile utils
        "npx tsc src/utils/dynamodb.ts src/utils/auth.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src",
        // Compile types
        "npx tsc src/types/presentation.ts src/types/user.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src",
        // Copy package.json and install production deps
        "cp package.json /asset-output/",
        "cd /asset-output && npm install --production --no-audit --no-fund",
      ].join(" && "),
    ];

    // Get User Lambda
    this.getFunction = new lambda.Function(this, "GetFunction", {
      functionName: `mostage-studio-lambda-users-get-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda/users/get.handler",
      code: lambda.Code.fromAsset(backendRootPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: createBundlingCommand("get"),
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: "Get user info Lambda function",
    });

    // API Gateway integration for Get User
    // Create users resource (will be reused by PresentationsLambdaConstruct)
    this.usersResource = apiGateway.addResource("users");
    const userResource = this.usersResource.addResource("{username}");

    // GET /users/{username}
    userResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(this.getFunction, {
        proxy: true,
      })
    );
  }
}
