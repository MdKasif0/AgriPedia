'use client';

import { useState, useEffect, type ReactNode } from 'react';

interface PreloaderProps {
  children: ReactNode;
  videoSrc: string;
}

export default function Preloader({ children, videoSrc }: PreloaderProps) {
  const [isPreloading, setIsPreloading] = useState(true);

  const handleVideoEnd = () => {
    // This function might be called by video events or by the timeout.
    // Setting state is idempotent, so calling it multiple times is okay.
    setIsPreloading(false);
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isPreloading) {
      // Set a timeout to hide the preloader if video events don't fire
      timerId = setTimeout(() => {
        // console.log('Preloader timeout reached');
        handleVideoEnd();
      }, 10000); // 10-second timeout
    }

    return () => {
      // Cleanup the timeout if the component unmounts or if isPreloading changes
      clearTimeout(timerId);
    };
  }, [isPreloading]); // Effect runs when isPreloading state changes

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
