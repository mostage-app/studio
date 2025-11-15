variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
  default     = "" # Will be set based on environment
}

variable "user_pool_client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
  default     = "" # Will be set based on environment
}

variable "ses_from_email" {
  description = "SES verified email address to send emails from (optional, uses Cognito default if not provided)"
  type        = string
  default     = ""
}

variable "ses_reply_to_email" {
  description = "Reply-to email address for SES emails (optional)"
  type        = string
  default     = ""
}

variable "ses_configuration_set_name" {
  description = "SES configuration set name (optional)"
  type        = string
  default     = ""
}

variable "create_ses_resources" {
  description = "Whether to create SES resources (email identity, configuration set)"
  type        = bool
  default     = false
}

