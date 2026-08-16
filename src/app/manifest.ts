import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Team LEAF — Civic Hazard Reporter',
    short_name: 'Team LEAF',
    description: 'Report public infrastructure hazards, navigate safe routes, and earn civic karma.',
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
