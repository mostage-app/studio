import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  UpdateUserAttributesCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import type {
  RegisterCredentials,
  LoginCredentials,
  VerifyCredentials,
  ResendCodeCredentials,
  ForgotPasswordCredentials,
  ConfirmForgotPasswordCredentials,
  User,
} from "../types/auth.types";
import { AuthService } from "./authService";

// Get API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get configuration from environment variables
const getCognitoConfig = () => {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "eu-central-1";

  if (!userPoolId || !clientId) {
    throw new Error(
      "Missing Cognito configuration. Please set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID environment variables."
    );
  }

  return { userPoolId, clientId, region };
};

// Create Cognito client
const createClient = (region: string): CognitoIdentityProviderClient => {
  try {
    return new CognitoIdentityProviderClient({
      region,
    });
  } catch (error) {
    console.error("Failed to create Cognito client:", error);
    throw new Error("Failed to initialize AWS Cognito client");
  }
};

export class CognitoService {
  private static client: CognitoIdentityProviderClient | null = null;

  /**
   * Split full name into given_name and family_name
   * First part before first space → given_name
   * Rest after first space → family_name
   */
  private static splitFullName(fullName: string): {
    givenName: string;
    familyName: string;
  } {
    const trimmed = fullName.trim();
    const firstSpaceIndex = trimmed.indexOf(" ");

    if (firstSpaceIndex === -1) {
      // No space found, use full name as given_name
      return {
        givenName: trimmed,
        familyName: "",
      };
    }

    return {
      givenName: trimmed.substring(0, firstSpaceIndex),
      familyName: trimmed.substring(firstSpaceIndex + 1).trim(),
    };
  }

  /**
   * Decode JWT token payload (without verification)
   * Used to extract cognito:username from ID token
   */
  private static decodeJWT(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      // Decode base64url encoded payload (second part)
      const payload = parts[1];
      // Replace base64url characters with base64
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if needed
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  }

  /**
   * Check if access token is expired or will expire soon (within 5 minutes)
   */
  static isTokenExpiredOrExpiringSoon(accessToken: string): boolean {
    try {
      const payload = this.decodeJWT(accessToken);
      if (!payload || !payload.exp) {
        return true; // If we can't decode, assume expired
      }

      const expirationTime = payload.exp as number;
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 5 * 60; // 5 minutes buffer

      // Token is expired or will expire within 5 minutes
      return expirationTime <= currentTime + bufferTime;
    } catch (error) {
      console.error("Failed to check token expiration:", error);
      return true; // If we can't check, assume expired
    }
  }

  /**
   * Combine given_name and family_name into full name
   */
  private static combineFullName(
    givenName?: string,
    familyName?: string
  ): string {
    const given = givenName?.trim() || "";
    const family = familyName?.trim() || "";

    if (!given && !family) {
      return "";
    }

    if (!family) {
      return given;
    }

    return `${given} ${family}`.trim();
  }

  private static clientRegion: string | null = null;

  private static getClient(): CognitoIdentityProviderClient {
    const { region } = getCognitoConfig();

    // Recreate client if region changed
    if (!this.client || this.clientRegion !== region) {
      this.client = createClient(region);
      this.clientRegion = region;
    }

    return this.client;
  }

