"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, User, UserPlus } from "lucide-react";

import { AuthModalProps } from "../types/auth.types";
import { Modal } from "@/shared/components/ui/Modal";
import { analytics } from "@/shared/utils/analytics";

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Track auth modal open
  useEffect(() => {
    if (isOpen) {
      analytics.trackAuthModalOpen(isSignUp ? "signup" : "login");
    }
  }, [isOpen, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Track auth attempt
    analytics.trackAuthAttempt(isSignUp ? "signup" : "login");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isSignUp) {
      // Sign Up error message
      setError(
        "Sorry, The sign up is not public yet. Please try again next week."
      );
      // Track signup error
      analytics.trackAuthError("signup_error");
    } else {
      // Sign In error message
      setError("Invalid username or password. Please try again.");
      // Track login error
      analytics.trackAuthError("login_error");
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setError(""); // Clear error when closing modal
    onClose();
  };

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        {isSignUp ? (
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        ) : (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        )}
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      headerContent={headerContent}
      maxWidth="md"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mb-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2 sm:p-3">
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {isSignUp && (
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
              required={isSignUp}
            />
          </div>
        )}

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
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
              <span className="text-xs sm:text-sm">Processing...</span>
            </>
          ) : isSignUp ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
        <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              const newMode = !isSignUp;
              setIsSignUp(newMode);
              setError(""); // Clear error when switching modes
              // Track mode switch
              analytics.trackAuthModeSwitch(newMode ? "signup" : "login");
            }}
            className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </Modal>
  );
}
