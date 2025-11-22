import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**", // This matches Firebase Storage paths
      },
      {
        protocol: "https",
        hostname: "www.dtwears.ng",
        pathname: "/**", // This allows all images from all paths
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**", // This allows all images from all paths
      },
    ],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
