"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  UserPlus,
  Mail,
  CheckCircle,
} from "lucide-react";

import { AuthModalProps } from "../types/auth.types";
import { useAuthContext } from "./AuthProvider";
import { Modal } from "@/lib/components/ui/Modal";
import { analytics } from "@/lib/utils/analytics";
import { useCookieConsentContext } from "@/lib/components/CookieConsentProvider";
import { CookieConsentBanner } from "@/lib/components/ui/CookieConsentBanner";

type AuthMode =
  | "login"
  | "signup"
  | "verify"
  | "forgotPassword"
  | "resetPassword";

interface FormData {
  username: string;
  email: string;
  password: string;
  name: string;
  verificationCode: string;
  newPassword: string;
}

const INITIAL_FORM_DATA: FormData = {
  username: "",
  email: "",
  password: "",
  name: "",
  verificationCode: "",
  newPassword: "",
};

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;
const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9.-]*$/;

const VALIDATION_MESSAGES = {
  COOKIE_REQUIRED: "Please accept cookies to continue.",
  USERNAME_TOO_SHORT: `Username must be at least ${USERNAME_MIN_LENGTH} characters long`,
  USERNAME_TOO_LONG: `Username must be at most ${USERNAME_MAX_LENGTH} characters long`,
  USERNAME_INVALID:
    "Username must start with a letter and can only contain letters, numbers, dots and hyphens",
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  NAME_REQUIRED: "Full name is required",
} as const;

