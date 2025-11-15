output "email_identity_arn" {
  description = "ARN of the SES email identity"
  value       = aws_ses_email_identity.main.arn
}

output "email_identity_email" {
  description = "Email address of the SES email identity"
  value       = aws_ses_email_identity.main.email
}

output "configuration_set_name" {
  description = "Name of the SES configuration set (if created)"
  value       = var.create_configuration_set ? aws_ses_configuration_set.main[0].name : null
}

