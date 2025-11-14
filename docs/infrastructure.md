# Infrastructure

This document describes the AWS CDK infrastructure code for Mostage Studio.

The infrastructure code is located in the `infrastructure/` directory.

## Prerequisites

1. **Node.js**
2. **AWS CLI**
3. **AWS CDK CLI** (`npm install -g aws-cdk`)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure AWS credentials:

   ```bash
   aws configure
   ```

3. Bootstrap CDK (first time only):

   ```bash
   cdk bootstrap
   ```

4. Set environment variables (optional, can use AWS CLI defaults):

   ```bash
   export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
   export CDK_DEFAULT_REGION=eu-central-1
   export USER_POOL_NAME=mostage-studio-users  # Optional: Custom User Pool name
   export USER_POOL_CLIENT_NAME=mostage-studio-web-client  # Optional: Custom Client name
   ```

## Deployment

### Local Deployment

1. **Synthesize CloudFormation template** (preview changes):

   ```bash
   npm run cdk:synth
   ```

2. **Deploy the stack**:

   ```bash
   npm run cdk:deploy
   ```

   **Optional**: Set custom User Pool names:

   ```bash
   export USER_POOL_NAME=mostage-studio-users-prod
   export USER_POOL_CLIENT_NAME=mostage-studio-web-client-prod
   npm run cdk:deploy
   ```

### GitHub Actions Deployment

When deploying via GitHub Actions, you can customize the User Pool names in the workflow inputs:

1. Go to **Actions → Deploy Infrastructure**
2. Click **Run workflow**
3. Set custom values:
   - `user_pool_name`: e.g., `mostage-studio-users-prod`
   - `user_pool_client_name`: e.g., `mostage-studio-web-client-prod`
4. Click **Run workflow**

## Getting Stack Outputs

After deployment, get the stack outputs (User Pool ID and Client ID):

```bash
aws cloudformation describe-stacks \
  --stack-name MostageStudioAuthStack \
  --query 'Stacks[0].Outputs' \
  --output table
```

**Update frontend environment variables** with the output values:

- `UserPoolId` → `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `UserPoolClientId` → `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `UserPoolRegion` → `NEXT_PUBLIC_AWS_REGION`

## Available Commands

- `npm run build` - Compile TypeScript
- `npm run cdk:synth` - Synthesize CloudFormation template
- `npm run cdk:deploy` - Deploy stack to AWS
- `npm run cdk:diff` - Compare deployed stack with current state
- `npm run cdk:destroy` - Destroy the stack (⚠️ removes all resources)

## Stack Resources

- **Cognito User Pool**: Manages user authentication
- **Cognito User Pool Client**: Web application client for frontend

## Architecture

```text
┌─────────────────┐
│   Frontend      │
│  (Next.js App)  │
└────────┬────────┘
         │
         │ AWS SDK
         │
┌────────▼────────┐
│  Cognito User   │
│     Pool        │
└─────────────────┘
```

The frontend communicates directly with AWS Cognito using the AWS SDK. No additional API server is required for authentication operations.

## IAM Policy for GitHub Actions

If you're deploying infrastructure via GitHub Actions, the IAM user needs specific permissions. The following policy is a **least-privilege** policy that provides only the necessary permissions for CDK deployment:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationForCDK",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ValidateTemplate",
        "cloudformation:ListStacks",
        "cloudformation:ListStackResources"
      ],
      "Resource": [
        "arn:aws:cloudformation:*:*:stack/MostageStudioAuthStack/*",
        "arn:aws:cloudformation:*:*:stack/CDKToolkit/*"
      ]
    },
    {
      "Sid": "CognitoUserPoolManagement",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool",
        "cognito-idp:UpdateUserPool",
        "cognito-idp:DeleteUserPool",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:ListUserPools",
        "cognito-idp:CreateUserPoolClient",
        "cognito-idp:UpdateUserPoolClient",
        "cognito-idp:DeleteUserPoolClient",
        "cognito-idp:DescribeUserPoolClient",
        "cognito-idp:ListUserPoolClients",
        "cognito-idp:TagResource",
        "cognito-idp:UntagResource",
        "cognito-idp:ListTagsForResource"
      ],
      "Resource": ["arn:aws:cognito-idp:*:*:userpool/*"]
    },
    {
      "Sid": "IAMForCDKBootstrap",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListPolicyVersions",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:ListRoleTags",
        "iam:TagPolicy",
        "iam:UntagPolicy",
        "iam:ListPolicyTags",
        "iam:CreateServiceLinkedRole",
        "iam:UpdateRole",
        "iam:UpdateRoleDescription"
      ],
      "Resource": [
        "arn:aws:iam::*:role/cdk-*",
        "arn:aws:iam::*:role/*CDK*",
        "arn:aws:iam::*:policy/cdk-*",
        "arn:aws:iam::*:policy/*CDK*"
      ]
    },
    {
      "Sid": "IAMPassRoleForCDK",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": ["arn:aws:iam::*:role/cdk-*", "arn:aws:iam::*:role/*CDK*"],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": [
            "cloudformation.amazonaws.com",
            "cognito-idp.amazonaws.com"
          ]
        }
      }
    },
    {
      "Sid": "S3ForCDKAssets",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock"
      ],
      "Resource": ["arn:aws:s3:::cdk-*", "arn:aws:s3:::cdk-*/*"]
    },
    {
      "Sid": "SSMForCDKBootstrap",
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:PutParameter"],
      "Resource": ["arn:aws:ssm:*:*:parameter/cdk-bootstrap/*"]
    },
    {
      "Sid": "STSGetCallerIdentity",
      "Effect": "Allow",
      "Action": ["sts:GetCallerIdentity"],
      "Resource": "*"
    }
  ]
}
```

### Key Differences from Full Access Policy

This policy is more secure than a full-access policy because it:

- **Restricts CloudFormation** to specific stacks (`MostageStudioAuthStack` and `CDKToolkit`)
- **Restricts Cognito** to User Pool operations only
- **Restricts IAM** to CDK-related roles and policies
- **Includes SSM permissions** for CDK bootstrap version checking (required to fix the deployment error)

### Steps to Apply IAM Policy

1. Go to **IAM → Users** in AWS Console
2. Select your GitHub Actions user (e.g., `mostage-studio-github-actions`)
3. Go to **Permissions** tab
4. Click **Add permissions → Create inline policy**
5. Select **JSON** tab
6. Paste the policy above
7. Review and name the policy (e.g., `CDKDeploymentPolicy`)
8. Click **Create policy**

**Note**: Replace `*` in resource ARNs with your actual AWS account ID if you want to restrict access further.
