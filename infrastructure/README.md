# Infrastructure

Infrastructure as Code for Mostage Studio using Terraform.

## Quick Start

### Using Makefile (Recommended)

```bash
# Initialize for development (first time)
make init-dev

# Plan changes
make plan-dev

# Apply changes
make apply-dev

# Switch to production
make switch-prod
make plan-prod
make apply-prod
```

### Using Terraform Directly

```bash
# Initialize for development
terraform init -backend-config=config/backend-dev.hcl

# Plan changes
terraform plan -var="environment=dev"

# Apply changes
terraform apply -var="environment=dev"
```

## Available Make Commands

Run `make help` to see all available commands:

- `make init-dev` / `make init-prod` - Initialize Terraform (first time)
- `make switch-dev` / `make switch-prod` - Switch between environments
- `make plan-dev` / `make plan-prod` - Preview changes
- `make apply-dev` / `make apply-prod` - Apply changes
- `make destroy-dev` / `make destroy-prod` - Destroy resources (⚠️ dangerous)
- `make output` - Show outputs
- `make validate` - Validate configuration
- `make fmt` - Format files
- `make fmt-check` - Check formatting

> **For complete documentation, see [Infrastructure Documentation](../../docs/infrastructure.md)**
