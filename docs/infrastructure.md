# Infrastructure

This document describes the Terraform infrastructure code for Mostage Studio.

The infrastructure code is located in the `infrastructure/` directory.

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

3. **Initialize Terraform**:

   ```bash
   cd infrastructure
   terraform init
   ```

   This will download the required providers (AWS provider).

## Deployment

### First Time Deployment

1. **Review the plan**:

   ```bash
   terraform plan
   ```

   This shows what resources will be created.

2. **Apply the changes**:

   ```bash
   terraform apply
   ```

   Type `yes` when prompted to confirm.

3. **Get outputs** (User Pool ID and Client ID):

   ```bash
   terraform output
   ```

   Or get specific output:

   ```bash
   terraform output user_pool_id
   terraform output user_pool_client_id
   terraform output user_pool_region
   ```

4. **Update frontend environment variables** with the output values:
   - `user_pool_id` → `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
   - `user_pool_client_id` → `NEXT_PUBLIC_COGNITO_CLIENT_ID`
   - `user_pool_region` → `NEXT_PUBLIC_AWS_REGION`

### Subsequent Deployments

1. **Plan changes**:

   ```bash
   terraform plan
   ```

2. **Apply changes**:

   ```bash
   terraform apply
   ```

## Available Commands

- `terraform init` - Initialize Terraform (download providers)
- `terraform plan` - Preview changes
- `terraform apply` - Apply changes
- `terraform destroy` - Destroy all resources (⚠️ removes all resources)
- `terraform validate` - Validate configuration
- `terraform fmt` - Format configuration files
- `terraform output` - Show outputs

## State Management

Terraform stores state in a local file (`terraform.tfstate`) by default. This project is configured to use **remote state** (S3 backend) for better collaboration and CI/CD support.

### Setup Remote State (First Time Only)

Run the setup script to create the S3 bucket and DynamoDB table:

```bash
cd infrastructure
./setup-backend.sh
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

The backend is already configured in `main.tf`:

```hcl
backend "s3" {
  bucket         = "mostage-studio-terraform-state"
  key            = "infrastructure/terraform.tfstate"
  region         = "eu-central-1"
  dynamodb_table = "terraform-state-lock"
  encrypt        = true
}
```

**Note**: The backend configuration is already set up. You just need to run the setup script to create the required AWS resources.

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

If you need to run the setup script (`setup-backend.sh`) via GitHub Actions, you need additional permissions:

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
