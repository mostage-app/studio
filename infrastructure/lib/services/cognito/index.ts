import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { readCognitoEmailTemplate, COGNITO_EMAIL_TEMPLATES } from "./utils";

export interface CognitoConstructProps {
  environment: "dev" | "prod";
  userPoolName: string;
  userPoolClientName: string;
  sesFromEmail?: string;
  sesReplyToEmail?: string;
  sesConfigurationSet?: string;
  postConfirmationLambda?: lambda.Function;
}

export class CognitoConstruct extends Construct {
  public readonly userPool: cognito.CfnUserPool;
  public readonly userPoolClient: cognito.CfnUserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    const {
      userPoolName,
      userPoolClientName,
      sesFromEmail,
      sesReplyToEmail,
      sesConfigurationSet,
      postConfirmationLambda,
    } = props;

    // Read email templates
    const verificationTemplate = readCognitoEmailTemplate(
      COGNITO_EMAIL_TEMPLATES.VERIFICATION
    );
    // Password reset template is available but requires Lambda trigger for custom template
    // For now, we use the default Cognito password reset flow
    // To use custom template, add a Lambda trigger for CustomMessage_ForgotPassword

    // Email configuration
    const emailConfiguration: cognito.CfnUserPool.EmailConfigurationProperty =
      sesFromEmail
        ? {
            emailSendingAccount: "DEVELOPER",
            from: sesFromEmail,
            replyToEmailAddress: sesReplyToEmail,
            configurationSet: sesConfigurationSet,
            sourceArn: undefined,
          }
        : {
            emailSendingAccount: "COGNITO_DEFAULT",
          };

    // User Pool using L1 Construct for full control over email templates
    this.userPool = new cognito.CfnUserPool(this, "UserPool", {
      userPoolName,
      aliasAttributes: ["email", "preferred_username"],
      autoVerifiedAttributes: ["email"],
      adminCreateUserConfig: {
        allowAdminCreateUserOnly: false,
      },
      verificationMessageTemplate: {
        defaultEmailOption: "CONFIRM_WITH_CODE",
        emailSubject: "Mostage Studio - Verify account",
        emailMessage: verificationTemplate,
      },
      userAttributeUpdateSettings: {
        attributesRequireVerificationBeforeUpdate: ["email"],
      },
      policies: {
        passwordPolicy: {
          minimumLength: 6,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false,
          temporaryPasswordValidityDays: 7,
        },
      },
      accountRecoverySetting: {
        recoveryMechanisms: [
          {
            name: "verified_email",
            priority: 1,
          },
        ],
      },
      emailConfiguration,
      schema: [
        {
          name: "email",
          attributeDataType: "String",
          required: true,
          mutable: true,
        },
        {
          name: "given_name",
          attributeDataType: "String",
          required: false,
          mutable: true,
        },
        {
          name: "family_name",
          attributeDataType: "String",
          required: false,
          mutable: true,
        },
      ],
      deletionProtection: "ACTIVE",
      lambdaConfig: postConfirmationLambda
        ? {
            postConfirmation: postConfirmationLambda.functionArn,
          }
        : undefined,
    });

    // Grant Cognito permission to invoke Lambda (if provided)
    if (postConfirmationLambda) {
      postConfirmationLambda.addPermission("CognitoPostConfirmation", {
        principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
        sourceArn: this.userPool.attrArn,
      });
    }

    // User Pool Client
    this.userPoolClient = new cognito.CfnUserPoolClient(
      this,
      "UserPoolClient",
      {
        userPoolId: this.userPool.ref,
        clientName: userPoolClientName,
        generateSecret: false, // Required for public clients (web apps)
        explicitAuthFlows: [
          "ALLOW_USER_PASSWORD_AUTH",
          "ALLOW_USER_SRP_AUTH",
          "ALLOW_REFRESH_TOKEN_AUTH",
        ],
        preventUserExistenceErrors: "LEGACY",
        tokenValidityUnits: {
          accessToken: "minutes",
          idToken: "minutes",
          refreshToken: "days",
        },
        accessTokenValidity: 60, // 1 hour
        idTokenValidity: 60, // 1 hour
        refreshTokenValidity: 30, // 30 days
      }
    );

    // Note: Password reset email template
    // - For code-based password reset: Uses verificationMessageTemplate (same as email verification)
    // - For link-based password reset: Requires Lambda trigger (CustomMessage_ForgotPassword)
    // - Password reset template is available in templates/password-reset.html
    // - To use custom password reset template, add a Lambda trigger for CustomMessage_ForgotPassword
  }

  /**
   * Set Post Confirmation Lambda trigger after User Pool creation
   * This is needed when Lambda depends on Cognito and vice versa (circular dependency)
   */
  public setPostConfirmationLambda(lambdaFunction: lambda.Function): void {
    // Update User Pool with Lambda trigger
    this.userPool.lambdaConfig = {
      postConfirmation: lambdaFunction.functionArn,
    };

    // Grant Cognito permission to invoke Lambda
    lambdaFunction.addPermission("CognitoPostConfirmation", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: this.userPool.attrArn,
    });
  }
}
