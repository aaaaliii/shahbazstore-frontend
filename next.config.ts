import type { NextConfig } from "next";

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
};

export default nextConfig;
