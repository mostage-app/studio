# Authentication Setup Guide

This guide explains how to set up the authentication system using AWS Cognito.

> **Note**: For infrastructure setup, see [Infrastructure Setup](infrastructure.md).

## Prerequisites

1. **Terraform** (>= 1.5.0)
2. **AWS CLI**
3. **AWS Account** with appropriate permissions

## Infrastructure Setup

For detailed infrastructure setup instructions, see [Infrastructure Setup](infrastructure.md).

### Quick Setup

1. Install Terraform:
2. Configure AWS:

```bash
aws configure
```

Enter the following information:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `eu-central-1`)
- Default output format: `json`

3. Initialize Terraform:

```bash
cd infrastructure
terraform init
```

4. Deploy Infrastructure:

```bash
terraform plan
terraform apply
```

After successful deployment, get the outputs:

```bash
terraform output
```

The following outputs will be displayed:

- `user_pool_id`: User Pool identifier
- `user_pool_client_id`: Client identifier
- `user_pool_region`: AWS region

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` folder:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_AWS_REGION=eu-central-1
```

Copy the values from the CDK outputs.

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

```
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
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
