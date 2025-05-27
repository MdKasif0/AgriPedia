import React, { useRef, useEffect } from 'react';

interface VideoPreloaderProps {
  videoSrc: string;
  onVideoEnd: () => void;
}

const VideoPreloader: React.FC<VideoPreloaderProps> = ({ videoSrc, onVideoEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const handleVideoEnd = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    const handleError = (event: Event) => {
      console.error('Error playing video:', event);
    };

    videoElement.addEventListener('ended', handleVideoEnd);
    videoElement.addEventListener('error', handleError);

    // Attempt to play the video
    videoElement.play().catch(error => {
      // Autoplay was prevented, log the error
      console.error('Autoplay prevented:', error);
      // Optionally, you might want to show a play button or message to the user here
    });

    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd);
      videoElement.removeEventListener('error', handleError);
    };
  }, [videoSrc, onVideoEnd]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black', // Opaque background
        zIndex: 9999, // High z-index to overlay other content
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Center video content
        }}
      />
    </div>
  );
};

export default VideoPreloader;
