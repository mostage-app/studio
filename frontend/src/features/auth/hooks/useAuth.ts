"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Implement actual authentication check
        // For now, simulate loading
        setTimeout(() => {
          setState((prev) => ({ ...prev, isLoading: false }));
        }, 1000);
      } catch (error) {
        console.error("Auth check failed:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // TODO: Implement actual login
      console.log("Login attempt:", credentials);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user: User = {
        id: "1",
        email: credentials.email,
        name: "User",
      };

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // TODO: Implement actual registration
      console.log("Register attempt:", credentials);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user: User = {
        id: "1",
        email: credentials.email,
        name: credentials.name,
      };

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // TODO: Implement actual logout
      console.log("Logout");

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
  };
};
