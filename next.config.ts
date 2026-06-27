import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.0.9", "192.168.0.18", "172.29.43.172", "172.30.41.130"],
};

export default nextConfig;
