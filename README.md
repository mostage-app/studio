# Mostage Studio

![CI Frontend](https://github.com/mostage-app/studio/actions/workflows/ci-frontend.yml/badge.svg)
![CI Infrastructure](https://github.com/mostage-app/studio/actions/workflows/ci-infrastructure.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Terraform](https://img.shields.io/badge/Terraform-≥1.5.0-purple?logo=terraform)

Mostage Studio is a simple online tool for making presentations with Markdown and HTML. Some features include AI Creation, Live Polling System, and Audience Q&A.

Powered by [Mostage JS](https://github.com/mostage-app/mostage), an open-source presentation framework.

## Mostage JS

A presentation framework based on Markdown and HTML. Available as NPM package, CLI and Web Editor.

- [mostage.app/develop](https://mostage.app/develop.html)
- [github.com/mostage-app/mostage](https://github.com/mostage-app/mostage)

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Authentication**: AWS Cognito (via AWS SDK)
- **Analytics**: Google Analytics 4
- **Presentation Engine**: Mostage
- **Markdown Editor**: Mostage-editor
- **Onboarding Tour**: Mostage-intro

### Infrastructure

- **Infrastructure as Code**: Terraform 1.5.0+
- **Language**: HCL (HashiCorp Configuration Language)
- **Scripting**: Bash scripts
- **CI/CD**: GitHub Actions
- **Cloud Provider**: AWS
- **Services**:
  - AWS Cognito (User Pool & User Pool Client) - Authentication
  - AWS S3 - Terraform state storage
  - AWS DynamoDB - Terraform state locking
- **State Management**: Remote state (S3 backend with DynamoDB locking)
- **Environments**: Development & Production (separate resources)

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Infrastructure (Terraform)

```bash
cd infrastructure

# Initialize for development
terraform init -backend-config=config/backend-dev.hcl

# Plan changes
terraform plan -var="environment=dev"

# Apply changes
terraform apply -var="environment=dev"
```

See [Infrastructure Setup](docs/infrastructure.md) for detailed instructions.

## Documentation

### Getting Started

- [Project Structure](docs/structure.md) - Architecture and development guide
- [Authentication Setup](docs/authentication.md) - AWS Cognito authentication setup guide
- [Infrastructure Setup](docs/infrastructure.md) - AWS Terraform infrastructure setup and deployment

### Development

- [CI/CD](docs/ci-cd.md) - Continuous Integration and Deployment setup
- [State Management](docs/state-management.md) - State management patterns and architecture
- [Analytics](docs/analytics.md) - Analytics implementation and tracking
- [Onboarding Tour](docs/onboarding-tour.md) - User onboarding tour system
- [Toolbar](docs/toolbar.md) - Markdown toolbar implementation

### Reference

- [FAQ](docs/faq.md) - Frequently asked questions and explanations

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Infrastructure

- `terraform init -backend-config=config/backend-dev.hcl` - Initialize Terraform for development
- `terraform init -backend-config=config/backend-prod.hcl` - Initialize Terraform for production
- `terraform plan -var="environment=dev"` - Preview changes for development
- `terraform plan -var="environment=prod"` - Preview changes for production
- `terraform apply -var="environment=dev"` - Deploy infrastructure for development
- `terraform apply -var="environment=prod"` - Deploy infrastructure for production
- `terraform destroy -var="environment=dev"` - Destroy infrastructure for development (⚠️ removes all resources)
- `terraform destroy -var="environment=prod"` - Destroy infrastructure for production (⚠️ removes all resources)
- `terraform validate` - Validate configuration
- `terraform fmt -recursive` - Format configuration files
- `terraform fmt -check -recursive` - Check formatting
- `terraform output` - Show outputs

See [Infrastructure Setup](docs/infrastructure.md) for detailed instructions.

## Contributing

This project is part of the Mostage ecosystem. For contributions, please refer to the main [Mostage repository](https://github.com/mostage-app/mostage).

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0-or-later) with additional attribution requirements.

See the [LICENSE](LICENSE) file for the complete license text.
