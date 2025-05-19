
import { type MetadataRoute } from 'next';

export function GET(): Response {
  const manifest: MetadataRoute.Manifest = {
    name: 'AgriPedia',
    short_name: 'AgriPedia',
    description: 'Search and scan fruits and vegetables to learn more about them.',
    start_url: '/',
    display: 'standalone',
    background_color: '#224322', // Dark Desaturated Green (PRD) - for splash screen
    theme_color: '#90EE90',     // Vibrant Green (PRD Primary) - for app toolbar/status bar
    icons: [
      {
        src: 'https://placehold.co/192x192.png', 
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/512x512.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/192x192.png', 
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
