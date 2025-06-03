
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ServiceWorkerRegistrar() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('AgriPedia Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('AgriPedia Service Worker registration failed:', error);
          toast({
            title: 'Service Worker Error',
            description: 'Could not register service worker for offline features and notifications.',
            variant: 'destructive',
          });
        });
    }
  }, [toast]);

  return null; // This component doesn't render anything
}
