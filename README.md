# Mostage Studio

A presentation editor powered by [Mostage](https://github.com/mostage-app/mostage)

Mostage Studio is a web-based presentation editor that allows you to create and edit presentations using Markdown.

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

- **Infrastructure**: AWS CDK 2.150.0
- **Language**: TypeScript 5
- **Services**: AWS Cognito (User Pool & User Pool Client)

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Infrastructure (AWS CDK)

```bash
cd infrastructure
npm install
npm run cdk:deploy
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

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Infrastructure

- `npm run build` - Compile TypeScript
- `npm run cdk:synth` - Synthesize CloudFormation template
- `npm run cdk:deploy` - Deploy stack to AWS
- `npm run cdk:diff` - Compare deployed stack with current state
- `npm run cdk:destroy` - Destroy the stack (⚠️ removes all resources)

## Contributing

This project is part of the Mostage ecosystem. For contributions, please refer to the main [Mostage repository](https://github.com/mostage-app/mostage).

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0-or-later) with additional attribution requirements.

See the [LICENSE](LICENSE) file for the complete license text.
