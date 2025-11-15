# SES Email Identity (Verified Email)
resource "aws_ses_email_identity" "main" {
  email = var.from_email_address
}

# Optional: SES Configuration Set for email tracking
resource "aws_ses_configuration_set" "main" {
  count = var.create_configuration_set ? 1 : 0
  name  = var.configuration_set_name
}

# Optional: Event Destination for Configuration Set
resource "aws_ses_event_destination" "main" {
  count                  = var.create_configuration_set && var.create_event_destination ? 1 : 0
  name                   = "${var.configuration_set_name}-events"
  configuration_set_name = aws_ses_configuration_set.main[0].name
  enabled                = true
  matching_types         = ["send", "reject", "bounce", "complaint", "delivery", "open", "click", "renderingFailure"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "MessageTag"
    value_source   = "messageTag"
  }
}

