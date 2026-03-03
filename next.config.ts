import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    // Enable Vercel's image optimization
    // Remove unoptimized: true to use Vercel's built-in image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Use webpack to ensure proper module resolution for tailwindcss
  // This fixes the issue where tailwindcss couldn't be resolved from the root directory
  webpack: (config, { isServer }) => {
    // Ensure webpack resolves modules from the project directory
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ];
    return config;
  },
  // Add empty turbopack config to silence the error in Next.js 16
  // The webpack config above will still be used when webpack is explicitly enabled
  turbopack: {},
};

export default nextConfig;
