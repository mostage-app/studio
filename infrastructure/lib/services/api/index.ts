import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export interface ApiGatewayProps {
  environment: "dev" | "prod";
  description?: string;
  corsOptions?: {
    allowOrigins: string[];
    allowMethods?: string[];
    allowHeaders?: string[];
  };
  rateLimit?: {
    requestsPerSecond?: number;
    burstLimit?: number;
  };
}

/**
 * API Gateway service construct
 * Provides a REST API Gateway for Lambda functions
 */
export class ApiGatewayConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const { environment, description, corsOptions, rateLimit } = props;

    // Default CORS options
    const defaultCorsOptions: apigateway.CorsOptions = {
      allowOrigins: corsOptions?.allowOrigins || ["*"],
      allowMethods: corsOptions?.allowMethods || [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
      ],
      allowHeaders: corsOptions?.allowHeaders || [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
      ],
    };

    // Create REST API
    this.api = new apigateway.RestApi(this, "Api", {
      restApiName: `mostage-studio-api-${environment}`,
      description:
        description || `API Gateway for Mostage Studio - ${environment}`,
      defaultCorsPreflightOptions: defaultCorsOptions,
      deployOptions: {
        stageName: environment,
        tracingEnabled: environment === "prod",
        metricsEnabled: true,
        // Rate limiting for production
        throttlingRateLimit:
          rateLimit?.requestsPerSecond ?? (environment === "prod" ? 100 : 1000),
        throttlingBurstLimit:
          rateLimit?.burstLimit ?? (environment === "prod" ? 200 : 2000),
      },
    });

    // API URL output
    this.apiUrl = this.api.url;
  }

  /**
   * Add a resource to the API Gateway
   */
  public addResource(path: string): apigateway.Resource {
    return this.api.root.addResource(path);
  }
}
