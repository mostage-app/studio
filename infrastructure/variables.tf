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
  default     = "mostage-studio-users"
}

variable "user_pool_client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
  default     = "mostage-studio-web-client"
}

