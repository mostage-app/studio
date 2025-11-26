import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR mode for dynamic routes support
  // Deploy to Vercel, AWS Amplify, or similar platforms
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
