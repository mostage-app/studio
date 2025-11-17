# Authentication Setup Guide

This guide explains how to set up the authentication system using AWS Cognito.

> **Note**: For infrastructure setup, see [Infrastructure Setup](infrastructure.md).

## Prerequisites

1. **Node.js** (>= 18.x)
2. **AWS CDK CLI** - Install via npm: `npm install -g aws-cdk`
3. **AWS CLI**
4. **AWS Account** with appropriate permissions

## Infrastructure Setup

For detailed infrastructure setup instructions, see [Infrastructure Setup](infrastructure.md).

### Quick Setup

1. **Install dependencies**:

   ```bash
   cd infrastructure
   npm install
   ```

2. **Configure AWS**:

   ```bash
   aws configure
   ```

   Enter the following information:

   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `eu-central-1`)
   - Default output format: `json`

3. **Bootstrap CDK** (First time only):

   ```bash
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

   Replace `ACCOUNT-ID` with your AWS account ID and `REGION` with your region (e.g., `eu-central-1`).

4. **Deploy Infrastructure**:

   **Development**:

   ```bash
   npm run build
   npm run diff:dev
   npm run deploy:dev
   ```

   **Production**:

   ```bash
   npm run build
   npm run diff:prod
   npm run deploy:prod
   ```

   After successful deployment, get the outputs:

   ```bash
   aws cloudformation describe-stacks \
     --stack-name StudioStack-dev \
     --query 'Stacks[0].Outputs' \
     --output table
   ```

   The following outputs will be displayed:

   - `UserPoolId`: User Pool identifier
   - `UserPoolClientId`: Client identifier
   - `UserPoolRegion`: AWS region

   **Important**: Development and production have separate User Pools:

   - Development: `mostage-studio-users-dev`
   - Production: `mostage-studio-users-prod`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

After deploying the infrastructure, you need to configure the frontend with the stack outputs.

#### For Local Development

1. **Get stack outputs** (if you haven't already):

   ```bash
   aws cloudformation describe-stacks \
     --stack-name StudioStack-dev \
     --query 'Stacks[0].Outputs' \
     --output table
   ```

2. **Create `.env.local` file** in the `frontend/` directory:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-central-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=eu-central-1
NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/dev
```

3. **Copy values from stack outputs**:

   Copy the following values:

   - `UserPoolId` → `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
   - `UserPoolClientId` → `NEXT_PUBLIC_COGNITO_CLIENT_ID`
   - `UserPoolRegion` → `NEXT_PUBLIC_AWS_REGION`
   - `ApiUrl` → `NEXT_PUBLIC_API_URL`

**Example:**

If the stack outputs show:

```text
UserPoolId: eu-central-1_AbCdEf123
UserPoolClientId: 1a2b3c4d5e6f7g8h9i0j
UserPoolRegion: eu-central-1
```

Then your `.env.local` should be:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-central-1_AbCdEf123
NEXT_PUBLIC_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
NEXT_PUBLIC_AWS_REGION=eu-central-1
NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/dev
```

#### For Production

Go to your GitHub repository → **Settings → Secrets and variables → Actions** and add:

- `NEXT_PUBLIC_COGNITO_USER_POOL_ID` → Value from `UserPoolId` output
- `NEXT_PUBLIC_COGNITO_CLIENT_ID` → Value from `UserPoolClientId` output
- `NEXT_PUBLIC_AWS_REGION` → Value from `UserPoolRegion` output

**Note**: For first-time setup, see [Infrastructure Setup - First Time Deployment](infrastructure.md#first-time-deployment).

**Note**: GitHub Pages Environment Variables (in Pages settings) don't work for Next.js static export because Next.js needs variables at build time, not runtime. Use GitHub Secrets instead.

### 3. Run the Application

```bash
npm run dev
```

## Authentication Features

### Sign Up

- Username input (minimum 3 characters, maximum 20 characters)
- Email input
- Password input (minimum 6 characters with uppercase, lowercase, and number)
- Full name

### Email Verification

- Receive 6-digit verification code via email
- Resend code option

### Sign In

- Sign in with username or email
- Sign in with password

### Sign Out

- Sign out from account and clear tokens

### Password Reset

- Request password reset code via email
- Reset password with verification code

### Authentication Module

```text
frontend/src/features/auth/
├── components/
│   ├── AuthModal.tsx          # Main authentication modal
│   ├── AccountModal.tsx      # User account management modal
│   └── AuthProvider.tsx      # Authentication context provider
├── hooks/
│   └── useAuth.ts             # Authentication management hook
├── services/
│   ├── authService.ts         # Token management
│   └── cognitoService.ts     # AWS Cognito integration
└── types/
    └── auth.types.ts          # TypeScript types
```

## Security

- All communications with AWS Cognito are performed over HTTPS
- Tokens are stored in localStorage (access token, ID token, refresh token)
- Password policy is enforced by Cognito (minimum 6 characters, uppercase, lowercase, number)
- Email verification is required before sign in
- Cookie consent is required for authentication

## Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
