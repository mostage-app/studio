variable "from_email_address" {
  description = "Email address to verify in SES and use as sender"
  type        = string
}

variable "create_configuration_set" {
  description = "Whether to create a SES configuration set"
  type        = bool
  default     = false
}

variable "configuration_set_name" {
  description = "Name of the SES configuration set"
  type        = string
  default     = ""
}

variable "create_event_destination" {
  description = "Whether to create an event destination for CloudWatch"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

