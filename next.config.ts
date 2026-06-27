import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.0.0.2', '192.168.0.18', '172.30.41.130', '172.29.43.148', '10.99.205.99'],
};

export default nextConfig;
