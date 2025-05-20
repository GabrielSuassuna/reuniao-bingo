import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Habilitar suporte para Pages Router junto com App Router
  useFileSystemPublicRoutes: true,
  /*
   * Suporte a WebSockets no Next.js
   * Necessário para a funcionalidade de sala compartilhada
   */
  serverExternalPackages: ["socket.io", "socket.io-client"],
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@swc/core-linux-x64-gnu",
      "node_modules/@swc/core-linux-x64-musl",
      "node_modules/@esbuild/linux-x64",
    ],
  },
  experimental: {},
  webpack: (config) => {
    // Configura webpack para suportar soquetes WebSocket
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    return config;
  },
};

export default nextConfig;
