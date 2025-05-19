import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed from GeistSans and GeistMono
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Standard CSS variable for sans-serif font
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono', // Standard CSS variable for monospace font
  weight: ['400', '700'], // Optional: specify weights if needed
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
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans antialiased`}>
        <Header />
        <main className="container mx-auto p-4">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
