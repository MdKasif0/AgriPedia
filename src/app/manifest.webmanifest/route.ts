
import { type MetadataRoute } from 'next';

export function GET(): Response {
  const manifest: MetadataRoute.Manifest = {
    name: 'AgriPedia - Your Personal Plant Growth Guide',
    short_name: 'AgriPedia Guide',
    description: 'Your guide for personalized plant plans, health tracking, and sustainable growing methods.',
    start_url: '/',
    display: 'standalone',
    background_color: '#151921', // Updated: Dark theme page background (approx hsl(220, 15%, 10%))
    theme_color: '#5CBB7C',     // Updated: Primary leafy green (approx hsl(130, 50%, 55%))
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
