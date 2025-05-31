
import { type MetadataRoute } from 'next';

export function GET(): Response {
  const manifest: MetadataRoute.Manifest = {
    name: 'AgriPedia - Your Personal Plant Growth Guide',
    short_name: 'AgriPedia Guide',
    description: 'Your guide for personalized plant plans, health tracking, and sustainable growing methods.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1C1E21', // Forest Night dark theme background (hsl(210 10% 12%))
    theme_color: '#598C59',     // Forest Night dark theme primary (hsl(120 30% 45%))
    icons: [
      {
        src: 'https://placehold.co/192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
        "data-ai-hint": "logo app icon"
      },
      {
        src: 'https://placehold.co/512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
        "data-ai-hint": "logo app icon"
      },
      {
        src: 'https://placehold.co/192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
        "data-ai-hint": "logo app icon"
      },
      {
        src: 'https://placehold.co/512x512.png',
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
