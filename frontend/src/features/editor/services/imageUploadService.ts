/**
 * Image Upload Service
 * Handles image upload to S3 through AWS API Gateway
 */

import { AuthService } from "@/features/auth/services/authService";

// API Gateway URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL environment variable is not configured. " +
      "Please set it in your .env.local file."
  );
}

export interface ImageUploadResponse {
  url: string;
  key: string;
}

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please select a JPG, PNG, GIF, or WebP image.",
    };
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size too large. Please select an image smaller than 2MB.",
    };
  }

  return { valid: true };
}

/**
 * Upload image to S3
 * @param file - The image file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with the uploaded image URL
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: ImageUploadProgress) => void
): Promise<string> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid file");
  }

  // Ensure user is authenticated
  const idToken = AuthService.getIdToken();
  if (!idToken) {
    throw new Error("You must be logged in to upload images");
  }

  // Convert file to base64
  const base64Promise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const base64 = await base64Promise;

  // Create request body
  const requestBody = JSON.stringify({
    image: base64,
    filename: file.name,
    contentType: file.type,
  });

  // Create XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress (simulated for base64)
    if (onProgress) {
      // Simulate progress for base64 upload
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + 10, 90);
        onProgress({
          loaded: progress,
          total: 100,
          percentage: progress,
        });
      }, 100);

      xhr.addEventListener("load", () => {
        clearInterval(interval);
        if (onProgress) {
          onProgress({ loaded: 100, total: 100, percentage: 100 });
        }
      });
    }

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: ImageUploadResponse = JSON.parse(xhr.responseText);
          resolve(response.url);
        } catch (error) {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was cancelled"));
    });

    // Start upload
    xhr.open("POST", `${API_URL}/images/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(requestBody);
  });
}

/**
 * Generate preview URL from file (for display before upload)
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to create preview"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
