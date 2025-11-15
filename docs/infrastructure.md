# Infrastructure

This document describes the Terraform infrastructure code for Mostage Studio.

The infrastructure code is located in the `infrastructure/` directory and is organized using **modules** for scalability and maintainability.

## Structure

The infrastructure follows a modular architecture:

```text
infrastructure/
├── modules/                    # Reusable service modules
│   └── cognito/               # Cognito authentication module
│       ├── main.tf            # Module resources
│       ├── variables.tf       # Module variables
│       └── outputs.tf         # Module outputs
├── main.tf                    # Root module (calls service modules)
├── variables.tf               # Root variables
├── outputs.tf                 # Root outputs
├── versions.tf                # Provider versions
├── config/                    # Configuration files
│   ├── backend-dev.hcl      # Backend config for development
│   └── backend-prod.hcl     # Backend config for production
└── scripts/                   # Utility scripts
    └── setup-terraform-backend.sh  # Setup script for remote state
```

### Benefits of Modular Structure

- **Scalability**: Easy to add new services by creating new modules
- **Maintainability**: Each service is isolated in its own module
- **Reusability**: Modules can be reused across different projects
- **Organization**: Clear separation of concerns

## Prerequisites

1. **Terraform** (>= 1.5.0) - [Installation Guide](https://developer.hashicorp.com/terraform/downloads)
2. **AWS CLI** - [Installation Guide](https://aws.amazon.com/cli/)
3. **AWS Account** with appropriate permissions

## Setup

1. **Install Terraform**:
2. **Configure AWS credentials**:

   ```bash
   aws configure
   ```

   Enter the following information:

   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `eu-central-1`)
   - Default output format: `json`

3. **Setup Terraform Backend** (First time only):

   Run the setup script to create S3 bucket and DynamoDB table for remote state:

   ```bash
   cd infrastructure
   ./scripts/setup-terraform-backend.sh
   ```

   This script creates:

   - S3 bucket: `mostage-studio-terraform-state`
   - DynamoDB table: `terraform-state-lock`

   **Note**: This only needs to be run once. If the bucket and table already exist, the script will skip creation.

4. **Initialize Terraform**:

   **Development**:

   ```bash
   cd infrastructure
   terraform init -backend-config=config/backend-dev.hcl
   ```

   **Production**:

   ```bash
   cd infrastructure
   terraform init -backend-config=config/backend-prod.hcl
   ```

   **Switching between environments**:

   If you've already initialized for one environment and want to switch to another, use `-reconfigure`:

   ```bash
   # Switch to dev
   terraform init -reconfigure -backend-config=config/backend-dev.hcl

   # Switch to prod
   terraform init -reconfigure -backend-config=config/backend-prod.hcl
   ```

   This will download the required providers (AWS provider) and configure the appropriate state backend.

## Deployment

### First Time Deployment

#### Development Environment

**⚠️ Important**: Always use the correct backend config file. Using the wrong backend config will deploy to the wrong environment.

1. **Initialize with correct backend config**:

   ```bash
   terraform init -backend-config=config/backend-dev.hcl
   ```

   **Note**: If you've already initialized for another environment (e.g., prod), use `-reconfigure`:

   ```bash
   terraform init -reconfigure -backend-config=config/backend-dev.hcl
   ```

2. **Review the plan**:

   ```bash
   terraform plan -var="environment=dev"
   ```

   **Verify**: Check that the plan shows `mostage-studio-users-dev` (not `prod`). This shows what resources will be created for development.

3. **Apply the changes**:

   ```bash
   terraform apply -var="environment=dev"
   ```

   Type `yes` when prompted to confirm.

4. **Get outputs** (User Pool ID and Client ID):

   ```bash
   terraform output
   ```

   Or get specific output:

   ```bash
   terraform output user_pool_id
   terraform output user_pool_client_id
   terraform output user_pool_region
   ```

5. **Update frontend environment variables** (for development):
   - `user_pool_id` → `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
   - `user_pool_client_id` → `NEXT_PUBLIC_COGNITO_CLIENT_ID`
   - `user_pool_region` → `NEXT_PUBLIC_AWS_REGION`

#### Production Environment

**⚠️ Important**: Always use the correct backend config file. Using the wrong backend config will deploy to the wrong environment.

1. **Initialize with correct backend config**:

   ```bash
   terraform init -backend-config=config/backend-prod.hcl
   ```

   **Note**: If you've already initialized for another environment (e.g., dev), use `-reconfigure`:

   ```bash
   terraform init -reconfigure -backend-config=config/backend-prod.hcl
   ```

2. **Review the plan**:

   ```bash
   terraform plan -var="environment=prod"
   ```

   **Verify**: Check that the plan shows `mostage-studio-users-prod` (not `dev`).

3. **Apply the changes**:

   ```bash
   terraform apply -var="environment=prod"
   ```

4. **Get outputs**:

   ```bash
   terraform output
   ```

   Or get specific output:

   ```bash
   terraform output user_pool_id
   terraform output user_pool_client_id
   terraform output user_pool_region
   ```

5. **Update GitHub Secrets** (for production):

   **Important**: After deploying infrastructure, you must update GitHub Secrets with the new Cognito IDs if they changed.

   Go to **Settings → Secrets and variables → Actions** and update:

   - `NEXT_PUBLIC_COGNITO_USER_POOL_ID` → New `user_pool_id` from Terraform output
   - `NEXT_PUBLIC_COGNITO_CLIENT_ID` → New `user_pool_client_id` from Terraform output
   - `NEXT_PUBLIC_AWS_REGION` → AWS region (e.g., `eu-central-1`)

   **Note**: These secrets are used by the frontend deployment workflow. After updating, redeploy the frontend.

   See [Authentication Setup](authentication.md) for detailed instructions.

### Subsequent Deployments

#### Development

1. **Initialize (if switching from prod)**:

   ```bash
   terraform init -reconfigure -backend-config=config/backend-dev.hcl
   ```

2. **Plan changes**:

   ```bash
   terraform plan -var="environment=dev"
   ```

3. **Apply changes**:

   ```bash
   terraform apply -var="environment=dev"
   ```

#### Production

1. **Initialize (if switching from dev)**:

   ```bash
   terraform init -reconfigure -backend-config=config/backend-prod.hcl
   ```

2. **Plan changes**:

   ```bash
   terraform plan -var="environment=prod"
   ```

   **Important**: Always review the plan carefully. Check if any resources will be destroyed or recreated, as this may result in data loss (e.g., user accounts).

3. **Apply changes**:

   ```bash
   terraform apply -var="environment=prod"
   ```

4. **Get outputs and update GitHub Secrets**:

   ```bash
   terraform output
   ```

   If `user_pool_id` or `user_pool_client_id` changed:

   - Go to **Settings → Secrets and variables → Actions**
   - Update `NEXT_PUBLIC_COGNITO_USER_POOL_ID` with new `user_pool_id`
   - Update `NEXT_PUBLIC_COGNITO_CLIENT_ID` with new `user_pool_client_id`
   - Redeploy frontend after updating secrets

## Complete Workflow Example

Here's a complete workflow for deploying both dev and prod environments in the same directory:

### Deploy Dev Environment

```bash
cd infrastructure

# Initialize for dev (first time)
terraform init -backend-config=config/backend-dev.hcl

# Plan changes
terraform plan -var="environment=dev"

# Apply changes
terraform apply -var="environment=dev"

# Get outputs
terraform output
```

### Deploy Prod Environment (in the same directory)

```bash
# Switch to prod backend (use -reconfigure when switching)
terraform init -reconfigure -backend-config=config/backend-prod.hcl

# Plan changes
terraform plan -var="environment=prod"

# Apply changes
terraform apply -var="environment=prod"

# Get outputs
terraform output
```

### Switch Back to Dev

```bash
# Switch back to dev backend
terraform init -reconfigure -backend-config=config/backend-dev.hcl

# Continue with dev operations
terraform plan -var="environment=dev"
```

**Key Points**:

- Use `terraform init -backend-config=...` for **first time** initialization
- Use `terraform init -reconfigure -backend-config=...` when **switching** between environments
- Always verify the plan shows the correct environment name (dev/prod) before applying
- Dev and prod have completely separate state files and resources

## Available Commands

### Using Makefile (Recommended)

For convenience, you can use the provided Makefile:

```bash
# Development
make init-dev       # Initialize for development (first time)
make switch-dev     # Switch to development environment
make plan-dev       # Preview changes
make apply-dev      # Apply changes
make output         # Show outputs

# Production
make init-prod      # Initialize for production (first time)
make switch-prod    # Switch to production environment
make plan-prod      # Preview changes
make apply-prod     # Apply changes

# Utilities
make validate       # Validate configuration
make fmt            # Format files
make fmt-check      # Check formatting
make help           # Show all available commands
```

### Using Terraform Directly

Standard Terraform commands:

- `terraform init -backend-config=config/backend-dev.hcl` - Initialize Terraform for development (first time)
- `terraform init -reconfigure -backend-config=config/backend-dev.hcl` - Switch to development environment
- `terraform init -backend-config=config/backend-prod.hcl` - Initialize Terraform for production (first time)
- `terraform init -reconfigure -backend-config=config/backend-prod.hcl` - Switch to production environment
- `terraform plan -var="environment=dev"` - Preview changes for development
- `terraform plan -var="environment=prod"` - Preview changes for production
- `terraform apply -var="environment=dev"` - Apply changes for development
- `terraform apply -var="environment=prod"` - Apply changes for production
- `terraform destroy -var="environment=dev"` - Destroy all resources for development (⚠️ removes all resources)
- `terraform destroy -var="environment=prod"` - Destroy all resources for production (⚠️ removes all resources)
- `terraform validate` - Validate configuration
- `terraform fmt -recursive` - Format configuration files
- `terraform fmt -check -recursive` - Check formatting
- `terraform output` - Show outputs

## State Management

Terraform stores state in a local file (`terraform.tfstate`) by default. This project is configured to use **remote state** (S3 backend) with **separate state files for each environment** (dev and prod) for better isolation and CI/CD support.

### Setup Remote State (First Time Only)

Run the setup script to create the S3 bucket and DynamoDB table:

```bash
cd infrastructure
./scripts/setup-terraform-backend.sh
```

This script will:

- Create S3 bucket for state storage
- Enable versioning and encryption
- Block public access
- Create DynamoDB table for state locking

### Manual Setup (Alternative)

If you prefer to set up manually:

1. **Create S3 bucket**:

   ```bash
   aws s3 mb s3://mostage-studio-terraform-state --region eu-central-1
   ```

2. **Enable versioning**:

   ```bash
   aws s3api put-bucket-versioning \
     --bucket mostage-studio-terraform-state \
     --versioning-configuration Status=Enabled
   ```

3. **Enable encryption**:

   ```bash
   aws s3api put-bucket-encryption \
     --bucket mostage-studio-terraform-state \
     --server-side-encryption-configuration '{
         "Rules": [{
             "ApplyServerSideEncryptionByDefault": {
                 "SSEAlgorithm": "AES256"
             }
         }]
     }'
   ```

4. **Create DynamoDB table for state locking**:

   ```bash
   aws dynamodb create-table \
     --table-name terraform-state-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region eu-central-1
   ```

5. **Initialize Terraform**:

   ```bash
   cd infrastructure
   terraform init
   ```

   If you have existing local state, migrate it:

   ```bash
   terraform init -migrate-state
   ```

### Backend Configuration

The backend configuration is provided via separate config files for each environment:

**Development** (`config/backend-dev.hcl`):

```hcl
bucket         = "mostage-studio-terraform-state"
key            = "infrastructure/dev/terraform.tfstate"
region         = "eu-central-1"
dynamodb_table = "terraform-state-lock"
encrypt        = true
```

**Production** (`config/backend-prod.hcl`):

```hcl
bucket         = "mostage-studio-terraform-state"
key            = "infrastructure/prod/terraform.tfstate"
region         = "eu-central-1"
dynamodb_table = "terraform-state-lock"
encrypt        = true
```

**Note**: Use the appropriate backend config file when initializing Terraform:

- **First time**:

  - Development: `terraform init -backend-config=config/backend-dev.hcl`
  - Production: `terraform init -backend-config=config/backend-prod.hcl`

- **Switching between environments** (after first initialization):
  - Development: `terraform init -reconfigure -backend-config=config/backend-dev.hcl`
  - Production: `terraform init -reconfigure -backend-config=config/backend-prod.hcl`

The `-reconfigure` flag tells Terraform to reconfigure the backend without migrating state, which is safe when switching between dev and prod since they use separate state files.

## Modules

### Cognito Module (`modules/cognito/`)

The Cognito module provides authentication services:

- **Cognito User Pool**: Manages user authentication
- **Cognito User Pool Client**: Web application client for frontend
- **HTML Email Templates**: Professional email templates for verification and password reset

#### Module Usage

```hcl
module "cognito" {
  source = "./modules/cognito"

