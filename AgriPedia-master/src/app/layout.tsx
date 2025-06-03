import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
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
    default: 'EcoGrow',
    template: '%s - EcoGrow',
    description: 'Your Personal Plant Growth Guide',
    keywords: ['plants', 'gardening', 'growth guide', 'plant care'],
    authors: [{ name: 'EcoGrow Team' }],
  },
  description: 'Search and scan fruits and vegetables to learn more about them. Identify produce, get nutritional info, recipes, and more.',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ecogrow.app',
    siteName: 'EcoGrow',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EcoGrow - Fruits and Vegetables Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcoGrow',
    description: 'Your Personal Plant Growth Guide',
    images: ['/images/twitter-image.jpg'],
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
                    <main className="container mx-auto p-4 pb-20 md:p-8 md:pb-8">
                      {children}
                    </main>
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
