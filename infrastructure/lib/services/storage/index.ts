import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface StorageProps {
  environment: "dev" | "prod";
}

/**
 * S3 Storage construct
 * Creates S3 bucket for image uploads
 */
export class StorageConstruct extends Construct {
  public readonly imagesBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageProps) {
    super(scope, id);

    const { environment } = props;

    // S3 bucket for images
    this.imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: `mostage-studio-images-${environment}`,
      versioned: false,
      publicReadAccess: true, // Allow public read access for images
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy:
        environment === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== "prod",
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // Lifecycle rules can be added later if needed
    // For example, to delete old objects after a certain period
  }
}

