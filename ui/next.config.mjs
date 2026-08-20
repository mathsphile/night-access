import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@midnight-ntwrk/dapp-connector-api', '@midnight-ntwrk/midnight-js-types'],
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
