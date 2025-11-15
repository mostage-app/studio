# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for Mostage Studio using GitHub Actions.

## Overview

The project uses GitHub Actions for automated testing, building, and deployment. There are three main workflows:

1. **CI Frontend Workflow** - Runs on frontend changes
2. **CI Infrastructure Workflow** - Runs on infrastructure changes
3. **Deploy Frontend Workflow** - Deploys frontend to GitHub Pages

**Note**: Infrastructure deployment is performed **manually** using Terraform commands locally. See [Infrastructure Setup](infrastructure.md) for deployment instructions.

## Workflows

### 1. CI Frontend Workflow (`ci-frontend.yml`)

**Purpose**: Automated code quality checks and validation for frontend

**Triggers**:

- Push to `main` or `develop` branches **only when files in `frontend/` change**
- Pull requests to `main` or `develop` branches **only when files in `frontend/` change**

**Jobs**:

- **Lint**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript types
- **Build**: Tests if the project builds successfully

**Location**: `.github/workflows/ci-frontend.yml`

### 2. CI Infrastructure Workflow (`ci-infrastructure.yml`)

**Purpose**: Automated validation for infrastructure code

**Triggers**:

- Push to `main` or `develop` branches **only when files in `infrastructure/` change**
- Pull requests to `main` or `develop` branches **only when files in `infrastructure/` change**

**Jobs**:

- **Validate**: Initializes Terraform and validates configuration
- **Format Check**: Checks Terraform code formatting

**Location**: `.github/workflows/ci-infrastructure.yml`

### 3. Deploy Frontend Workflow (`deploy-frontend.yml`)

**Purpose**: Deploys the frontend application to GitHub Pages

**Triggers**:

- Push to `main` branch **only when files in `frontend/` change**
- Manual trigger via `workflow_dispatch`

**Process**:

1. Installs dependencies
2. Builds the Next.js application (lint and type-check are handled by CI workflow)
3. Uploads build artifacts
4. Deploys to GitHub Pages

**Note**: This workflow only builds and deploys. Lint and type-check are performed by the CI Frontend workflow to avoid duplicate work.

**Environment Variables**:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional) - Google Analytics ID
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID_PROD` (required) - Production Cognito User Pool ID
- `NEXT_PUBLIC_COGNITO_CLIENT_ID_PROD` (required) - Production Cognito Client ID
- `NEXT_PUBLIC_AWS_REGION` (required) - AWS Region (e.g., `eu-central-1`)

**Note**: These environment variables must be set in GitHub Secrets (Settings → Secrets and variables → Actions) because Next.js requires them at build time for static export.

**Location**: `.github/workflows/deploy-frontend.yml`

## GitHub Setup

### Required Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### For Frontend Deploy

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional) - Google Analytics Measurement ID
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID_PROD` (required) - Production Cognito User Pool ID
- `NEXT_PUBLIC_COGNITO_CLIENT_ID_PROD` (required) - Production Cognito Client ID
- `NEXT_PUBLIC_AWS_REGION` (required) - AWS Region (e.g., `eu-central-1`)

### Required Environments

Go to **Settings → Environments** and create:

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
├── ci-frontend.yml            # Frontend CI checks (lint, type-check, build)
├── ci-infrastructure.yml      # Infrastructure CI checks (validate, format)
└── deploy-frontend.yml        # Frontend deployment to GitHub Pages
```

## Usage

### Running CI Checks

CI checks run automatically on:

- **Frontend CI**: When files in `frontend/` change
- **Infrastructure CI**: When files in `infrastructure/` change

You can also manually trigger from **Actions → CI Frontend** or **Actions → CI Infrastructure**

### Deploying Frontend

Frontend deploys automatically when you push to `main` branch.

To deploy manually:

1. Go to **Actions → Deploy Frontend**
2. Click **Run workflow**
3. Select branch (usually `main`)
4. Click **Run workflow**

### Deploying Infrastructure

Infrastructure deployment is performed **manually** using Terraform commands locally. This ensures better control and security.

**For Development**:

```bash
cd infrastructure
terraform init -backend-config=config/backend-dev.hcl
terraform plan -var="environment=dev"
terraform apply -var="environment=dev"
```

**For Production**:

```bash
cd infrastructure
terraform init -backend-config=config/backend-prod.hcl
terraform plan -var="environment=prod"
terraform apply -var="environment=prod"
```

**Important**:

- Always review the plan before applying
- Each environment has separate state files and resources
- Users in dev and prod are completely isolated
- After deployment, update GitHub Secrets with new Cognito IDs if they changed

See [Infrastructure Setup](infrastructure.md) for detailed instructions.

## Troubleshooting

### CI Frontend Workflow Fails

**Lint errors**:

- Check ESLint output in Actions logs
- Fix linting issues locally: `cd frontend && npm run lint`

**Type check errors**:

- Check TypeScript errors in Actions logs
- Fix type errors locally: `cd frontend && npx tsc --noEmit`

**Build errors**:

- Check build logs in Actions
- Test build locally: `cd frontend && npm run build`

### CI Infrastructure Workflow Fails

**Terraform validation errors**:

- Check Terraform output in Actions logs
- Validate locally: `cd infrastructure && terraform validate`

**Format check errors**:

- Check format output in Actions logs
- Format locally: `cd infrastructure && terraform fmt -check -recursive`

### Deploy Frontend Fails

**Build errors**:

- Check if environment variables are set correctly
- Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (if using analytics)

**Deployment errors**:

- Check GitHub Pages settings
- Verify Pages source is set to "GitHub Actions"

## Best Practices

1. **Always run CI locally** before pushing:

   ```bash
   cd frontend && npm run lint && npx tsc --noEmit && npm run build
   ```

2. **Review CI results** before merging PRs

3. **Test infrastructure changes** locally before deploying:

   ```bash
   cd infrastructure && terraform plan -var="environment=dev"
   ```

4. **Always review Terraform plan** before applying changes

5. **Update GitHub Secrets** after infrastructure deployment if Cognito IDs changed

## Security Considerations

- Infrastructure deployment is performed **manually** locally to prevent accidental changes
- AWS credentials are configured locally using `aws configure`
- Always review Terraform plan before applying changes
- IAM user should have **minimal required permissions** (see [Infrastructure Setup](infrastructure.md))

## Related Documentation

- [Infrastructure Setup](infrastructure.md) - AWS Terraform setup and IAM policies
- [Authentication Setup](authentication.md) - Cognito configuration
- [Project Structure](structure.md) - Project architecture
