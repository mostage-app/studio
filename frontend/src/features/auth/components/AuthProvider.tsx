"use client";

import React, { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import type {
  LoginCredentials,
  RegisterCredentials,
  VerifyCredentials,
  ResendCodeCredentials,
  ForgotPasswordCredentials,
  ConfirmForgotPasswordCredentials,
  AuthState,
} from "../types/auth.types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    error?: string;
  }>;
  register: (credentials: RegisterCredentials) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    username?: string;
  }>;
  verify: (credentials: VerifyCredentials) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
  resendCode: (credentials: ResendCodeCredentials) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => Promise<{ success: boolean }>;
  forgotPassword: (credentials: ForgotPasswordCredentials) => Promise<{
    success: boolean;
    error?: string;
  }>;
  confirmForgotPassword: (
    credentials: ConfirmForgotPasswordCredentials
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updateUser: (attributes: { name?: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
