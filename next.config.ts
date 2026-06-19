import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  // Ensure the server-only retrieval corpus ships with the chat function on Vercel.
  outputFileTracingIncludes: {
    "/api/marketing-brain/chat": ["./src/app/marketing-brain/_data/chunks.json"],
  },
};

export default nextConfig;
