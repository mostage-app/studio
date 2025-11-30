import * as cdk from "aws-cdk-lib";
import * as amplify from "aws-cdk-lib/aws-amplify";
import { Construct } from "constructs";

export interface AmplifyConstructProps {
  environment: "dev" | "prod";
  repository: string; // e.g., "https://github.com/mostage-app/studio"
  branch: string; // e.g., "main"
  githubTokenSecretArn?: string; // ARN of Secrets Manager secret containing GitHub token
  buildSpec?: string; // Custom build spec (optional)
  environmentVariables?: Record<string, string>; // Environment variables
  customDomain?: {
    domainName: string;
    certificateArn?: string;
  };
}

/**
 * AWS Amplify Hosting Construct
 * Manages frontend deployment via Amplify Hosting
 */
export class AmplifyConstruct extends Construct {
  public readonly app: amplify.CfnApp;
  public readonly branch: amplify.CfnBranch;
  public readonly appId: string;
  public readonly appUrl: string;

  constructor(scope: Construct, id: string, props: AmplifyConstructProps) {
    super(scope, id);

    const {
      environment,
      repository,
      branch,
      buildSpec,
      environmentVariables,
      customDomain,
    } = props;

    // Default build spec for Next.js
    const defaultBuildSpec =
      buildSpec ||
      `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
      - frontend/.next/cache/**/*`;

    // Prepare environment variables array
    const envVars: amplify.CfnApp.EnvironmentVariableProperty[] =
      Object.entries(environmentVariables || {}).map(([key, value]) => ({
        name: key,
        value: value,
      }));

    // Create Amplify App
    // Note: If oauthToken is not provided, repository will be undefined
    // You'll need to connect the repository manually via AWS Console after initial deployment:
    // Amplify → App → App settings → General → Repository → Connect repository
    // For security, it's recommended to set oauthToken via AWS Console after initial deployment
    const githubToken = process.env.GITHUB_TOKEN;

    // Build app props conditionally based on whether GitHub token is provided
    const appProps: amplify.CfnAppProps = {
      name: `mostage-studio-frontend-${environment}`,
      ...(githubToken
        ? {
            repository: repository,
            oauthToken: githubToken,
          }
        : {}),
      buildSpec: defaultBuildSpec,
      environmentVariables: envVars.length > 0 ? envVars : undefined,
      customRules: [
        {
          source: "/<*>",
          target: "/index.html",
          status: "404",
        },
      ],
      tags: [
        { key: "Application", value: "mostage-studio" },
        { key: "Project", value: "Mostage Studio" },
        { key: "Environment", value: environment },
        { key: "ManagedBy", value: "AWS CDK" },
      ],
    };

    this.app = new amplify.CfnApp(this, "AmplifyApp", appProps);

    // Create Branch
    // Note: Branch will be created, but if repository is not connected,
    // you'll need to connect it via AWS Console before builds can run
    this.branch = new amplify.CfnBranch(this, "AmplifyBranch", {
      appId: this.app.attrAppId,
      branchName: branch,
      enableAutoBuild: !!githubToken, // Only enable auto-build if repository is connected
      enablePullRequestPreview: environment === "dev" && !!githubToken, // Enable PR previews for dev if connected
      environmentVariables: envVars.length > 0 ? envVars : undefined,
    });

    // Custom Domain (optional)
    // Note: CfnDomainAssociation is not available in aws-cdk-lib/aws-amplify
    // Custom domains should be configured manually via AWS Console:
    // Amplify → App → App settings → Domain management → Add domain
    // Or use AWS CLI: aws amplify create-domain-association
    // See: https://docs.aws.amazon.com/cli/latest/reference/amplify/create-domain-association.html
    // TODO: If custom domain support is needed, implement via AWS SDK or manual configuration
    if (customDomain) {
      // Custom domain configuration is not implemented via CDK
      // Configure manually via AWS Console or CLI after app creation
    }

    this.appId = this.app.attrAppId;
    this.appUrl = `https://${this.branch.attrBranchName}.${this.app.attrAppId}.amplifyapp.com`;

    // Stack outputs
    new cdk.CfnOutput(this, "AmplifyAppId", {
      value: this.appId,
      description: "Amplify App ID",
      exportName: `mostage-studio-${environment}-amplify-app-id`,
    });

    new cdk.CfnOutput(this, "AmplifyAppUrl", {
      value: this.appUrl,
      description: "Amplify App URL",
      exportName: `mostage-studio-${environment}-amplify-app-url`,
    });

    new cdk.CfnOutput(this, "AmplifyBranchName", {
      value: this.branch.attrBranchName,
      description: "Amplify Branch Name",
      exportName: `mostage-studio-${environment}-amplify-branch-name`,
    });
  }
}
