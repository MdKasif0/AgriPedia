'use client';

import { useState, type ReactNode } from 'react';

interface PreloaderProps {
  children: ReactNode;
  videoSrc: string;
}

export default function Preloader({ children, videoSrc }: PreloaderProps) {
  const [isPreloading, setIsPreloading] = useState(true);

  const handleVideoEnd = () => {
    setIsPreloading(false);
  };

  if (isPreloading) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black">
        <video
          className="w-auto h-auto min-w-full min-h-full object-cover"
          autoPlay
          muted
          playsInline // Important for iOS and most modern browser autoplay policies
          onEnded={handleVideoEnd}
          onError={handleVideoEnd} // Fallback if video fails to load/play
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return <>{children}</>;
}
