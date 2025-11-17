import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { ApiGatewayConstruct } from "../index";
import * as path from "path";

export interface UnsplashLambdaProps {
  environment: "dev" | "prod";
  apiGateway: ApiGatewayConstruct;
  unsplashAccessKey: string; // SSM Parameter Store path or direct value
}

/**
 * Unsplash Lambda functions construct
 * Creates Lambda functions for Unsplash API integration
 */
export class UnsplashLambdaConstruct extends Construct {
  public readonly searchFunction: lambda.Function;
  public readonly downloadFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: UnsplashLambdaProps) {
    super(scope, id);

    const { environment, apiGateway, unsplashAccessKey } = props;

    // Lambda execution role
    const lambdaRole = new cdk.aws_iam.Role(this, "LambdaRole", {
      roleName: `mostage-studio-lambda-role-unsplash-${environment}`,
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Path to backend Lambda functions
    // Resolve path from infrastructure/lib/services/api/unsplash to backend/src/lambda/unsplash
    const backendPath = path.resolve(
      __dirname,
      "../../../../..",
      "backend",
      "src",
      "lambda",
      "unsplash"
    );

    // Lambda function for search
    this.searchFunction = new lambda.Function(this, "SearchFunction", {
      functionName: `mostage-studio-lambda-unsplash-search-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "search.handler",
      code: lambda.Code.fromAsset(backendPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            "bash",
            "-c",
            [
              "cd /asset-input",
              "npm install",
              "npx tsc search.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule",
              "npx tsc download.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule",
              "cp search.js /asset-output/",
              "cp download.js /asset-output/",
            ].join(" && "),
          ],
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: {
        UNSPLASH_ACCESS_KEY: unsplashAccessKey,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: "Unsplash image search Lambda function",
    });

    // Lambda function for download tracking
    this.downloadFunction = new lambda.Function(this, "DownloadFunction", {
      functionName: `mostage-studio-lambda-unsplash-download-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "download.handler",
      code: lambda.Code.fromAsset(backendPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            "bash",
            "-c",
            [
              "cd /asset-input",
              "npm install",
              "npx tsc search.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule",
              "npx tsc download.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule",
              "cp search.js /asset-output/",
              "cp download.js /asset-output/",
            ].join(" && "),
          ],
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: {
        UNSPLASH_ACCESS_KEY: unsplashAccessKey,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: "Unsplash download tracking Lambda function",
    });

    // API Gateway integration
    const unsplashResource = apiGateway.addResource("unsplash");
    const searchResource = unsplashResource.addResource("search");
    const downloadResource = unsplashResource.addResource("download");

    // Search endpoint: GET /unsplash/search
    searchResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(this.searchFunction, {
        proxy: true,
      })
    );

    // Download endpoint: POST /unsplash/download
    downloadResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(this.downloadFunction, {
        proxy: true,
      })
    );
  }
}