  /**
   * Register a new user
   */
  static async signUp(credentials: RegisterCredentials): Promise<{
    success: boolean;
    error?: string;
    userSub?: string;
  }> {
    try {
      const { clientId } = getCognitoConfig();
      const client = this.getClient();

      // Split full name into given_name and family_name
      const { givenName, familyName } = this.splitFullName(credentials.name);

      const userAttributes: Array<{ Name: string; Value: string }> = [
        {
          Name: "email",
          Value: credentials.email,
        },
        {
          Name: "given_name",
          Value: givenName,
        },
      ];

      // Add family_name only if it exists
      if (familyName) {
        userAttributes.push({
          Name: "family_name",
          Value: familyName,
        });
      }

      const command = new SignUpCommand({
        ClientId: clientId,
        Username: credentials.username,
        Password: credentials.password,
        UserAttributes: userAttributes,
      });

      const response = await client.send(command);

      return {
        success: true,
        userSub: response.UserSub,
      };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(error, "Sign up failed");
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Verify user email with confirmation code
   */
  static async confirmSignUp(
    credentials: VerifyCredentials
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { clientId } = getCognitoConfig();
      const client = this.getClient();

      const command = new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: credentials.username,
        ConfirmationCode: credentials.code,
      });

      await client.send(command);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(
        error,
        "Verification failed"
      );
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Resend confirmation code
   */
  static async resendConfirmationCode(
    credentials: ResendCodeCredentials
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { clientId } = getCognitoConfig();
      const client = this.getClient();

      const command = new ResendConfirmationCodeCommand({
        ClientId: clientId,
        Username: credentials.username,
      });

      await client.send(command);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(
        error,
        "Failed to resend code"
      );
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Sign in user
   */
  static async signIn(credentials: LoginCredentials): Promise<{
    success: boolean;
    error?: string;
    tokens?: {
      accessToken: string;
      idToken: string;
      refreshToken: string;
    };
  }> {
    try {
      const { clientId } = getCognitoConfig();
      const client = this.getClient();

      const command = new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: credentials.username,
          PASSWORD: credentials.password,
        },
      });

      const response = await client.send(command);

      if (
        response.AuthenticationResult?.AccessToken &&
        response.AuthenticationResult?.IdToken &&
        response.AuthenticationResult?.RefreshToken
      ) {
        return {
          success: true,
          tokens: {
            accessToken: response.AuthenticationResult.AccessToken,
            idToken: response.AuthenticationResult.IdToken,
            refreshToken: response.AuthenticationResult.RefreshToken,
          },
        };
      }

      return {
        success: false,
        error: "Authentication failed: No tokens received",
      };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(error, "Sign in failed");
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Fetch user data from backend API (username and createdAt)
   * This ensures we get the real username from DynamoDB, not the alias (email)
   */
  private static async fetchUserDataFromBackend(
    cognitoUsername: string
  ): Promise<{ username: string; createdAt: string | null } | null> {
    if (!API_URL) {
      return null;
    }

    try {
      // Ensure token is valid before making API request
      await AuthService.ensureValidToken();

      const idToken = AuthService.getIdToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (idToken) {
        headers.Authorization = `Bearer ${idToken}`;
      }

      // Try to fetch user data using cognitoUsername (might be email if user logged in with email)
      const response = await fetch(`${API_URL}/users/${cognitoUsername}`, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          username: data.username, // Real username from DynamoDB
          createdAt: data.createdAt || null,
        };
      }
    } catch (error) {
      console.error("Failed to fetch user data from backend:", error);
    }

    return null;
  }

