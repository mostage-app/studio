import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { ApiGatewayConstruct } from "../index";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface ImagesLambdaProps {
  environment: "dev" | "prod";
  apiGateway: ApiGatewayConstruct;
  imagesBucket: s3.Bucket;
}

/**
 * Images Lambda functions construct
 * Creates Lambda function for image upload to S3
 */
export class ImagesLambdaConstruct extends Construct {
  public readonly uploadFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ImagesLambdaProps) {
    super(scope, id);

    const { environment, apiGateway, imagesBucket } = props;

    // Lambda execution role with S3 permissions
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      roleName: `mostage-studio-lambda-role-images-${environment}`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant S3 put permissions to Lambda
    imagesBucket.grantPut(lambdaRole);

    // Path to backend Lambda functions
    const backendPath = path.resolve(
      __dirname,
      "../../../../..",
      "backend",
      "src",
      "lambda",
      "images"
    );

    // Lambda function for upload
    this.uploadFunction = new lambda.Function(this, "UploadFunction", {
      functionName: `mostage-studio-lambda-images-upload-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "upload.handler",
      code: lambda.Code.fromAsset(backendPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            "bash",
            "-c",
            [
              "cd /asset-input",
              "npm install",
              "npx tsc upload.ts --target ES2020 --module commonjs --esModuleInterop --skipLibCheck --resolveJsonModule",
              "cp upload.js /asset-output/",
              "cp package.json /asset-output/",
              "cp -r node_modules /asset-output/ 2>/dev/null || true",
            ].join(" && "),
          ],
          user: "root",
        },
      }),
      role: lambdaRole,
      environment: {
        S3_BUCKET_NAME: imagesBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512, // More memory for image processing
      description: "Image upload Lambda function",
    });

    // API Gateway integration
    const imagesResource = apiGateway.addResource("images");
    const uploadResource = imagesResource.addResource("upload");

    // Upload endpoint: POST /images/upload
    uploadResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(this.uploadFunction, {
        proxy: true,
      })
    );
  }
}

