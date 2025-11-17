import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove "output: export" to enable API routes
  // API routes require server-side rendering and cannot work with static export
  // If you need static export for production, consider using a separate build config
  // or moving API routes to a separate backend service
  // Static export for GitHub Pages deployment
  // API routes have been migrated to AWS Lambda + API Gateway
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
