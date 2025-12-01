# AWS Amplify Setup Guide

This guide explains how to set up AWS Amplify Hosting for the frontend application through the AWS Console.

## Prerequisites

- AWS Account with appropriate permissions
- GitHub repository: `https://github.com/mostage-app/studio`
- Two branches: `dev` and `main`
- `amplify.yml` file in the repository root (already exists)

## Step 1: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Select **"GitHub"** as the source
4. Click **"Authorize"** to connect your GitHub account
5. Select the repository: `mostage-app/studio`
6. Select branch: `dev` (we'll add `main` later)
7. Click **"Next"**

## Step 2: Configure Build Settings

1. **App name**: `mostage-studio-frontend`
2. **Build settings**: Amplify will automatically detect `amplify.yml` in the repository root
3. Verify the build spec matches:
   ```yaml
   version: 1
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
         - "**/*"
     cache:
       paths:
         - frontend/node_modules/**/*
         - frontend/.next/cache/**/*
   ```
4. Click **"Next"**

## Step 3: Configure Environment Variables for Dev Branch

> **Important:** In AWS Amplify, you can set environment variables for:
>
> - **All branches** (applies to all branches)
> - **Specific branch** (applies only to that branch)
>
> For this setup, we need **different values for dev and main branches**, so we'll set them **per branch** (not for all branches).

### Setting Environment Variables Per Branch

1. After creating the app and selecting the `dev` branch, you'll see the **"Environment variables"** section
2. **Make sure you're setting variables for the `dev` branch specifically**, not for "All branches"
3. If you see a dropdown, select **"dev"** branch (not "All branches")

Add the following environment variables **for the `dev` branch only**:

> **Note:** These variables use `NEXT_PUBLIC_` prefix, which means they are embedded in the client-side JavaScript bundle and are publicly accessible. This is intentional and safe because:
>
> - **Cognito User Pool ID and Client ID** are designed to be public (they're used for client-side authentication)
> - **API Gateway URL** is public (it's your API endpoint)
> - **AWS Region** is not sensitive information
>
> **When to use AWS Secrets Manager instead:**
>
> - For server-side secrets (API keys, database passwords, private tokens)
> - For values that should never be exposed to the client
> - For sensitive configuration that changes frequently

| Variable Name                      | Value Source     | Description                       |
| ---------------------------------- | ---------------- | --------------------------------- |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Dev Stack Output | Cognito User Pool ID for dev      |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID`    | Dev Stack Output | Cognito Client ID for dev         |
| `NEXT_PUBLIC_AWS_REGION`           | Dev Stack Output | AWS Region (e.g., `eu-central-1`) |
| `NEXT_PUBLIC_API_URL`              | Dev Stack Output | API Gateway URL for dev           |

### How to Get Dev Stack Outputs:

Run the following command to get dev stack outputs:

```bash
cd infrastructure
aws cloudformation describe-stacks \
  --stack-name mostage-studio-stack-dev \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table
```

Or use CDK:

```bash
cd infrastructure
npm run deploy:dev
# Look for outputs in the terminal
```

5. **Important:** Before clicking "Save and deploy", make sure you're setting variables for the `dev` branch, not "All branches"
6. Click **"Save and deploy"**

> **Note:** If you don't see an option to select a specific branch during initial setup, don't worry. You can add branch-specific variables after the first deployment in Step 6.

## Step 4: Wait for Initial Deployment

1. Wait for the first deployment to complete (usually 5-10 minutes)
2. Once complete, you'll see the deployment URL: `https://dev.{app-id}.amplifyapp.com`

## Step 5: Add Main Branch (Production)

1. In the Amplify Console, go to your app
2. Click **"Hosting"** in the left sidebar
3. Click **"Add branch"**
4. Select branch: `main`
5. Click **"Next"**

## Step 6: Configure Environment Variables Per Branch

> **Important:** In AWS Amplify, environment variables can be set for:
>
> - **"All branches"** - Applies to all branches (same values for all)
> - **Specific branch** - Applies only to that branch (different values per branch)
>
> Since we need **different values for dev and main branches**, we must set them **per branch**.

### Method 1: Set Variables When Adding Branch (Recommended)

When adding the `main` branch, you'll see an **"Environment variables"** section. Here you can:

1. **Select "main" branch** from the dropdown (if available)
2. Add variables specific to the `main` branch
3. These will be different from `dev` branch variables

### Method 2: Set Variables After Branch Creation

If you can't set branch-specific variables during branch creation:

1. Go to **"App settings"** → **"Environment variables"**
2. You'll see a dropdown at the top: **"Branch: [All branches ▼]"**
3. **Click the dropdown** and select **"dev"** branch
4. Add/verify variables for `dev` branch (from dev stack outputs)
5. **Click the dropdown again** and select **"main"** branch
6. Add variables for `main` branch (from prod stack outputs - **different values!**)

### Visual Guide: Branch Selection in Environment Variables

```
┌─────────────────────────────────────────────┐
│ Environment variables                        │
├─────────────────────────────────────────────┤
│ Branch: [All branches ▼]  ← Click here!    │
│                                         │
│ Options:                                   │
│   • All branches                           │
│   • dev          ← Select for dev vars     │
│   • main         ← Select for main vars    │
└─────────────────────────────────────────────┘
```

### Configure Environment Variables for Main Branch

### Setting Environment Variables for Main Branch

1. After adding the `main` branch, go to **"App settings"** → **"Environment variables"**
2. **Select "main" branch** from the branch dropdown (not "All branches")
3. Add the following environment variables **for the `main` branch only**:

> **Note:** Same as dev branch - these are public variables that are safe to expose in the client bundle.
>
> **Important:** These values are **different** from dev branch values. Make sure you're using **prod stack outputs**, not dev stack outputs.

| Variable Name                      | Value Source      | Description                       |
| ---------------------------------- | ----------------- | --------------------------------- |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Prod Stack Output | Cognito User Pool ID for prod     |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID`    | Prod Stack Output | Cognito Client ID for prod        |
| `NEXT_PUBLIC_AWS_REGION`           | Prod Stack Output | AWS Region (e.g., `eu-central-1`) |
| `NEXT_PUBLIC_API_URL`              | Prod Stack Output | API Gateway URL for prod          |

### Visual Guide: Setting Variables Per Branch

In the Amplify Console, when you're in **"App settings"** → **"Environment variables"**, you'll see:

```
┌─────────────────────────────────────────┐
│ Branch: [All branches ▼]               │  ← Don't select this!
│                                         │
│ Or select a specific branch:            │
│ Branch: [dev ▼]                         │  ← Select this for dev
│ Branch: [main ▼]                        │  ← Select this for main
└─────────────────────────────────────────┘
```

**Always select the specific branch** (dev or main) before adding variables.

### How to Get Prod Stack Outputs:

Run the following command to get prod stack outputs:

```bash
cd infrastructure
aws cloudformation describe-stacks \
  --stack-name mostage-studio-stack-prod \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table
```

Or use CDK:

```bash
cd infrastructure
npm run deploy:prod
# Look for outputs in the terminal
```

6. Click **"Save"**

## Step 7: Configure Branch Settings (Optional)

### Enable Auto-Build

1. Go to **"App settings"** → **"Branch settings"**
2. For each branch (`dev` and `main`):
   - Enable **"Auto-build"** (builds automatically on push)
   - Enable **"Pull request previews"** for `dev` branch (optional)

### Branch Protection

1. Go to **"App settings"** → **"Branch settings"**
2. Select a branch
3. Enable **"Branch protection"** if needed (prevents accidental deletions)

## Step 8: Custom Domain (Optional)

1. Go to **"App settings"** → **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain name (e.g., `studio.mostage.app`)
4. Follow the DNS configuration instructions
5. SSL certificate will be automatically provisioned by AWS

## Verification

### Check Deployment Status

1. Go to **"Hosting"** in the Amplify Console
2. You should see both branches:
   - `dev`: `https://dev.{app-id}.amplifyapp.com`
   - `main`: `https://main.{app-id}.amplifyapp.com`

### Test the Application

1. Visit the dev URL and verify:
   - Application loads correctly
   - Authentication works (Cognito)
   - API calls work (API Gateway)
2. Visit the main URL and verify the same

## Manual Deployment

To manually trigger a deployment:

1. Go to **"Hosting"** → **"Deployments"**
2. Click **"Redeploy this version"** for a specific deployment
3. Or click **"Redeploy"** next to the branch name

## Using AWS Secrets Manager (Alternative Approach)

### When to Use Secrets Manager

AWS Secrets Manager is recommended for:

- **Server-side secrets** (API keys, database passwords, private tokens)
- **Sensitive values** that should never be exposed to the client
- **Values that change frequently** and need centralized management

### Current Setup Uses Environment Variables

The current setup uses environment variables because:

1. **All variables are `NEXT_PUBLIC_`** - They must be accessible in client-side JavaScript
2. **Cognito IDs are public by design** - User Pool ID and Client ID are meant to be public
3. **API Gateway URL is public** - It's your public API endpoint
4. **No sensitive data** - None of these values are secrets

### If You Need Secrets Manager

If you need to store server-side secrets (e.g., for API routes or server components):

1. **Create a secret in AWS Secrets Manager:**

   ```bash
   aws secretsmanager create-secret \
     --name mostage-studio/dev/secrets \
     --secret-string '{"UNSPLASH_API_KEY":"your-key-here"}' \
     --region eu-central-1
   ```

2. **Grant Amplify access to the secret:**

   - Go to IAM → Roles
   - Find the Amplify service role
   - Add policy: `SecretsManagerReadWrite` (or create custom policy)

3. **Use in Amplify build:**

   - In `amplify.yml`, add a step to fetch secrets:

   ```yaml
   preBuild:
     commands:
       - cd frontend
       - npm ci
       - |
         # Fetch secrets from AWS Secrets Manager
         SECRET=$(aws secretsmanager get-secret-value \
           --secret-id mostage-studio/dev/secrets \
           --region eu-central-1 \
           --query SecretString --output text)
         export UNSPLASH_API_KEY=$(echo $SECRET | jq -r .UNSPLASH_API_KEY)
   ```

4. **Use in server-side code only:**
   - Never use `NEXT_PUBLIC_` prefix for secrets
   - Only access in API routes or Server Components
   - Never expose in client-side code

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js on Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
- [Environment Variables in Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
