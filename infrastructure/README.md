# Infrastructure

Infrastructure as Code for Mostage Studio using Terraform.

## Quick Start

```bash
# Initialize for development
terraform init -backend-config=config/backend-dev.hcl

# Plan changes
terraform plan -var="environment=dev"

# Apply changes
terraform apply -var="environment=dev"
```

> **For complete documentation, see [Infrastructure Documentation](../../docs/infrastructure.md)**
