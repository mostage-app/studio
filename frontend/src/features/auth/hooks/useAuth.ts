"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
  VerifyCredentials,
  ResendCodeCredentials,
  ForgotPasswordCredentials,
  ConfirmForgotPasswordCredentials,
} from "../types/auth.types";
import { CognitoService } from "../services/cognitoService";
import { AuthService } from "../services/authService";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

const clearAuthState = (): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
});

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = AuthService.getAccessToken();
        const savedUser = AuthService.getUser();

        if (accessToken && savedUser) {
          // Verify token is still valid by fetching user info
          const result = await CognitoService.getCurrentUser(accessToken);
          if (result.success && result.user) {
            setState({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
            });
            AuthService.saveUser(result.user);
            return;
          }
        }

        // If token is invalid or missing, clear auth
        AuthService.clearAuth();
        setState(clearAuthState());
      } catch (error) {
        console.error("Auth check failed:", error);
        AuthService.clearAuth();
        setState(clearAuthState());
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await CognitoService.signIn(credentials);

      if (result.success && result.tokens) {
        // Save tokens
        AuthService.saveTokens(result.tokens);

        // Get user information
        const userResult = await CognitoService.getCurrentUser(
          result.tokens.accessToken
        );

        if (userResult.success && userResult.user) {
          AuthService.saveUser(userResult.user);
          setState({
            user: userResult.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: result.error || "Login failed",
      };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: extractErrorMessage(error, "Login failed"),
      };
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await CognitoService.signUp(credentials);

      setState((prev) => ({ ...prev, isLoading: false }));

      if (result.success) {
        return {
          success: true,
          requiresVerification: true,
          username: credentials.username,
        };
      }

      return {
        success: false,
        error: result.error || "Registration failed",
      };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: extractErrorMessage(error, "Registration failed"),
      };
    }
  }, []);

  const verify = useCallback(async (credentials: VerifyCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await CognitoService.confirmSignUp(credentials);

      setState((prev) => ({ ...prev, isLoading: false }));

      if (result.success) {
        return {
          success: true,
          message: "Email verified successfully. You can now sign in.",
        };
      }

      return {
        success: false,
        error: result.error || "Verification failed",
      };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: extractErrorMessage(error, "Verification failed"),
      };
    }
  }, []);

  const resendCode = useCallback(async (credentials: ResendCodeCredentials) => {
    try {
      const result = await CognitoService.resendConfirmationCode(credentials);
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to resend code"),
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const accessToken = AuthService.getAccessToken();
      if (accessToken) {
        await CognitoService.signOut(accessToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      AuthService.clearAuth();
      setState(clearAuthState());
    }

    return { success: true };
  }, []);

  const forgotPassword = useCallback(
    async (credentials: ForgotPasswordCredentials) => {
      try {
        const result = await CognitoService.forgotPassword(credentials);
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: extractErrorMessage(error, "Failed to send reset code"),
        };
      }
    },
    []
  );

  const confirmForgotPassword = useCallback(
    async (credentials: ConfirmForgotPasswordCredentials) => {
      try {
        const result = await CognitoService.confirmForgotPassword(credentials);
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: extractErrorMessage(error, "Failed to reset password"),
        };
      }
    },
    []
  );

  const updateUser = useCallback(async (attributes: { name?: string }) => {
    try {
      const accessToken = AuthService.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: "Not authenticated",
        };
      }

      const result = await CognitoService.updateUserAttributes(
        accessToken,
        attributes
      );

      if (result.success) {
        // Refresh user data
        const userResult = await CognitoService.getCurrentUser(accessToken);
        if (userResult.success && userResult.user) {
          AuthService.saveUser(userResult.user);
          setState((prev) => ({
            ...prev,
            user: userResult.user || prev.user,
          }));
        }
      }

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to update user"),
      };
    }
  }, []);

  return {
    ...state,
    login,
    register,
    verify,
    resendCode,
    logout,
    forgotPassword,
    confirmForgotPassword,
    updateUser,
  };
};
