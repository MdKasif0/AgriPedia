'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface AppSplashScreenProps {
  children: ReactNode;
}

const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  const handleVideoEnded = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'hsl(var(--background))', // Matches app background
          zIndex: 9999, // Ensure it's on top
        }}
      >
        <video
          autoPlay
          muted
          onEnded={handleVideoEnded}
          style={{
            width: '100%', // Fill the container
            height: '100%', // Fill the container
            objectFit: 'cover', // Cover, cropping if necessary
          }}
          src="/AgriPedia-splash-screen.mp4"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppSplashScreen;
