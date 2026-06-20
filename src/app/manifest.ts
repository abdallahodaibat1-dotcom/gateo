import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gateo | منصة الأعمال والمحترفين',
    short_name: 'Gateo',
    description: 'منصة Gateo - اكتشف الأعمال، الخدمات، والمحترفين في قطاعات متعددة',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/logo/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo/favicon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/logo/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
