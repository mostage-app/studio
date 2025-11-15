terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "mostage-studio-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
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

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  # Sign-in options
  alias_attributes         = ["email", "preferred_username"]
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Self-registration
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Email verification
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject         = "Your verification code"
    email_message         = "Your verification code is {####}"
  }

  # Password policy
  password_policy {
    minimum_length                   = 6
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Schema attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "given_name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  schema {
    name                = "family_name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  # Deletion protection
  deletion_protection = "INACTIVE"

  lifecycle {
    prevent_destroy = false
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.main.id

  # Client configuration
  generate_secret = false # Required for public clients (web apps)

  # Authentication flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Token validity
  access_token_validity  = 60  # 1 hour
  id_token_validity      = 60  # 1 hour
  refresh_token_validity = 30  # 30 days

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

