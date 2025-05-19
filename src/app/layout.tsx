
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import ServiceWorkerRegistrar from '@/components/pwa/ServiceWorkerRegistrar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ScanFAB from '@/components/layout/ScanFAB';
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

export const metadata: Metadata = {
  title: 'AgriPedia',
  description: 'Search and scan fruits and vegetables to learn more about them.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [ // Provide light and dark theme colors
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 98%)' }, // Light background
    { media: '(prefers-color-scheme: dark)', color: 'hsl(120 33% 20%)' }, // Dark background (current)
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
            <Header />
            <div className="flex">
              <DesktopSidebar />
              <SidebarInset>
                <main className="container mx-auto p-4 pb-20 md:pb-4">
                  {children}
                </main>
              </SidebarInset>
            </div>
            <MobileBottomNav />
            <ScanFAB />
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
