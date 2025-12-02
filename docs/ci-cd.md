# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for Mostage Studio using GitHub Actions.

## Overview

The project uses GitHub Actions for automated testing, building, and deployment. There are three main CI workflows:

1. **CI Frontend Workflow** - Runs on frontend changes
2. **CI Backend Workflow** - Runs on backend changes
3. **CI Infrastructure Workflow** - Runs on infrastructure changes

**Note**: Infrastructure deployment is performed **manually** using AWS CDK commands locally. Frontend deployment is handled by AWS Amplify (see `amplify.yml`). See [Infrastructure Setup](infrastructure.md) for deployment instructions.

## Workflows

### 1. CI Frontend Workflow (`ci-frontend.yml`)

**Purpose**: Automated code quality checks and validation for frontend

**Triggers**:

- Push to `main` or `dev` branches **only when files in `frontend/` change**
- Pull requests to `main` or `dev` branches **only when files in `frontend/` change**

**Jobs**:

- **Lint**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript types
- **Build**: Tests if the project builds successfully

**Location**: `.github/workflows/ci-frontend.yml`

### 2. CI Infrastructure Workflow (`ci-infrastructure.yml`)

**Purpose**: Automated validation for infrastructure code

**Triggers**:

- Push to `main` or `dev` branches **only when files in `infrastructure/` change**
- Pull requests to `main` or `dev` branches **only when files in `infrastructure/` change**

**Jobs**:

- **Build**: Compiles TypeScript to JavaScript
- **Type Check**: Validates TypeScript types

**Location**: `.github/workflows/ci-infrastructure.yml`

### 3. CI Backend Workflow (`ci-backend.yml`)

**Purpose**: Automated validation for backend Lambda functions

**Triggers**:

- Push to `main` or `dev` branches **only when files in `backend/` change**
- Pull requests to `main` or `dev` branches **only when files in `backend/` change**

**Jobs**:

- **Build**: Compiles TypeScript to JavaScript
- **Type Check**: Validates TypeScript types

**Location**: `.github/workflows/ci-backend.yml`

## GitHub Setup

### Required Secrets

Currently, no GitHub Secrets are required for CI workflows. Environment variables for frontend builds are handled by AWS Amplify (see `amplify.yml`).

## Workflow Files

```text
.github/workflows/
├── ci-frontend.yml            # Frontend CI checks (lint, type-check, build)
├── ci-backend.yml             # Backend CI checks (build, type-check)
└── ci-infrastructure.yml      # Infrastructure CI checks (build, type-check)
```

**Note**: Frontend deployment is handled by AWS Amplify (see `amplify.yml` in the root directory).

## Usage

### Running CI Checks

CI checks run automatically on:

- **Frontend CI**: When files in `frontend/` change
- **Backend CI**: When files in `backend/` change
- **Infrastructure CI**: When files in `infrastructure/` change

You can also manually trigger from **Actions → CI Frontend**, **Actions → CI Backend**, or **Actions → CI Infrastructure**

### Deploying Frontend

Frontend deployment is handled by AWS Amplify. See `amplify.yml` in the root directory for configuration.

### Deploying Infrastructure

Infrastructure deployment is performed **manually** using AWS CDK commands locally. This ensures better control and security.

**For Development**:

```bash
cd infrastructure
npm install
npm run build
npm run diff:dev
npm run deploy:dev
```

**For Production**:

```bash
cd infrastructure
npm install
npm run build
npm run diff:prod
npm run deploy:prod
```

**Important**:

- Always review the diff before deploying
- Each environment has separate stacks and resources
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

**CDK build errors**:

- Check build output in Actions logs
- Build locally: `cd infrastructure && npm run build`

**TypeScript type errors**:

- Check type check output in Actions logs
- Type check locally: `cd infrastructure && npx tsc --noEmit`

### CI Backend Workflow Fails

**Build errors**:

- Check build output in Actions logs
- Build locally: `cd backend && npm run build`

**TypeScript type errors**:

- Check type check output in Actions logs
- Type check locally: `cd backend && npx tsc --noEmit`

## Best Practices

1. **Always run CI locally** before pushing:

   ```bash
   # Frontend
   cd frontend && npm run lint && npx tsc --noEmit && npm run build

   # Backend
   cd backend && npm run build && npx tsc --noEmit

   # Infrastructure
   cd infrastructure && npm run build && npx tsc --noEmit
   ```

2. **Review CI results** before merging PRs

3. **Test infrastructure changes** locally before deploying:

   ```bash
   cd infrastructure && npm run build && npm run diff:dev
   ```

4. **Always review CDK diff** before deploying changes

5. **Update GitHub Secrets** after infrastructure deployment if Cognito IDs changed

## Security Considerations

- Infrastructure deployment is performed **manually** locally to prevent accidental changes
- AWS credentials are configured locally using `aws configure`
- Always review CDK diff before deploying changes
- IAM user should have **minimal required permissions** (see [Infrastructure Setup](infrastructure.md))

## Related Documentation

- [Infrastructure Setup](infrastructure.md) - AWS CDK setup and IAM policies
- [Authentication Setup](authentication.md) - Cognito configuration
- [Project Structure](structure.md) - Project architecture
