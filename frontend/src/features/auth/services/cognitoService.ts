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

      const command = new SignUpCommand({
        ClientId: clientId,
        Username: credentials.username,
        Password: credentials.password,
        UserAttributes: [
          {
            Name: "email",
            Value: credentials.email,
          },
          {
            Name: "given_name",
            Value: credentials.name,
          },
        ],
      });

      const response = await client.send(command);

      // Store signup date in localStorage
      try {
        const signupDate = new Date().toISOString();
        const userData = {
          id: response.UserSub,
          username: credentials.username,
          email: credentials.email,
          name: credentials.name,
          createdAt: signupDate,
        };
        localStorage.setItem("mostage-user-data", JSON.stringify(userData));
      } catch {
        // Ignore localStorage errors
      }

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
   * Get current user information
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
      const nameAttr = attributes.find((attr) => attr.Name === "given_name");
      const subAttr = attributes.find((attr) => attr.Name === "sub");

      const user: User = {
        id: subAttr?.Value || response.Username,
        username: response.Username,
        email: emailAttr?.Value || "",
        name: nameAttr?.Value,
      };

      // Try to get createdAt from localStorage (stored during signup)
      // If not found, use current date as fallback for existing users
      try {
        const savedUser = localStorage.getItem("mostage-user-data");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser.createdAt) {
            (user as User & { createdAt?: string }).createdAt =
              parsedUser.createdAt;
          } else {
            // For existing users without createdAt, set current date
            (user as User & { createdAt?: string }).createdAt =
              new Date().toISOString();
            // Update localStorage
            parsedUser.createdAt = user.createdAt;
            localStorage.setItem(
              "mostage-user-data",
              JSON.stringify(parsedUser)
            );
          }
        } else {
          // For new logins, set current date
          (user as User & { createdAt?: string }).createdAt =
            new Date().toISOString();
        }
      } catch {
        // Ignore localStorage errors, set current date as fallback
        (user as User & { createdAt?: string }).createdAt =
          new Date().toISOString();
      }

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
        userAttributes.push({
          Name: "given_name",
          Value: attributes.name,
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
      return error.message;
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
