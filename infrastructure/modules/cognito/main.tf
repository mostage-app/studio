# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  # Sign-in options
  # Users can sign in with email or username
  alias_attributes         = ["email", "preferred_username"]
  auto_verified_attributes = ["email"]

  # Self-registration
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Email verification with HTML template
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Verify your Mostage Studio account"
    email_message        = file("${path.module}/templates/verification.html")
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

  # Email configuration
  # Use SES if from_email is provided, otherwise use Cognito default
  dynamic "email_configuration" {
    for_each = var.ses_from_email != "" ? [1] : []
    content {
      email_sending_account  = "DEVELOPER"
      from_email_address     = var.ses_from_email
      reply_to_email_address = var.ses_reply_to_email != "" ? var.ses_reply_to_email : null
      configuration_set      = var.ses_configuration_set != "" ? var.ses_configuration_set : null
      source_arn             = null
    }
  }

  dynamic "email_configuration" {
    for_each = var.ses_from_email == "" ? [1] : []
    content {
      email_sending_account = "COGNITO_DEFAULT"
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
    # Ignore schema changes as they cannot be modified after creation
    ignore_changes = [schema]
  }

  tags = var.tags
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
  # LEGACY: Shows detailed error messages (including AliasExistsException)
  # ENABLED: Hides user existence errors for security (but also hides email duplicate errors)
  prevent_user_existence_errors = "LEGACY"

  # Token validity
  access_token_validity  = 60 # 1 hour
  id_token_validity      = 60 # 1 hour
  refresh_token_validity = 30 # 30 days

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

