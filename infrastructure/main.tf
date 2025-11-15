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

# SES Module (optional - for custom email templates)
module "ses" {
  count  = var.create_ses_resources && var.ses_from_email != "" ? 1 : 0
  source = "./modules/ses"

  from_email_address       = var.ses_from_email
  create_configuration_set = var.ses_configuration_set_name != ""
  configuration_set_name   = var.ses_configuration_set_name != "" ? var.ses_configuration_set_name : "${var.environment}-cognito-email-config"
  create_event_destination = false

  tags = {
    Service = "Email"
  }
}

# Cognito Module
module "cognito" {
  source = "./modules/cognito"

  user_pool_name        = var.user_pool_name != "" ? var.user_pool_name : "${var.environment == "prod" ? "mostage-studio-users-prod" : "mostage-studio-users-dev"}"
  user_pool_client_name = var.user_pool_client_name != "" ? var.user_pool_client_name : "${var.environment == "prod" ? "mostage-studio-web-client-prod" : "mostage-studio-web-client-dev"}"

  # SES configuration (optional)
  ses_from_email        = var.ses_from_email
  ses_reply_to_email    = var.ses_reply_to_email
  ses_configuration_set = var.ses_configuration_set_name != "" ? (var.create_ses_resources ? module.ses[0].configuration_set_name : var.ses_configuration_set_name) : ""

  tags = {
    Service = "Authentication"
  }
}
