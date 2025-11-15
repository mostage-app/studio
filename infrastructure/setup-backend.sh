#!/bin/bash

# Script to setup S3 backend and DynamoDB table for Terraform state
# Run this script once before first terraform init

set -e

REGION="eu-central-1"
BUCKET_NAME="mostage-studio-terraform-state"
TABLE_NAME="terraform-state-lock"

echo "🚀 Setting up Terraform remote state backend..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Create S3 bucket for state
echo "📦 Creating S3 bucket: $BUCKET_NAME"
if aws s3api head-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
    echo "✅ Bucket already exists: $BUCKET_NAME"
else
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ Bucket created: $BUCKET_NAME"
fi

# Enable versioning
echo "📝 Enabling versioning on bucket..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled \
    --region "$REGION"
echo "✅ Versioning enabled"

# Enable encryption
echo "🔒 Enabling encryption on bucket..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' \
    --region "$REGION"
echo "✅ Encryption enabled"

# Block public access
echo "🔐 Blocking public access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region "$REGION"
echo "✅ Public access blocked"

# Create DynamoDB table for state locking
echo "🔒 Creating DynamoDB table for state locking: $TABLE_NAME"
if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &>/dev/null; then
    echo "✅ Table already exists: $TABLE_NAME"
else
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION" \
        --tags Key=Project,Value="Mostage Studio" Key=ManagedBy,Value="Terraform"
    echo "⏳ Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
    echo "✅ Table created: $TABLE_NAME"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: cd infrastructure"
echo "2. If you have existing state, run: terraform init -migrate-state"
echo "3. If this is first time, run: terraform init"
echo "4. Then: terraform plan && terraform apply"

