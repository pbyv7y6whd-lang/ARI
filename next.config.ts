import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // All dashboard pages are dynamic (require auth)
  output: "standalone",
};

export default nextConfig;
