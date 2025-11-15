.PHONY: help init-dev init-prod switch-dev switch-prod plan-dev plan-prod apply-dev apply-prod destroy-dev destroy-prod output validate fmt fmt-check

# Default target
help:
	@echo "Terraform Makefile for Mostage Studio Infrastructure"
	@echo ""
	@echo "Available targets:"
	@echo "  make init-dev       - Initialize Terraform for development (first time)"
	@echo "  make init-prod      - Initialize Terraform for production (first time)"
	@echo "  make switch-dev     - Switch to development environment"
	@echo "  make switch-prod    - Switch to production environment"
	@echo "  make plan-dev       - Preview changes for development"
	@echo "  make plan-prod      - Preview changes for production"
	@echo "  make apply-dev      - Apply changes for development"
	@echo "  make apply-prod     - Apply changes for production"
	@echo "  make destroy-dev    - Destroy all resources for development (⚠️ dangerous)"
	@echo "  make destroy-prod   - Destroy all resources for production (⚠️ dangerous)"
	@echo "  make output         - Show Terraform outputs"
	@echo "  make validate       - Validate Terraform configuration"
	@echo "  make fmt            - Format Terraform files"
	@echo "  make fmt-check      - Check Terraform formatting"
	@echo ""

# Initialize Terraform
init-dev:
	@echo "🚀 Initializing Terraform for development..."
	@echo "Command: terraform init -backend-config=config/backend-dev.hcl"
	@echo ""
	terraform init -backend-config=config/backend-dev.hcl

init-prod:
	@echo "🚀 Initializing Terraform for production..."
	@echo "Command: terraform init -backend-config=config/backend-prod.hcl"
	@echo ""
	terraform init -backend-config=config/backend-prod.hcl

# Switch between environments (reconfigure)
switch-dev:
	@echo "🔄 Switching to development environment..."
	@echo "Command: terraform init -reconfigure -backend-config=config/backend-dev.hcl"
	@echo ""
	terraform init -reconfigure -backend-config=config/backend-dev.hcl

switch-prod:
	@echo "🔄 Switching to production environment..."
	@echo "Command: terraform init -reconfigure -backend-config=config/backend-prod.hcl"
	@echo ""
	terraform init -reconfigure -backend-config=config/backend-prod.hcl

# Plan changes
plan-dev:
	@echo "📋 Planning changes for development..."
	@echo "Command: terraform plan -var=\"environment=dev\""
	@echo ""
	terraform plan -var="environment=dev"

plan-prod:
	@echo "📋 Planning changes for production..."
	@echo "Command: terraform plan -var=\"environment=prod\""
	@echo ""
	terraform plan -var="environment=prod"

# Apply changes
apply-dev:
	@echo "✅ Applying changes for development..."
	@echo "Command: terraform apply -var=\"environment=dev\""
	@echo ""
	terraform apply -var="environment=dev"

apply-prod:
	@echo "✅ Applying changes for production..."
	@echo "Command: terraform apply -var=\"environment=prod\""
	@echo ""
	terraform apply -var="environment=prod"

# Destroy resources (⚠️ dangerous)
destroy-dev:
	@echo "⚠️  WARNING: This will destroy all development resources!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo ""
	@echo "Command: terraform destroy -var=\"environment=dev\""
	@echo ""
	terraform destroy -var="environment=dev"

destroy-prod:
	@echo "⚠️  WARNING: This will destroy all production resources!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo ""
	@echo "Command: terraform destroy -var=\"environment=prod\""
	@echo ""
	terraform destroy -var="environment=prod"

# Show outputs
output:
	@echo "📤 Terraform outputs:"
	@echo "Command: terraform output"
	@echo ""
	terraform output

# Validate configuration
validate:
	@echo "✔️  Validating Terraform configuration..."
	@echo "Command: terraform validate"
	@echo ""
	terraform validate

# Format Terraform files
fmt:
	@echo "🎨 Formatting Terraform files..."
	@echo "Command: terraform fmt -recursive"
	@echo ""
	terraform fmt -recursive

# Check formatting
fmt-check:
	@echo "🔍 Checking Terraform formatting..."
	@echo "Command: terraform fmt -check -recursive"
	@echo ""
	terraform fmt -check -recursive

