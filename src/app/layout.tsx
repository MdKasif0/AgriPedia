import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'next/font/google'; // Corrected import for Geist
import { GeistMono } from 'next/font/google'; // Corrected import for Geist Mono
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';

const geistSans = GeistSans({ // Invoking the font function
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({ // Invoking the font function
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AgriPedia',
  description: 'Search and scan fruits and vegetables to learn more about them.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#224322',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Header />
        <main className="container mx-auto p-4">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
