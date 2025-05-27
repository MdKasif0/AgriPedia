'use client';

import { useState } from 'react';
import { Inter, Roboto_Mono } from 'next/font/google'; // Keep font instances for className
import VideoPreloader from '@/components/ui/VideoPreloader';
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegistrar from '@/components/pwa/ServiceWorkerRegistrar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Re-initialize font variables here if they are used directly in classNames
// or ensure they are passed down if necessary. For RootLayout, they are on the body tag.
// These might not be strictly needed here if the classNames are applied in RootLayout's body.
// However, if any child component specifically needs these variables, they can be kept.
// For this refactor, the primary application is on the body tag in layout.tsx.
// Let's assume they are not directly needed for classNames *within* AppBody itself,
// as the body tag in layout.tsx will handle them.
// const inter = Inter({
//   subsets: ['latin'],
//   variable: '--font-sans',
// });

// const roboto_mono = Roboto_Mono({
//   subsets: ['latin'],
//   variable: '--font-mono',
//   weight: ['400', '700'],
// });

interface AppBodyProps {
  children: React.ReactNode;
  // Pass font class names if needed, though they are applied to body in RootLayout
  fontClassName: string; 
}

export default function AppBody({ children, fontClassName }: AppBodyProps) {
  const [showGlobalPreloader, setShowGlobalPreloader] = useState(true);

  if (showGlobalPreloader) {
    // The body tag is in RootLayout, so we render the preloader directly.
    // The fontClassName is applied on the body in RootLayout.
    return (
      <VideoPreloader
        videoSrc="/AgriPedia-preloader-screen.mp4"
        onVideoEnd={() => setShowGlobalPreloader(false)}
      />
    );
  }

  // When preloader is done, render the actual app structure.
  // The body tag with fontClassNames is in RootLayout.
  return (
    <> {/* Using fragment as body tag is in RootLayout */}
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
        </SidebarProvider>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