  user_pool_name         = "my-user-pool"
  user_pool_client_name  = "my-web-client"

  # Optional: SES configuration for custom email templates
  ses_from_email        = "noreply@example.com"
  ses_reply_to_email    = "support@example.com"
  ses_configuration_set = "my-config-set"

  tags = {
    Environment = "production"
  }
}
```

#### Module Resources

- `aws_cognito_user_pool.main` - Cognito User Pool
- `aws_cognito_user_pool_client.main` - Cognito User Pool Client

#### Module Outputs

- `user_pool_id` - User Pool ID
- `user_pool_arn` - User Pool ARN
- `user_pool_client_id` - Client ID

#### Email Templates

The module includes professional HTML email templates:

- **Verification Email** (`templates/verification.html`): Sent during user registration
- **Password Reset Email** (`templates/password-reset.html`): Sent when users request password reset

Templates are automatically loaded and used by Cognito. The templates include:

- Professional HTML design
- Responsive layout
- Branding consistent with Mostage Studio
- Clear call-to-action with verification codes

**Note**: For production use, configure AWS SES to send emails from a verified domain. See [SES Module](#ses-module-modulesses) below.

#### Environment Resources

Each environment (dev/prod) has its own separate resources:

- **Cognito User Pool**:
  - Development: `mostage-studio-users-dev`
  - Production: `mostage-studio-users-prod`
- **Cognito User Pool Client**:
  - Development: `mostage-studio-web-client-dev`
  - Production: `mostage-studio-web-client-prod`

**Important**: Users in development and production are completely isolated. Changes in one environment do not affect the other.

### SES Module (`modules/ses/`)

The SES module provides email infrastructure for Cognito:

- **SES Email Identity**: Verified email address for sending emails
- **SES Configuration Set**: Optional configuration set for email tracking and analytics

#### Module Usage

```hcl
module "ses" {
  source = "./modules/ses"

