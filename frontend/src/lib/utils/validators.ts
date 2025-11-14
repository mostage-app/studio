// Validation utility functions

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateFile = (file: File): ValidationResult => {
  const allowedTypes = [
    "text/markdown",
    "text/plain",
    "application/json",
    "text/html",
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type) && !file.name.endsWith(".md")) {
    return {
      valid: false,
      error:
        "File type not supported. Please select a Markdown, JSON, HTML, or text file.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size too large. Please select a file smaller than 10MB.",
    };
  }

  return { valid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { valid: false, error: "Email is required" };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: "Password must be at least 6 characters long",
    };
  }

  return { valid: true };
};

export const validateMarkdown = (markdown: string): ValidationResult => {
  if (!markdown || markdown.trim().length === 0) {
    return { valid: false, error: "Markdown content is required" };
  }

  return { valid: true };
};
