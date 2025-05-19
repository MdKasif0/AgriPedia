
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
  themeColor: 'hsl(var(--background))', // Updated to use theme variable
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans antialiased`}>
        <ServiceWorkerRegistrar />
        <SidebarProvider defaultOpen={true}> {/* Control sidebar state here */}
          <Header /> {/* Header remains outside sidebar logic for this layout */}
          <div className="flex"> {/* Flex container for sidebar and main content */}
            <DesktopSidebar /> {/* Conditionally rendered via CSS by sidebar.tsx */}
            <SidebarInset> {/* This handles the main content area correctly with the sidebar */}
              <main className="container mx-auto p-4 pb-20 md:pb-4"> {/* Added padding-bottom for mobile nav */}
                {children}
              </main>
            </SidebarInset>
          </div>
          <MobileBottomNav /> {/* Conditionally rendered via CSS (md:hidden) */}
          <ScanFAB />
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
