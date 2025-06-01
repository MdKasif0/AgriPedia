import type {NextConfig} from 'next';
import path from 'path'; // Import path

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.clevelandclinic.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.rhs.org.uk', // Added this hostname
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        // Prevent aggressive caching of service worker during development
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          { 
            key: 'Pragma', 
            value: 'no-cache' 
          },
          { 
            key: 'Expires', 
            value: '0' 
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          }
        ],
      },
    ];
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Add genkit related packages to externals
    // This helps prevent "Module not found" errors in environments like Netlify
    // by telling Next.js not to bundle these packages.
    const genkitPackages = [
        '@genkit-ai/flow',
        'genkit',
        '@genkit-ai/googleai',
        '@genkit-ai/next'
    ];

    if (!isServer) {
        // For client-side, if you were to use these, you might need aliases,
        // but genkit is primarily for server-side logic.
        // The Netlify solution implies these are needed as externals broadly.
    }

    config.externals = [...(config.externals || []), ...genkitPackages];

    // Ensure that server-only packages are not bundled on the client.
    // This is particularly relevant if using experimental `serverActions` or similar.
    if (nextRuntime === 'nodejs') {
        // config.externals.push(...); // if you have server-specific externals
    }
    if (nextRuntime === 'edge') {
        // config.externals.push(...); // if you have edge-specific externals
    }

    return config;
  },
};

export default nextConfig;
