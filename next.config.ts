import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // @ts-expect-error after is valid in Next.js 15.1+
    after: true,
  },
  // All dashboard pages are dynamic (require auth)
  output: "standalone",
};

export default nextConfig;
