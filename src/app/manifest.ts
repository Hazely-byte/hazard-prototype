import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SANKET',
    short_name: 'SANKET',
    description: 'Smart city hazard reporting and navigation platform.',
    start_url: '/feed',
    display: 'standalone',
    background_color: '#F8FAF5',
    theme_color: '#192625',
    orientation: 'portrait',
    categories: ['utilities', 'navigation', 'social'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
