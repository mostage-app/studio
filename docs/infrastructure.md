# Infrastructure

Infrastructure as Code for Mostage Studio using AWS CDK.

The infrastructure code is located in the `infrastructure/` directory and is organized using **service-based architecture** for scalability and maintainability.

## Prerequisites

1. **Node.js** (>= 18.x) - [Installation Guide](https://nodejs.org/)
2. **AWS CLI** - [Installation Guide](https://aws.amazon.com/cli/)
3. **AWS CDK CLI** - Install via npm: `npm install -g aws-cdk`
4. **AWS Account** with appropriate permissions

## Setup

1. **Install dependencies**:

   ```bash
   cd infrastructure
   npm install
   ```

2. **Configure AWS credentials**:

   ```bash
   aws configure
   ```

   Enter the following information:

   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `eu-central-1`)
   - Default output format: `json`

3. **Bootstrap CDK** (First time only):

   ```bash
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

   Replace `ACCOUNT-ID` with your AWS account ID and `REGION` with your region (e.g., `eu-central-1`).

## Deployment

### First Time Deployment

After deploying the infrastructure for the first time, you need to configure the frontend with the stack outputs.

#### Step 1: Deploy Infrastructure

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Preview changes**:

   ```bash
   npm run diff:dev
   ```

3. **Deploy**:

   ```bash
   npm run deploy:dev
   ```

#### Step 2: Get Stack Outputs

After successful deployment, get the stack outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name StudioStack-dev \
  --query 'Stacks[0].Outputs' \
  --output table
```

You will see outputs like:

```text
--------------------------------------------------------------------
|                            Outputs                                |
+-------------------+----------------------------------------------+
|  UserPoolId       |  eu-central-1_xxxxxxxxx                     |
|  UserPoolClientId |  xxxxxxxxxxxxxxxxxxxxxx                     |
|  UserPoolRegion   |  eu-central-1                                |
+-------------------+----------------------------------------------+
```

#### Step 3: Configure Frontend

**For Local Development:**

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-central-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=eu-central-1
NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/dev
```

Copy the values from the stack outputs:

- `UserPoolId` → `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `UserPoolClientId` → `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `UserPoolRegion` → `NEXT_PUBLIC_AWS_REGION`
- `ApiUrl` → `NEXT_PUBLIC_API_URL`

**For Production:**

Go to your GitHub repository → **Settings → Secrets and variables → Actions** and add:

- `NEXT_PUBLIC_COGNITO_USER_POOL_ID` → Value from `UserPoolId` output
- `NEXT_PUBLIC_COGNITO_CLIENT_ID` → Value from `UserPoolClientId` output
- `NEXT_PUBLIC_AWS_REGION` → Value from `UserPoolRegion` output (e.g., `eu-central-1`)
- `NEXT_PUBLIC_API_URL` → Value from `ApiUrl` output

### Development Environment

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Preview changes**:

   ```bash
   npm run diff:dev
   ```

3. **Deploy**:

   ```bash
   npm run deploy:dev
   ```

4. **Get outputs** (if needed):

   ```bash
   aws cloudformation describe-stacks \
     --stack-name StudioStack-dev \
     --query 'Stacks[0].Outputs' \
     --output table
   ```

### Production Environment

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Preview changes**:

   ```bash
   npm run diff:prod
   ```

3. **Deploy**:

   ```bash
   npm run deploy:prod
   ```

4. **Get outputs**:

   ```bash
   aws cloudformation describe-stacks \
     --stack-name StudioStack-prod \
     --query 'Stacks[0].Outputs' \
     --output table
   ```

5. **Update GitHub Secrets** (if outputs changed):

   Go to **Settings → Secrets and variables → Actions** and update:

   - `NEXT_PUBLIC_COGNITO_USER_POOL_ID` → New `UserPoolId` from stack outputs
   - `NEXT_PUBLIC_COGNITO_CLIENT_ID` → New `UserPoolClientId` from stack outputs
   - `NEXT_PUBLIC_AWS_REGION` → AWS region (e.g., `eu-central-1`)

   **Note**: If this is your first production deployment, see the "First Time Deployment" section above.

## Available Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm run deploy:dev` - Deploy development stack
- `npm run deploy:prod` - Deploy production stack
- `npm run diff:dev` - Show differences for development
- `npm run diff:prod` - Show differences for production
- `npm run synth:dev` - Synthesize CloudFormation template for development
- `npm run synth:prod` - Synthesize CloudFormation template for production
- `npm run destroy:dev` - Destroy development stack (⚠️ dangerous)
- `npm run destroy:prod` - Destroy production stack (⚠️ dangerous)

**Note**: To use a specific AWS profile, set the `AWS_PROFILE` environment variable or use the `--profile` flag with `npm run cdk`.

## Services

### Cognito Service (`lib/services/cognito/`)

The Cognito service provides authentication services:

- **Cognito User Pool**: Manages user authentication
- **Cognito User Pool Client**: Web application client for frontend

#### Features

- Email and username sign-in
- Self-registration enabled
- Email verification
- Password policy (min 6 chars, uppercase, lowercase, digits)
- Account recovery via email
- Token validity configuration

#### Environment Resources

Each environment (dev/prod) has its own separate resources:

- **Cognito User Pool**:
  - Development: `mostage-studio-users-dev`
  - Production: `mostage-studio-users-prod`
- **Cognito User Pool Client**:
  - Development: `mostage-studio-web-client-dev`
  - Production: `mostage-studio-web-client-prod`

**Important**: Users in development and production are completely isolated. Changes in one environment do not affect the other.

### API Gateway Service (`lib/services/api/`)

The API Gateway service provides a REST API for backend Lambda functions:

- **API Gateway**: REST API endpoint for Lambda functions
- **CORS Configuration**: Environment-specific CORS configuration
- **Rate Limiting**: Automatic rate limiting for production
- **Lambda Integration**: Automatic integration with Lambda functions

#### API Endpoints

- **`GET /unsplash/search`**: Search for Unsplash images
- **`POST /unsplash/download`**: Track Unsplash image downloads

#### Security Configuration

**Development:**

- CORS: Allows all origins (`*`) for local development
- Rate Limit: 1000 requests/second, 2000 burst limit

**Production:**

- CORS: Restricted to specified domains only (configured via `ALLOWED_ORIGINS`)
- Rate Limit: 100 requests/second, 200 burst limit
- **⚠️ Important**: You must set `ALLOWED_ORIGINS` in `.env.prod.local` or the API will reject all CORS requests

#### Configuration

The API Gateway is automatically created when deploying the stack. To add new endpoints:

1. Create a new Lambda construct in `lib/services/api/your-service/`
2. Add the Lambda function to the API Gateway in your construct
3. Deploy the stack

#### API Gateway Outputs

After deployment, the API Gateway URL is available as a stack output:

- `ApiUrl`: API Gateway base URL (e.g., `https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/dev`)

Add this URL to your frontend `.env.local` as `NEXT_PUBLIC_API_URL`.

### Unsplash Lambda Service (`lib/services/api/unsplash/`)

The Unsplash Lambda service provides image search functionality. The Lambda handlers are located in `backend/src/lambda/unsplash/`:

- **Search Function**: Lambda function for searching Unsplash images (`backend/src/lambda/unsplash/search.ts`)
- **Download Function**: Lambda function for tracking image downloads (`backend/src/lambda/unsplash/download.ts`)

#### Backend Structure

Lambda functions are organized in the `backend/` directory:

```text
backend/
  src/
    lambda/
      unsplash/
        search.ts      # Search handler
        download.ts    # Download tracking handler
```

This structure allows for:

- Clear separation between infrastructure (CDK) and business logic (Lambda handlers)
- Easy addition of new Lambda functions for other services
- Standard monorepo structure

#### Unsplash Configuration

The Unsplash Access Key is configured separately for development and production environments using `.env` files.

**Security Note**: For production, you **must** configure `ALLOWED_ORIGINS` to restrict CORS to your frontend domain(s). The API Gateway will reject requests from unauthorized origins.

**For Development:**

1. Copy the example file:

   ```bash
   cd infrastructure
   cp .env.local.example .env.dev.local
   ```

2. Edit `.env.dev.local` and add your development Unsplash Access Key:

   ```env
   UNSPLASH_ACCESS_KEY=your_dev_access_key_here
   ```

3. Deploy:

   ```bash
   npm run deploy:dev
   ```

**For Production:**

1. Copy the example file:

   ```bash
   cd infrastructure
   cp .env.prod.local.example .env.prod.local
   ```

2. Edit `.env.prod.local` and configure:

   ```env
   # Unsplash API Access Key
   UNSPLASH_ACCESS_KEY=your_prod_access_key_here

   # IMPORTANT: Restrict CORS to your frontend domain(s)
   # Only requests from these domains will be allowed
   # Example: https://studio.mostage.app,https://www.mostage.app
   ALLOWED_ORIGINS=https://studio.mostage.app
   ```

   **⚠️ Security Warning**: If `ALLOWED_ORIGINS` is not set or empty, the API Gateway will reject all CORS requests in production. This is intentional for security.

3. Deploy:

   ```bash
   npm run deploy:prod
   ```

**Important:**

- `.env.dev.local` and `.env.prod.local` files are ignored by git (for security)
- Each environment can have a different Unsplash Access Key
- The API key is stored securely in Lambda environment variables after deployment
- **Production Security**:
  - CORS is restricted to specified domains only
  - Rate limiting: 100 requests/second, 200 burst limit
  - You can also use environment variables directly: `export UNSPLASH_ACCESS_KEY=your_key && npm run deploy:dev`

### SES Service (`lib/services/ses/`)

The SES service provides email infrastructure for Cognito (optional):

- **SES Email Identity**: Verified email address for sending emails
- **SES Configuration Set**: Optional configuration set for email tracking and analytics

#### SES Setup

To use SES with Cognito:

1. **Verify Email Address** (for development):

   - Update `lib/stacks/studio-stack.ts` to set `createResources: true` and `fromEmail`
   - Deploy the stack
   - Verify the email address in AWS SES Console

2. **Verify Domain** (for production - recommended):

   - Verify your domain in AWS SES Console
   - Use verified domain email addresses (e.g., `noreply@yourdomain.com`)

3. **Configure Cognito to use SES**:
   - Update `lib/stacks/studio-stack.ts` to set `sesFromEmail` and `sesReplyToEmail`
   - Redeploy the stack

**Important**:

- In AWS SES sandbox mode, you can only send emails to verified addresses
- To send to any email address, request production access in SES Console
- SES email identity verification is required before Cognito can send emails

## Adding New Services

To add a new AWS service (e.g., Lambda, API Gateway, S3):

1. Create a new service directory: `lib/services/your-service/`

2. Create `index.ts` with your service:

   ```typescript
   import { Construct } from "constructs";
   import * as cdk from "aws-cdk-lib";

   export interface YourServiceProps {
     // Define props
   }

   export class YourService extends Construct {
     constructor(scope: Construct, id: string, props: YourServiceProps) {
       super(scope, id);
       // Create resources
     }
   }
   ```

3. Import and use it in `lib/stacks/base.ts`:

   ```typescript
   import { YourService } from "../services/your-service";

   // In BaseStudioStack constructor:
   const yourService = new YourService(this, "YourService", {
     // Pass props
   });
   ```

4. If the service needs environment-specific configuration, add it to `StackConfig` interface and update both `dev.ts` and `prod.ts`.

5. Add outputs if needed:

   ```typescript
   new cdk.CfnOutput(this, "YourServiceId", {
     value: yourService.id,
     description: "Your Service ID",
     exportName: `${environment}-your-service-id`,
   });
   ```

## Architecture

```text
┌─────────────────┐
│   Frontend      │
│  (Next.js App)  │
└────────┬────────┘
         │
         │ AWS SDK
         │
┌────────▼────────┐
│  Cognito User   │
│     Pool        │
└─────────────────┘
```

The frontend communicates directly with AWS Cognito using the AWS SDK. No additional API server is required for authentication operations.

## Stack Outputs

Stack outputs are automatically exported and can be used in other stacks or applications. Outputs include:

- `UserPoolId` - Cognito User Pool ID
- `UserPoolArn` - Cognito User Pool ARN
- `UserPoolClientId` - Cognito User Pool Client ID
- `UserPoolRegion` - AWS Region for Cognito User Pool
- `ApiUrl` - API Gateway base URL

## Security Considerations

- **Never commit credentials** to git
- **Use IAM roles** instead of access keys when possible
- **Rotate credentials** periodically
- **Use least-privilege IAM policies**
- **Enable MFA** for production accounts
- **Review CloudFormation changes** before deploying

## Related Documentation

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
