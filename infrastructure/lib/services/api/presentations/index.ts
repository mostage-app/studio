import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { DynamoDBConstruct } from "../../dynamodb";
import * as path from "path";

export interface PresentationsLambdaProps {
  environment: "dev" | "prod";
  dynamoDB: DynamoDBConstruct;
  cognitoUserPoolId: string;
  cognitoRegion: string;
  usersResource: apigateway.IResource; // Reuse users resource from UsersLambdaConstruct
}

/**
 * Presentations Lambda functions construct
 * Creates Lambda functions for presentations CRUD operations
 */
export class PresentationsLambdaConstruct extends Construct {
  public readonly listFunction: lambda.Function;
  public readonly getFunction: lambda.Function;
  public readonly createFunction: lambda.Function;
  public readonly updateFunction: lambda.Function;
  public readonly deleteFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: PresentationsLambdaProps) {
    super(scope, id);

    const {
      environment,
      dynamoDB,
      cognitoUserPoolId,
      cognitoRegion,
      usersResource,
    } = props;

    // Lambda execution role with DynamoDB permissions
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      roleName: `mostage-studio-lambda-role-presentations-${environment}`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant DynamoDB permissions
    dynamoDB.presentationsTable.grantReadWriteData(lambdaRole);
    dynamoDB.usersTable.grantReadData(lambdaRole);

    // Path to backend root (for package.json and source files)
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

    // Common bundling command for all presentation lambdas
    const createBundlingCommand = (handlerFile: string) => [
      "bash",
      "-c",
      [
        "cd /asset-input",
        "npm install",
        "mkdir -p /asset-output/utils /asset-output/types",
        // Compile handler
        `npx tsc src/lambda/presentations/${handlerFile}.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src`,
        // Compile utils
        "npx tsc src/utils/dynamodb.ts src/utils/auth.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src",
        // Compile types
        "npx tsc src/types/presentation.ts src/types/user.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule --outDir /asset-output --rootDir src",
        // Copy package.json and install production deps
        "cp package.json /asset-output/",
        "cd /asset-output && npm install --production --no-audit --no-fund",
      ].join(" && "),
    ];

    // List Presentations Lambda
    this.listFunction = new lambda.Function(this, "ListFunction", {
      functionName: `mostage-studio-lambda-presentations-list-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda/presentations/list.handler",
      code: lambda.Code.fromAsset(backendRootPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: createBundlingCommand("list"),
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: "List presentations Lambda function",
    });

    // Get Presentation Lambda
    this.getFunction = new lambda.Function(this, "GetFunction", {
      functionName: `mostage-studio-lambda-presentations-get-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda/presentations/get.handler",
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
      description: "Get presentation Lambda function",
    });

    // Create Presentation Lambda
    this.createFunction = new lambda.Function(this, "CreateFunction", {
      functionName: `mostage-studio-lambda-presentations-create-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda/presentations/create.handler",
      code: lambda.Code.fromAsset(backendRootPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: createBundlingCommand("create"),
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: "Create presentation Lambda function",
    });

    // Update Presentation Lambda
    this.updateFunction = new lambda.Function(this, "UpdateFunction", {
      functionName: `mostage-studio-lambda-presentations-update-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda/presentations/update.handler",
      code: lambda.Code.fromAsset(backendRootPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: createBundlingCommand("update"),
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: "Update presentation Lambda function",
    });

    // Delete Presentation Lambda
    this.deleteFunction = new lambda.Function(this, "DeleteFunction", {
      functionName: `mostage-studio-lambda-presentations-delete-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda/presentations/delete.handler",
      code: lambda.Code.fromAsset(backendRootPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: createBundlingCommand("delete"),
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: "Delete presentation Lambda function",
    });

    // API Gateway integration (reuse users resource from UsersLambdaConstruct)
    const userResource =
      usersResource.getResource("{username}") ||
      usersResource.addResource("{username}");
    const presentationsResource = userResource.addResource("presentations");
    const presentationResource = presentationsResource.addResource("{slug}");

    // GET /users/{username}/presentations
    presentationsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(this.listFunction, {
        proxy: true,
      })
    );

    // GET /users/{username}/presentations/{slug}
    presentationResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(this.getFunction, {
        proxy: true,
      })
    );

    // POST /users/{username}/presentations
    presentationsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(this.createFunction, {
        proxy: true,
      })
    );

    // PUT /users/{username}/presentations/{slug}
    presentationResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(this.updateFunction, {
        proxy: true,
      })
    );

    // DELETE /users/{username}/presentations/{slug}
    presentationResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(this.deleteFunction, {
        proxy: true,
      })
    );
  }
}
