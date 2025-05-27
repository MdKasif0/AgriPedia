import type { NextConfig } from 'next';
// Potentially: import type { Configuration } from 'webpack'; // Not adding for now, will use 'any'

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
  // Add or modify the webpack key
  webpack: (
    config: any, // Using 'any' for simplicity as full webpack types might not be set up
    { isServer }: { isServer: boolean } // Options object, isServer is commonly used
  ) => {
    // Add firebase to externals
    // This prevents webpack from trying to bundle 'firebase'
    // It assumes 'firebase' will be available globally or via other means in the runtime environment (e.g. Netlify functions)
    config.externals = [...(config.externals || []), 'firebase'];

    // Add fallback for 'net' module on the client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Spread existing fallbacks
        net: false, // Mock 'net' for client-side
      };
    }
    
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
