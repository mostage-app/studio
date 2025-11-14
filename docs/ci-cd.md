# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for Mostage Studio using GitHub Actions.

## Overview

The project uses GitHub Actions for automated testing, building, and deployment. There are three main workflows:

1. **CI Workflow** - Runs on every push and pull request
2. **Deploy Pages Workflow** - Deploys frontend to GitHub Pages
3. **Deploy Infrastructure Workflow** - Deploys AWS infrastructure (manual trigger)

## Workflows

### 1. CI Workflow (`ci.yml`)

**Purpose**: Automated code quality checks and validation

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### Frontend Checks

- **Lint**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript types
- **Build**: Tests if the project builds successfully

#### Infrastructure Checks

- **Type Check**: Validates TypeScript types in infrastructure code
- **Build**: Compiles TypeScript infrastructure code
- **CDK Synth**: Validates CDK syntax and generates CloudFormation template (dry-run)

**Location**: `.github/workflows/ci.yml`

### 2. Deploy Pages Workflow (`deploy-pages.yml`)

**Purpose**: Deploys the frontend application to GitHub Pages

**Triggers**:

- Push to `main` branch
- Manual trigger via `workflow_dispatch`

**Process**:

1. Installs dependencies
2. Runs lint and type check (non-blocking)
3. Builds the Next.js application
4. Uploads build artifacts
5. Deploys to GitHub Pages

**Environment Variables**:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional) - Google Analytics ID

**Location**: `.github/workflows/deploy-pages.yml`

### 3. Deploy Infrastructure Workflow (`deploy-infrastructure.yml`)

**Purpose**: Deploys AWS infrastructure using CDK

**Triggers**:

- Manual trigger only (`workflow_dispatch`)

**Inputs**:

- `stack_name` (default: `MostageStudioAuthStack`) - CloudFormation stack name
- `region` (default: `eu-central-1`) - AWS region
- `user_pool_name` (default: `mostage-studio-users`) - Cognito User Pool name
- `user_pool_client_name` (default: `mostage-studio-web-client`) - Cognito User Pool Client name

**Process**:

1. Configures AWS credentials
2. Installs dependencies
3. Builds infrastructure code
4. Runs `cdk diff` to show changes
5. Deploys stack using `cdk deploy`

**Required Secrets**:

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

**Environment**: `aws-production` (with optional approval protection)

**Location**: `.github/workflows/deploy-infrastructure.yml`

## GitHub Setup

### Required Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### For Frontend Deploy

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional) - Google Analytics Measurement ID

#### For Infrastructure Deploy

- `AWS_ACCESS_KEY_ID` - AWS IAM user access key
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user secret key

### Required Environments

Go to **Settings → Environments** and create:

#### `aws-production`

- Used for infrastructure deployment
- Optional: Add required reviewers for approval
- Optional: Restrict deployment branches

#### `github-pages`

- Usually created automatically
- Used for frontend deployment

### GitHub Pages Configuration

Go to **Settings → Pages**:

- **Source**: Select "GitHub Actions"
- **Branch**: `main` (or your default branch)

## Workflow Files

```text
.github/workflows/
├── ci.yml                      # CI checks (lint, type-check, build)
├── deploy-pages.yml            # Frontend deployment to GitHub Pages
└── deploy-infrastructure.yml  # Infrastructure deployment to AWS
```

## Usage

### Running CI Checks

CI checks run automatically on:

- Every push to `main` or `develop`
- Every pull request

You can also manually trigger from **Actions → CI → Run workflow**

### Deploying Frontend

Frontend deploys automatically when you push to `main` branch.

To deploy manually:

1. Go to **Actions → Deploy to GitHub Pages**
2. Click **Run workflow**
3. Select branch (usually `main`)
4. Click **Run workflow**

### Deploying Infrastructure

Infrastructure deployment is **manual only** for security:

1. Go to **Actions → Deploy Infrastructure**
2. Click **Run workflow**
3. (Optional) Set:
   - `stack_name` - CloudFormation stack name
   - `region` - AWS region
   - `user_pool_name` - Cognito User Pool name (e.g., `mostage-studio-users-prod`)
   - `user_pool_client_name` - Cognito User Pool Client name (e.g., `mostage-studio-web-client-prod`)
4. Click **Run workflow**

## Troubleshooting

### CI Workflow Fails

**Lint errors**:

- Check ESLint output in Actions logs
- Fix linting issues locally: `cd frontend && npm run lint`

**Type check errors**:

- Check TypeScript errors in Actions logs
- Fix type errors locally: `cd frontend && npx tsc --noEmit`

**Build errors**:

- Check build logs in Actions
- Test build locally: `cd frontend && npm run build`

### Deploy Pages Fails

**Build errors**:

- Check if environment variables are set correctly
- Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (if using analytics)

**Deployment errors**:

- Check GitHub Pages settings
- Verify Pages source is set to "GitHub Actions"

### Deploy Infrastructure Fails

**AWS credentials errors**:

- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
- Check if IAM user has required permissions
- See [Infrastructure Setup](infrastructure.md) for IAM policy details

**CDK errors**:

- Check if CDK is bootstrapped: `cd infrastructure && cdk bootstrap`
- Verify stack name matches: `MostageStudioAuthStack`
- Check CloudFormation console for detailed errors

## Best Practices

1. **Always run CI locally** before pushing:

   ```bash
   cd frontend && npm run lint && npx tsc --noEmit && npm run build
   ```

2. **Review CI results** before merging PRs

3. **Test infrastructure changes** locally before deploying:

   ```bash
   cd infrastructure && npm run cdk:diff
   ```

4. **Use environment protection** for production deployments

5. **Rotate AWS credentials** periodically

## Security Considerations

- Infrastructure deployment is **manual only** to prevent accidental changes
- AWS credentials are stored as GitHub Secrets (encrypted)
- Environment protection can require approvals for production deployments
- IAM user should have **minimal required permissions** (see [Infrastructure Setup](infrastructure.md))

## Related Documentation

- [Infrastructure Setup](infrastructure.md) - AWS CDK setup and IAM policies
- [Authentication Setup](authentication.md) - Cognito configuration
- [Project Structure](structure.md) - Project architecture
