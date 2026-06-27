import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

module.exports = {
  allowedDevOrigins: ['192.0.0.2', '192.168.0.18', '172.30.41.130', '172.29.43.148'],
};

export default nextConfig;
