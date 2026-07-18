import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['framer-motion', 'lucide-react'],
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    proxyClientMaxBodySize: '100mb',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/b/:slug',
        destination: '/business/:slug',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // COOP/COEP are required only on the create-post page because it uses
      // FFmpeg.wasm (SharedArrayBuffer). Applying them globally breaks images,
      // videos and other same-origin subresources across the platform.
      {
        source: '/create-post',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      {
        source: '/create-post/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