  from_email_address       = "noreply@example.com"
  create_configuration_set = true
  configuration_set_name   = "cognito-email-config"
  create_event_destination = false

  tags = {
    Service = "Email"
  }
}
```

#### Module Resources

- `aws_ses_email_identity.main` - SES Email Identity
- `aws_ses_configuration_set.main` - SES Configuration Set (optional)
- `aws_ses_event_destination.main` - Event Destination for CloudWatch (optional)

#### Module Outputs

- `email_identity_arn` - ARN of the SES email identity
- `email_identity_email` - Email address of the SES email identity
- `configuration_set_name` - Name of the configuration set (if created)

#### SES Setup

To use SES with Cognito:

1. **Verify Email Address** (for development):

   ```bash
   # Email will be sent to verify the address
   terraform apply -var="create_ses_resources=true" -var="ses_from_email=noreply@example.com"
   ```

2. **Verify Domain** (for production - recommended):

   - Verify your domain in AWS SES Console
   - Use verified domain email addresses (e.g., `noreply@yourdomain.com`)

3. **Configure Cognito to use SES**:

   ```bash
   terraform apply \
     -var="create_ses_resources=true" \
     -var="ses_from_email=noreply@yourdomain.com" \
     -var="ses_reply_to_email=support@yourdomain.com"
   ```

**Important**:

- In AWS SES sandbox mode, you can only send emails to verified addresses
- To send to any email address, request production access in SES Console
- SES email identity verification is required before Cognito can send emails

### Adding New Services

To add a new AWS service (e.g., S3, Lambda, API Gateway):

1. Create a new module directory: `mkdir -p modules/your-service`
2. Define resources in `modules/your-service/main.tf`
3. Add variables in `modules/your-service/variables.tf`
4. Add outputs in `modules/your-service/outputs.tf`
5. Call the module in root `main.tf`
6. Add outputs to root `outputs.tf`

**Example**:

```hcl
# In main.tf
module "my_service" {
  source = "./modules/my-service"

