import { APIGatewayProxyEvent } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

/**
 * Cognito JWT Token Payload
 */
export interface CognitoTokenPayload {
  sub: string; // User ID (userId)
  "cognito:username": string; // Username
  email?: string;
  email_verified?: boolean;
  name?: string;
  [key: string]: any;
}

/**
 * Extracted user info from JWT token
 */
export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
  name?: string;
}

/**
 * Get JWT token from Authorization header
 */
export function getTokenFromHeader(event: APIGatewayProxyEvent): string | null {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    return null;
  }

  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Get JWKS URL for Cognito User Pool
 */
function getJWKSUrl(): string {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const region = process.env.COGNITO_REGION || "eu-central-1";

  if (!userPoolId) {
    throw new Error("COGNITO_USER_POOL_ID environment variable is not set");
  }

  // Extract region from user pool ID if it contains region
  // Format: eu-central-1_XXXXXXXXX
  const poolRegion = userPoolId.split("_")[0] || region;

  return `https://cognito-idp.${poolRegion}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<CognitoTokenPayload> {
  const jwksUrl = getJWKSUrl();
  const client = jwksRsa({
    jwksUri: jwksUrl,
    cache: true,
    cacheMaxAge: 86400000, // 24 hours
  });

  function getKey(
    header: jwt.JwtHeader,
    callback: jwt.SigningKeyCallback
  ): void {
    client.getSigningKey(
      header.kid,
      (err: Error | null, key: jwksRsa.SigningKey | undefined) => {
        if (err) {
          return callback(err);
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
      }
    );
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          reject(new Error(`Token verification failed: ${err.message}`));
          return;
        }
        resolve(decoded as CognitoTokenPayload);
      }
    );
  });
}

/**
 * Extract user info from API Gateway event
 * Returns null if not authenticated
 */
export async function extractUserFromEvent(
  event: APIGatewayProxyEvent
): Promise<AuthUser | null> {
  try {
    const token = getTokenFromHeader(event);
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    return {
      userId: payload.sub,
      username: payload["cognito:username"],
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error("Error extracting user from event:", error);
    return null;
  }
}

/**
 * Check if username in URL matches authenticated user
 */
export async function isAuthorized(
  event: APIGatewayProxyEvent,
  urlUsername: string
): Promise<boolean> {
  const user = await extractUserFromEvent(event);
  if (!user) {
    return false;
  }

  return user.username === urlUsername;
}
