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
   ```

## Deployment

1. **Synthesize CloudFormation template** (preview changes):

   ```bash
   npm run cdk:synth
   ```

2. **Deploy the stack**:

   ```bash
   npm run cdk:deploy
   ```

3. **Get stack outputs** (User Pool ID and Client ID):

   ```bash
   aws cloudformation describe-stacks \
     --stack-name MostageStudioAuthStack \
     --query 'Stacks[0].Outputs' \
     --output table
   ```

4. **Update frontend environment variables** with the output values:
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

```
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