  name = "my-service-${var.environment}"
  tags = {
    Service = "MyService"
  }
}

# In outputs.tf
output "my_service_id" {
  description = "My Service ID"
  value       = module.my_service.id
}
```

See the Cognito module section above for an example.

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

## Variables

You can customize deployment using variables:

```bash
terraform apply -var="aws_region=us-east-1" -var="user_pool_name=my-pool"
```

Or create a `terraform.tfvars` file:

```hcl
aws_region           = "eu-central-1"
user_pool_name       = "mostage-studio-users"
user_pool_client_name = "mostage-studio-web-client"
environment          = "production"
```

Then apply:

```bash
terraform apply -var-file="terraform.tfvars"
```

## IAM Policy for GitHub Actions

If you're deploying infrastructure via GitHub Actions, the IAM user needs specific permissions.

### For Regular Deployments (After Setup)

This policy is sufficient for regular Terraform deployments after the initial setup:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CognitoUserPoolManagement",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool",
        "cognito-idp:UpdateUserPool",
        "cognito-idp:DeleteUserPool",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:ListUserPools",
        "cognito-idp:GetUserPoolMfaConfig",
        "cognito-idp:SetUserPoolMfaConfig",
        "cognito-idp:AddCustomAttributes",
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
      "Sid": "S3ForTerraformState",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::mostage-studio-terraform-state",
        "arn:aws:s3:::mostage-studio-terraform-state/*"
      ]
    },
    {
      "Sid": "DynamoDBForTerraformLock",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
      "Resource": ["arn:aws:dynamodb:*:*:table/terraform-state-lock"]
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

### For Initial Setup (First Time Only)

If you need to run the setup script (`scripts/setup-terraform-backend.sh`) via GitHub Actions, you need additional permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CognitoUserPoolManagement",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool",
        "cognito-idp:UpdateUserPool",
        "cognito-idp:DeleteUserPool",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:ListUserPools",
        "cognito-idp:GetUserPoolMfaConfig",
        "cognito-idp:SetUserPoolMfaConfig",
        "cognito-idp:AddCustomAttributes",
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
      "Sid": "S3ForTerraformState",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::mostage-studio-terraform-state",
        "arn:aws:s3:::mostage-studio-terraform-state/*"
      ]
    },
    {
      "Sid": "S3ForSetup",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:HeadBucket",
        "s3:PutBucketPublicAccessBlock"
      ],
      "Resource": [
        "arn:aws:s3:::mostage-studio-terraform-state",
        "arn:aws:s3:::mostage-studio-terraform-state/*"
      ]
    },
    {
      "Sid": "DynamoDBForTerraformLock",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
      "Resource": ["arn:aws:dynamodb:*:*:table/terraform-state-lock"]
    },
    {
      "Sid": "DynamoDBForSetup",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:TagResource"
      ],
      "Resource": ["arn:aws:dynamodb:*:*:table/terraform-state-lock"]
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

**Note**: After the initial setup (S3 bucket and DynamoDB table are created), you can remove the "S3ForSetup" and "DynamoDBForSetup" statements and use the regular deployment policy.

### Steps to Apply IAM Policy

1. Go to **IAM → Users** in AWS Console
2. Select your GitHub Actions user (e.g., `mostage-studio-github-actions`)
3. Go to **Permissions** tab
4. Click **Add permissions → Create inline policy**
5. Select **JSON** tab
6. Paste the policy above
7. Review and name the policy (e.g., `TerraformDeploymentPolicy`)
8. Click **Create policy**

**Note**: Replace `*` in resource ARNs with your actual AWS account ID if you want to restrict access further.

## Security Considerations

- **State files contain sensitive data** - never commit to git
- **Use S3 encryption** for remote state
- **Enable versioning** on S3 bucket
- **Use IAM roles** instead of access keys when possible
- **Rotate credentials** periodically
- **Use least-privilege IAM policies**

## Related Documentation

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
