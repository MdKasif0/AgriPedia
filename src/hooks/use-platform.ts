import { useState, useEffect } from 'react';
import { useMediaQuery } from './use-media-query';

type Platform = 'mobile' | 'tablet' | 'desktop';
type OS = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

interface PlatformInfo {
  platform: Platform;
  os: OS;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isTouch: boolean;
}

export function usePlatform(): PlatformInfo {
  const [os, setOS] = useState<OS>('unknown');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOS('ios');
    } else if (/android/.test(userAgent)) {
      setOS('android');
    } else if (/windows/.test(userAgent)) {
      setOS('windows');
    } else if (/macintosh|mac os x/.test(userAgent)) {
      setOS('macos');
    } else if (/linux/.test(userAgent)) {
      setOS('linux');
    } else {
      setOS('unknown');
    }
  }, []);

  const platform: Platform = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    platform,
    os,
    isMobile,
    isTablet,
    isDesktop,
    isIOS: os === 'ios',
    isAndroid: os === 'android',
    isTouch
  };
}

// Platform-specific gesture handlers
export const usePlatformGestures = () => {
  const { platform, isIOS, isAndroid } = usePlatform();

  const getGestureProps = (type: 'modal' | 'sheet' | 'swipe') => {
    if (platform === 'mobile') {
      switch (type) {
        case 'modal':
          return {
            drag: 'y',
            dragConstraints: { top: 0, bottom: 0 },
            dragElastic: 0.2,
            onDragEnd: (event: any, info: any) => {
              if (info.offset.y > 100) {
                // Close modal
              }
            }
          };
        case 'sheet':
          return {
            drag: 'x',
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: (event: any, info: any) => {
              if (info.offset.x < -100) {
                // Close sheet
              }
            }
          };
        case 'swipe':
          return {
            drag: 'x',
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: (event: any, info: any) => {
              if (Math.abs(info.offset.x) > 100) {
                // Handle swipe
              }
            }
          };
        default:
          return {};
      }
    }
    return {};
  };

  const getPlatformAnimation = (type: 'modal' | 'sheet' | 'fade') => {
    if (platform === 'mobile') {
      switch (type) {
        case 'modal':
          return {
            initial: { y: '100%' },
            animate: { y: 0 },
            exit: { y: '100%' },
            transition: { type: 'spring', damping: 25, stiffness: 300 }
          };
        case 'sheet':
          return {
            initial: { x: '-100%' },
            animate: { x: 0 },
            exit: { x: '-100%' },
            transition: { type: 'spring', damping: 25, stiffness: 300 }
          };
        case 'fade':
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.2 }
          };
        default:
          return {};
      }
    }
    return {};
  };

  return {
    getGestureProps,
    getPlatformAnimation
  };
}; 