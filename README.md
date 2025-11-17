# Mostage Studio

![CI Frontend](https://github.com/mostage-app/studio/actions/workflows/ci-frontend.yml/badge.svg)
![CI Frontend](https://github.com/mostage-app/studio/actions/workflows/ci-frontend.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![AWS CDK](https://img.shields.io/badge/AWS%20CDK-2.100.0-orange?logo=aws)

Mostage Studio is a simple online tool for making presentations with Markdown and HTML. Some features include AI Creation, Live Polling System, and Audience Q&A.

### Powered by [Mostage JS](https://github.com/mostage-app/mostage)

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

### Backend

- **Language**: TypeScript 5
- **Runtime**: Node.js 20 (AWS Lambda)
- **Architecture**: Serverless functions
- **Deployment**: AWS Lambda via AWS CDK

### Infrastructure

- **CI/CD**: GitHub Actions
- **Cloud Provider**: [AWS](https://aws.amazon.com/)
- **Infrastructure as Code**: [AWS CDK 2](https://aws.amazon.com/cdk/)
- **Services**:
  - [AWS Cognito](https://aws.amazon.com/cognito/) (User Pool & User Pool Client) - Authentication
  - [AWS API Gateway](https://aws.amazon.com/api-gateway/) - REST API for backend services
  - [AWS Lambda](https://aws.amazon.com/lambda/) - Serverless functions
  - [AWS SES](https://aws.amazon.com/ses/) - Email delivery (optional)
  - [AWS Resource Groups](https://aws.amazon.com/resource-groups/) - Resource organization and management
  - [AWS CloudWatch Alarms](https://aws.amazon.com/cloudwatch/) - Monitoring and alerting (coming soon)
- **Environments**: Development & Production (separate stacks)
- **Naming Convention**: `mostage-studio-<service>-<resource>-<environment>`

## Quick Start

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Infrastructure Setup (AWS CDK)

```bash
cd infrastructure
npm install

# Bootstrap CDK (first time only)
aws configure
aws sts get-caller-identity --query Account --output text
cdk bootstrap aws://ACCOUNT-ID/REGION

# Configure environment variables (first time only)
cp .env.local.example .env.dev.local
# Edit .env.dev.local and add your Unsplash Access Key

# Preview changes for development
npm run diff:dev

# Deploy development stack
npm run deploy:dev

# After first deployment, configure .env in frontend with stack outputs
# See docs/infrastructure.md#first-time-deployment for details
```

See [Infrastructure Setup](docs/infrastructure.md) for detailed instructions.

## Documentation

### Getting Started

- [Project Structure](docs/structure.md) - Architecture and development guide
- [Authentication Setup](docs/authentication.md) - AWS Cognito authentication setup guide
- [Infrastructure Setup](docs/infrastructure.md) - AWS CDK infrastructure setup and deployment

### Development

- [CI/CD](docs/ci-cd.md) - Continuous Integration and Deployment setup
- [State Management](docs/state-management.md) - State management patterns and architecture
- [Analytics](docs/analytics.md) - Analytics implementation and tracking
- [Onboarding Tour](docs/onboarding-tour.md) - User onboarding tour system
- [Toolbar](docs/toolbar.md) - Markdown toolbar implementation

### Reference

- [FAQ](docs/faq.md) - Frequently asked questions and explanations

## Contributing

This project is part of the Mostage ecosystem. For contributions, please refer to the main [Mostage repository](https://github.com/mostage-app/mostage).

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0-or-later) with additional attribution requirements.

See the [LICENSE](LICENSE) file for the complete license text.
