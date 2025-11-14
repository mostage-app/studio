import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export interface AuthStackProps extends cdk.StackProps {
  userPoolName?: string;
  userPoolClientName?: string;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: AuthStackProps) {
    super(scope, id, props);

    const userPoolName = props?.userPoolName || "mostage-studio-users";
    const userPoolClientName =
      props?.userPoolClientName || "mostage-studio-web-client";

    // Create Cognito User Pool with username support
    this.userPool = new cognito.UserPool(this, "MostageStudioUserPool", {
      userPoolName: userPoolName,
      signInAliases: {
        email: true,
        username: true,
      },
      selfSignUpEnabled: true, // Enable self-registration
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create User Pool Client (for frontend)
    this.userPoolClient = new cognito.UserPoolClient(
      this,
      "MostageStudioUserPoolClient",
      {
        userPool: this.userPool,
        userPoolClientName: userPoolClientName,
        generateSecret: false, // Required for public clients (web apps)
        authFlows: {
          userPassword: true,
          userSrp: true,
          adminUserPassword: false,
          custom: false,
        },
        preventUserExistenceErrors: true,
      }
    );

    // Output User Pool ID and Client ID
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "Cognito User Pool ID",
      exportName: "MostageStudioUserPoolId",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      description: "Cognito User Pool Client ID",
      exportName: "MostageStudioUserPoolClientId",
    });

    new cdk.CfnOutput(this, "UserPoolRegion", {
      value: this.region,
      description: "AWS Region for Cognito User Pool",
      exportName: "MostageStudioUserPoolRegion",
    });
  }
}
