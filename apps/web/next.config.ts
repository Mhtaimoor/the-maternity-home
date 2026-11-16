import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tmh/shared'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
};

export default nextConfig;