const SUCCESS_MESSAGES = {
  LOGIN: "Successfully signed in!",
  SIGNUP: "Verification code sent to your email!",
  VERIFY: "Email verified successfully! You can now sign in.",
  RESEND_CODE: "Verification code resent to your email!",
  FORGOT_PASSWORD: "Password reset code sent to your email!",
  RESET_PASSWORD: "Password reset successfully! You can now sign in.",
} as const;

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    user,
    login,
    register,
    verify,
    resendCode,
    forgotPassword,
    confirmForgotPassword,
    isLoading: authLoading,
  } = useAuthContext();
  const { hasConsent, acceptAnalytics, declineAnalytics } =
    useCookieConsentContext();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingUsername, setPendingUsername] = useState("");
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode("login");
      setError("");
      setSuccess("");
      setPendingUsername("");
      setShowCookieBanner(false);
      setFormData(INITIAL_FORM_DATA);
      analytics.trackAuthModalOpen("login");
    }
  }, [isOpen]);

  // Track mode changes
  useEffect(() => {
    if (isOpen && mode !== "login") {
      const modeMap: Record<AuthMode, AuthMode> = {
        login: "login",
        signup: "signup",
        verify: "verify",
        forgotPassword: "forgotPassword",
        resetPassword: "resetPassword",
      };
      analytics.trackAuthModalOpen(modeMap[mode]);
    }
  }, [mode, isOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
      setError("");
      setSuccess("");
    },
    []
  );

  const validateCookieConsent = useCallback((): boolean => {
    if (!hasConsent) {
      setError(VALIDATION_MESSAGES.COOKIE_REQUIRED);
      return false;
    }
    return true;
  }, [hasConsent]);

  const validateUsername = useCallback((username: string): string | null => {
    if (username.length < USERNAME_MIN_LENGTH) {
      return VALIDATION_MESSAGES.USERNAME_TOO_SHORT;
    }
    if (username.length > USERNAME_MAX_LENGTH) {
      return VALIDATION_MESSAGES.USERNAME_TOO_LONG;
    }
    if (!USERNAME_PATTERN.test(username)) {
      return VALIDATION_MESSAGES.USERNAME_INVALID;
    }
    return null;
  }, []);

  const validatePassword = useCallback((password: string): string | null => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
    }
    return null;
  }, []);

  const validateName = useCallback((name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return VALIDATION_MESSAGES.NAME_REQUIRED;
    }
    return null;
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (!validateCookieConsent()) return;

      setIsLoading(true);
      analytics.trackAuthAttempt("login");

      try {
        const result = await login({
          username: formData.username,
          password: formData.password,
        });

        if (result.success) {
          setSuccess(SUCCESS_MESSAGES.LOGIN);
          analytics.trackAuthSuccess("login");
          setTimeout(() => {
            onClose();
            // Redirect to user's dashboard after login
            // Use username from login result (real username, not email)
            if (result.username) {
              router.push(`/${result.username}`);
            } else if (user?.username) {
              // Fallback to user from context if username not in result
              router.push(`/${user.username}`);
            }
          }, 1000);
        } else {
          setError(result.error || "Login failed");
          analytics.trackAuthError("login_error");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Login failed");
        analytics.trackAuthError("login_error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData.username,
      formData.password,
      login,
      onClose,
      validateCookieConsent,
      router,
      user?.username,
    ]
  );

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (!validateCookieConsent()) return;

      const usernameError = validateUsername(formData.username);
      if (usernameError) {
        setError(usernameError);
        return;
      }

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      const nameError = validateName(formData.name);
      if (nameError) {
        setError(nameError);
        return;
      }

      setIsLoading(true);
      analytics.trackAuthAttempt("signup");

      try {
        const result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (result.success && result.requiresVerification) {
          setPendingUsername(formData.username);
          setMode("verify");
          setSuccess(SUCCESS_MESSAGES.SIGNUP);
          analytics.trackAuthSuccess("signup");
        } else {
          setError(result.error || "Registration failed");
          analytics.trackAuthError("signup_error");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Registration failed"
        );
        analytics.trackAuthError("signup_error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData,
      register,
      validateCookieConsent,
      validateUsername,
      validatePassword,
      validateName,
    ]
  );

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);
      analytics.trackAuthAttempt("verify");

      try {
        const result = await verify({
          username: pendingUsername,
          code: formData.verificationCode,
        });

        if (result.success) {
          setSuccess(result.message || SUCCESS_MESSAGES.VERIFY);
          analytics.trackAuthSuccess("verify");
          setTimeout(() => {
            setMode("login");
            setFormData((prev) => ({
              ...prev,
              verificationCode: "",
            }));
          }, 2000);
        } else {
          setError(result.error || "Verification failed");
          analytics.trackAuthError("verify_error");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Verification failed"
        );
        analytics.trackAuthError("verify_error");
      } finally {
        setIsLoading(false);
      }
    },
    [formData.verificationCode, pendingUsername, verify]
  );

  const handleResendCode = useCallback(async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await resendCode({
        username: pendingUsername,
      });

      if (result.success) {
        setSuccess(SUCCESS_MESSAGES.RESEND_CODE);
      } else {
        setError(result.error || "Failed to resend code");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to resend code"
      );
    } finally {
      setIsLoading(false);
    }
  }, [pendingUsername, resendCode]);

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);

      try {
        const result = await forgotPassword({
          username: formData.username,
        });

        if (result.success) {
          setPendingUsername(formData.username);
          setMode("resetPassword");
          setSuccess(SUCCESS_MESSAGES.FORGOT_PASSWORD);
        } else {
          setError(result.error || "Failed to send reset code");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to send reset code"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData.username, forgotPassword]
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      setIsLoading(true);

      try {
        const result = await confirmForgotPassword({
          username: pendingUsername,
          code: formData.verificationCode,
          newPassword: formData.newPassword,
        });

        if (result.success) {
          setSuccess(SUCCESS_MESSAGES.RESET_PASSWORD);
          setTimeout(() => {
            setMode("login");
            setFormData((prev) => ({
              ...prev,
              verificationCode: "",
              newPassword: "",
            }));
          }, 2000);
        } else {
          setError(result.error || "Failed to reset password");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to reset password"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData.verificationCode,
      formData.newPassword,
      pendingUsername,
      confirmForgotPassword,
      validatePassword,
    ]
  );

  const handleClose = useCallback(() => {
    setError("");
    setSuccess("");
    setMode("login");
    setPendingUsername("");
    setShowCookieBanner(false);
    onClose();
  }, [onClose]);

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    analytics.trackAuthModeSwitch(newMode === "signup" ? "signup" : "login");
  }, []);

  const handleCookieBannerAccept = useCallback(() => {
    acceptAnalytics();
    setShowCookieBanner(false);
  }, [acceptAnalytics]);

  const handleCookieBannerDecline = useCallback(() => {
    declineAnalytics();
    setShowCookieBanner(false);
  }, [declineAnalytics]);

  const getHeaderContent = useCallback(() => {
    const headerConfig: Record<
      AuthMode,
      { icon: React.ReactNode; title: string }
    > = {
      verify: {
        icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
        title: "Verify Email",
      },
      forgotPassword: {
        icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
        title: "Forgot Password",
      },
      resetPassword: {
        icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
        title: "Reset Password",
      },
      signup: {
        icon: <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
        title: "Create Account",
      },
      login: {
        icon: <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
        title: "Sign In",
      },
    };

    const config = headerConfig[mode];

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
          {config.icon}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            {config.title}
          </h2>
        </div>
      </div>
    );
  }, [mode]);

  const isLoadingState = isLoading || authLoading;
  const showCookieWarning =
    !hasConsent && (mode === "login" || mode === "signup");
  const showFooter = mode !== "verify" && mode !== "resetPassword";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        headerContent={getHeaderContent()}
        maxWidth="md"
      >
        <div>
          {/* Cookie Consent Warning */}
          {showCookieWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
              <div className="flex items-start gap-2">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 flex-1">
                  Please accept cookies to continue with sign in or sign up.{" "}
                  <button
                    type="button"
                    onClick={() => setShowCookieBanner(true)}
                    className="text-yellow-900 dark:text-yellow-100 font-medium hover:text-yellow-600 cursor-pointer "
                  >
                    Manage cookies
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          {/* Verification Form */}
          {mode === "verify" && (
            <form
              onSubmit={handleVerify}
              className="space-y-3 sm:space-y-4 mb-6"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter verification code"
                  required
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoadingState}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center cursor-pointer"
              >
                {isLoadingState ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-xs sm:text-sm">Verifying...</span>
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoadingState}
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === "forgotPassword" && (
            <form
              onSubmit={handleForgotPassword}
              className="space-y-3 sm:space-y-4 mb-6"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username or email"
                  required
                  minLength={1}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  We&apos;ll send a password reset code to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoadingState}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center cursor-pointer"
              >
                {isLoadingState ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-xs sm:text-sm">Sending...</span>
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === "resetPassword" && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-3 sm:space-y-4 mb-6"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter verification code"
                  required
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-2 pr-8 sm:pr-10 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 6 characters with lowercase, uppercase, and
                  number
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoadingState}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center cursor-pointer"
              >
                {isLoadingState ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-xs sm:text-sm">Resetting...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {/* Login/Signup Form */}
          {(mode === "login" || mode === "signup") && (
            <form
              onSubmit={mode === "login" ? handleLogin : handleSignup}
              className="space-y-3 sm:space-y-4 mb-6"
            >
              {/* Username or Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {mode === "login" ? "Username or Email" : "Username"}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    mode === "login"
                      ? "Enter your username or email"
                      : "Enter your username"
                  }
                  required
                  minLength={mode === "login" ? 1 : USERNAME_MIN_LENGTH}
                  maxLength={mode === "login" ? undefined : USERNAME_MAX_LENGTH}
                />
              </div>

              {/* Email (only for signup) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              )}

              {/* Name (required for signup) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-2 sm:px-3 py-2 pr-8 sm:pr-10 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 6 characters with lowercase, uppercase, and
                    number
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoadingState || !hasConsent}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center cursor-pointer"
              >
                {isLoadingState ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-xs sm:text-sm">Processing...</span>
                  </>
                ) : mode === "signup" ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          {showFooter && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
              <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                ) : mode === "forgotPassword" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                    >
                      Sign Up
                    </button>
                    {" • "}
                    Forgot Password?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("forgotPassword")}
                      className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                    >
                      Reset It
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <CookieConsentBanner
          onAccept={handleCookieBannerAccept}
          onDecline={handleCookieBannerDecline}
        />
      )}
    </>
  );
}