  /**
   * Get current user information
   * Fetches data from Cognito and createdAt from backend API
   */
  static async getCurrentUser(
    accessToken: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const client = this.getClient();

      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await client.send(command);

      if (!response.Username) {
        return {
          success: false,
          error: "User information not found",
        };
      }

      const attributes = response.UserAttributes || [];
      const emailAttr = attributes.find((attr) => attr.Name === "email");
      const givenNameAttr = attributes.find(
        (attr) => attr.Name === "given_name"
      );
      const familyNameAttr = attributes.find(
        (attr) => attr.Name === "family_name"
      );
      const subAttr = attributes.find((attr) => attr.Name === "sub");

      // Combine given_name and family_name into full name
      const fullName = this.combineFullName(
        givenNameAttr?.Value,
        familyNameAttr?.Value
      );

      // Get real username from ID token (cognito:username)
      // response.Username might be email if user logged in with email (due to aliasAttributes)
      let realUsername = response.Username;
      const idToken = AuthService.getIdToken();
      if (idToken) {
        const tokenPayload = this.decodeJWT(idToken);
        if (tokenPayload && tokenPayload["cognito:username"]) {
          realUsername = tokenPayload["cognito:username"] as string;
        }
      }

      // Fetch user data from backend API using real username
      const backendUserData = await this.fetchUserDataFromBackend(realUsername);

      if (!backendUserData || !backendUserData.createdAt) {
        return {
          success: false,
          error: "User account not found",
        };
      }

      // Build user object from Cognito data
      const user: User = {
        id: subAttr?.Value || response.Username,
        // Use real username from backend
        username: backendUserData.username,
        email: emailAttr?.Value || "",
        name: fullName || undefined,
        createdAt: backendUserData.createdAt,
      };

      return {
        success: true,
        user,
      };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(
        error,
        "Failed to get user"
      );
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    error?: string;
    tokens?: {
      accessToken: string;
      idToken: string;
    };
  }> {
    try {
      const { clientId } = getCognitoConfig();
      const client = this.getClient();

      const command = new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const response = await client.send(command);

      if (
        response.AuthenticationResult?.AccessToken &&
        response.AuthenticationResult?.IdToken
      ) {
        return {
          success: true,
          tokens: {
            accessToken: response.AuthenticationResult.AccessToken,
            idToken: response.AuthenticationResult.IdToken,
          },
        };
      }

      return {
        success: false,
        error: "Token refresh failed: No tokens received",
      };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(
        error,
        "Token refresh failed"
      );
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(accessToken: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const client = this.getClient();

      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await client.send(command);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(error, "Sign out failed");
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Initiate forgot password flow
   */
  static async forgotPassword(
    credentials: ForgotPasswordCredentials
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { clientId } = getCognitoConfig();
      const client = this.getClient();

      const command = new ForgotPasswordCommand({
        ClientId: clientId,
        Username: credentials.username,
      });

      await client.send(command);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(
        error,
        "Failed to send reset code"
      );
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Confirm forgot password with code and new password
   */
  static async confirmForgotPassword(
    credentials: ConfirmForgotPasswordCredentials
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { clientId } = getCognitoConfig();
      const client = this.getClient();

      const command = new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: credentials.username,
        ConfirmationCode: credentials.code,
        Password: credentials.newPassword,
      });

      await client.send(command);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(
        error,
        "Failed to reset password"
      );
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Update user attributes
   */
  static async updateUserAttributes(
    accessToken: string,
    attributes: { name?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const client = this.getClient();

      const userAttributes: Array<{ Name: string; Value: string }> = [];

      if (attributes.name !== undefined) {
        // Split full name into given_name and family_name
        const { givenName, familyName } = this.splitFullName(attributes.name);

        userAttributes.push({
          Name: "given_name",
          Value: givenName,
        });

        // Add family_name (even if empty, to clear it if user removes last name)
        userAttributes.push({
          Name: "family_name",
          Value: familyName,
        });
      }

      if (userAttributes.length === 0) {
        return {
          success: false,
          error: "No attributes to update",
        };
      }

      const command = new UpdateUserAttributesCommand({
        AccessToken: accessToken,
        UserAttributes: userAttributes,
      });

      await client.send(command);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(
        error,
        "Failed to update user attributes"
      );
      return {
        success: false,
        error: this.parseCognitoError(errorMessage),
      };
    }
  }

  /**
   * Extract error message from unknown error type
   */
  private static extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      // Check if it's an AWS SDK error with name property
      const awsError = error as Error & { name?: string; $metadata?: unknown };
      if (awsError.name) {
        return `${awsError.name}: ${error.message}`;
      }
      return error.message;
    }
    // Handle AWS SDK error objects
    if (typeof error === "object" && error !== null) {
      const errorObj = error as {
        name?: string;
        message?: string;
        $fault?: string;
      };
      if (errorObj.name) {
        return errorObj.message
          ? `${errorObj.name}: ${errorObj.message}`
          : errorObj.name;
      }
      if (errorObj.message) {
        return errorObj.message;
      }
    }
    return fallback;
  }

  /**
   * Parse Cognito error messages to user-friendly format
   */
  private static parseCognitoError(error: string): string {
    const errorLower = error.toLowerCase();

    // User-related errors
    if (error.includes("UserNotFoundException")) {
      return "User not found. Please check your username.";
    }
    if (error.includes("NotAuthorizedException")) {
      return "Incorrect username or password.";
    }
    if (error.includes("UserNotConfirmedException")) {
      return "Please verify your email address before signing in.";
    }
    if (error.includes("UsernameExistsException")) {
      return "Username already exists. Please choose a different username.";
    }
    if (error.includes("AliasExistsException")) {
      return "An account with this email already exists. Please use a different email or sign in.";
    }

    // Password-related errors
    if (error.includes("InvalidPasswordException")) {
      return "Password does not meet requirements. Must be at least 6 characters with lowercase, uppercase, and number.";
    }

    // Code-related errors
    if (error.includes("CodeMismatchException")) {
      return "Invalid verification code. Please try again.";
    }
    if (error.includes("ExpiredCodeException")) {
      return "Verification code has expired. Please request a new one.";
    }

    // Rate limiting
    if (error.includes("LimitExceededException")) {
      return "Too many attempts. Please try again later.";
    }

    // Parameter validation errors
    if (error.includes("InvalidParameterException")) {
      const isUsernameError =
        errorLower.includes("username") || errorLower.includes("user name");
      const isPasswordError = errorLower.includes("password");

      if (isUsernameError) {
        if (error.includes("length") || error.includes("minimum")) {
          return "Username must be at least 3 characters long.";
        }
        if (error.includes("format") || error.includes("pattern")) {
          return "Username must start with a letter and can only contain letters, numbers, dots (.), and hyphens (-)";
        }
        return "Invalid username format. Username must start with a letter and can only contain letters, numbers, dots (.), and hyphens (-)";
      }

      if (isPasswordError) {
        return "Password does not meet requirements. Must be at least 6 characters with lowercase, uppercase, and number.";
      }

      return "Invalid input. Please check your information.";
    }

    return error || "An unexpected error occurred.";
  }
}
