variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
}

variable "user_pool_client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "ses_from_email" {
  description = "Verified SES email address to send emails from (optional, uses Cognito default if not provided)"
  type        = string
  default     = ""
}

variable "ses_reply_to_email" {
  description = "Reply-to email address for SES emails (optional)"
  type        = string
  default     = ""
}

variable "ses_configuration_set" {
  description = "SES configuration set name (optional)"
  type        = string
  default     = ""
}

