
import { type MetadataRoute } from 'next';

export function GET(): Response {
  const manifest: MetadataRoute.Manifest = {
    name: 'AgriPedia - Your Personal Plant Growth Guide',
    short_name: 'AgriPedia Guide',
    description: 'Your guide for personalized plant plans, health tracking, and sustainable growing methods.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
        "data-ai-hint": "logo app icon"
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
        "data-ai-hint": "logo app icon"
      },
      {
        src: '/icons/icon-192x192.png', // Assuming same icon can be used for maskable
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
        "data-ai-hint": "logo app icon"
      },
      {
        src: '/icons/icon-512x512.png', // Assuming same icon can be used for maskable
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
        "data-ai-hint": "logo app icon"
      }
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
