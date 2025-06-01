
'use client';
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegistrar from '@/components/pwa/ServiceWorkerRegistrar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PWAInstallProvider } from '@/context/PWAInstallContext';
import Preloader from '@/components/layout/Preloader'; // Added Preloader import
import ActiveUserModeDisplay from '@/components/layout/ActiveUserModeDisplay';

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
        url: `${siteBaseUrl}/og-image.png`, 
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
    images: [`${siteBaseUrl}/twitter-image.png`], 
  },
  metadataBase: new URL(siteBaseUrl), 
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
  const pathname = usePathname();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans antialiased`}>
        <Preloader videoSrc="/videos/AgriPedia-preloader-screen.mp4"> {/* Added Preloader wrapper */}
          <PWAInstallProvider>
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
                    <AnimatePresence mode="wait">
                      <motion.main
                        key={pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="container mx-auto p-4 pb-20 md:p-8 md:pb-8"
                      >
                        {children}
                      </motion.main>
                    </AnimatePresence>
                  </SidebarInset>
                </div>
                <MobileBottomNav />
                <ActiveUserModeDisplay /> {/* Display active mode */}
              </SidebarProvider>
              <Toaster />
            </ThemeProvider>
          </PWAInstallProvider>
        </Preloader>
      </body>
    </html>
  );
}
