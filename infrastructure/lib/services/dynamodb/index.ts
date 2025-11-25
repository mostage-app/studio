import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface DynamoDBProps {
  environment: "dev" | "prod";
}

/**
 * DynamoDB service construct
 * Creates tables for presentations and users
 */
export class DynamoDBConstruct extends Construct {
  public readonly presentationsTable: dynamodb.Table;
  public readonly usersTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDBProps) {
    super(scope, id);

    const { environment } = props;

    // Presentations Table
    this.presentationsTable = new dynamodb.Table(this, "PresentationsTable", {
      tableName: `mostage-studio-presentations-${environment}`,
      partitionKey: {
        name: "presentationId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        environment === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: environment === "prod",
      },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // GSI: username-index (for listing presentations by username)
    this.presentationsTable.addGlobalSecondaryIndex({
      indexName: "username-index",
      partitionKey: {
        name: "username",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // GSI: username-slug-index (for getting presentation by username and slug)
    this.presentationsTable.addGlobalSecondaryIndex({
      indexName: "username-slug-index",
      partitionKey: {
        name: "username",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "slug",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Users Table
    this.usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: `mostage-studio-users-${environment}`,
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        environment === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: environment === "prod",
      },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // GSI: username-index (for getting user by username, unique)
    this.usersTable.addGlobalSecondaryIndex({
      indexName: "username-index",
      partitionKey: {
        name: "username",
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
