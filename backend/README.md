# Backend

Backend Lambda functions for Mostage Studio.

## Structure

```text
backend/
  src/
    lambda/
      unsplash/
        search.ts      # Unsplash image search handler
        download.ts    # Unsplash download tracking handler
```

## Lambda Functions

### Unsplash Service

- **`search.ts`**: Handles Unsplash image search requests

  - Endpoint: `GET /unsplash/search`
  - Query parameters: `query`, `page`, `per_page`

- **`download.ts`**: Tracks Unsplash image downloads
  - Endpoint: `POST /unsplash/download`
  - Body: `{ downloadLocation: string }`

## Development

Lambda functions are deployed via AWS CDK from the `infrastructure/` directory.

### Adding a New Lambda Function

1. Create a new handler in `src/lambda/your-service/`:

   ```typescript
   // src/lambda/your-service/handler.ts
   import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

   export const handler = async (
     event: APIGatewayProxyEvent
   ): Promise<APIGatewayProxyResult> => {
     // Your handler logic
   };
   ```

2. Create a CDK construct in `infrastructure/lib/services/api/your-service/`:

   ```typescript
   // infrastructure/lib/services/api/your-service/index.ts
   import * as lambda from "aws-cdk-lib/aws-lambda";
   import * as path from "path";

   const backendPath = path.resolve(
     __dirname,
     "../../../../..",
     "backend",
     "src",
     "lambda",
     "your-service"
   );

   const function = new lambda.Function(this, "YourFunction", {
     runtime: lambda.Runtime.NODEJS_20_X,
     handler: "handler.handler",
     code: lambda.Code.fromAsset(backendPath),
     // ... other config
   });
   ```

3. Add the function to API Gateway in your construct
4. Deploy: `cd infrastructure && npm run deploy:dev`

## Dependencies

Install dependencies:

```bash
npm install
```

## TypeScript

The project uses TypeScript. Build with:

```bash
npm run build
```

Watch mode:

```bash
npm run watch
```

## CI/CD

The backend has automated CI checks via GitHub Actions. The CI workflow runs on:

- Push to `main` or `dev` branches when files in `backend/` change
- Pull requests to `main` or `dev` branches when files in `backend/` change

**CI Jobs**:

- **Build**: Compiles TypeScript to JavaScript
- **Type Check**: Validates TypeScript types

To run CI checks locally:

```bash
npm run build
npx tsc --noEmit
```

See [CI/CD Documentation](../docs/ci-cd.md) for more details.
