
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegistrar from '@/components/pwa/ServiceWorkerRegistrar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
});

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'AgriPedia',
    template: '%s - AgriPedia',
  },
  description: 'Search and scan fruits and vegetables to learn more about them. Identify produce, get nutritional info, recipes, and more.',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'AgriPedia',
    description: 'Your ultimate guide to fruits and vegetables.',
    url: siteBaseUrl,
    siteName: 'AgriPedia',
    images: [
      {
        url: `${siteBaseUrl}/og-image.png`, // Replace with your actual generic OG image URL
        width: 1200,
        height: 630,
        alt: 'AgriPedia - Fruits and Vegetables Guide',
        'data-ai-hint': 'app logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriPedia',
    description: 'Your ultimate guide to fruits and vegetables.',
    images: [`${siteBaseUrl}/twitter-image.png`], // Replace with your actual generic Twitter image URL
     // creator: '@YourTwitterHandle', // Optional: add your Twitter handle
  },
  metadataBase: new URL(siteBaseUrl), // Required for resolving relative image paths
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <ServiceWorkerRegistrar />
          <SidebarProvider defaultOpen={true}>
            <div className="flex">
              <DesktopSidebar />
              <SidebarInset>
                <main className="container mx-auto p-6 md:p-8">
                  {children}
                </main>
              </SidebarInset>
            </div>
            <MobileBottomNav />
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
