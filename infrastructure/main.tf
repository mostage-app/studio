terraform {
  required_version = ">= 1.5.0"

  # Backend configuration is provided via -backend-config flag
  # Use: terraform init -backend-config=config/backend-{env}.hcl
  backend "s3" {
    # Values are provided via backend config file
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Mostage Studio"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}

# Cognito Module
module "cognito" {
  source = "./modules/cognito"

  user_pool_name        = var.user_pool_name != "" ? var.user_pool_name : "${var.environment == "prod" ? "mostage-studio-users-prod" : "mostage-studio-users-dev"}"
  user_pool_client_name = var.user_pool_client_name != "" ? var.user_pool_client_name : "${var.environment == "prod" ? "mostage-studio-web-client-prod" : "mostage-studio-web-client-dev"}"

  tags = {
    Service = "Authentication"
  }
}
