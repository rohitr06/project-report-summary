import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, 
  swcMinify: true, 
  experimental: { appDir: false },  
};

export default nextConfig;
