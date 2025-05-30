'use client';

import { useState, useEffect } from 'react';
import { getCurrentUserMode, type UserModeId } from '@/lib/userDataStore';
import { USER_MODES, DEFAULT_USER_MODE_ID } from '@/lib/constants';
import { ShieldCheck } from 'lucide-react'; // Example Icon

export default function ActiveUserModeDisplay() {
  const [currentModeId, setCurrentModeId] = useState<UserModeId>(DEFAULT_USER_MODE_ID);

  useEffect(() => {
    setCurrentModeId(getCurrentUserMode());

    const handleUserModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ modeId: UserModeId }>;
      if (customEvent.detail && customEvent.detail.modeId) {
        setCurrentModeId(customEvent.detail.modeId);
      } else {
        // Fallback if event detail is missing, though setCurrentUserMode should always provide it
        setCurrentModeId(getCurrentUserMode());
      }
    };

    window.addEventListener('userModeChanged', handleUserModeChange);
    // Also listen for direct storage changes, as a fallback or for other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'agripedia-user-mode') {
        setCurrentModeId(getCurrentUserMode());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userModeChanged', handleUserModeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (currentModeId === DEFAULT_USER_MODE_ID) {
    return null; // Don't display anything for the default mode
  }

  const currentMode = USER_MODES.find(mode => mode.id === currentModeId);
  const modeLabel = currentMode ? currentMode.label : 'Unknown Mode';

  return (
    <div className="fixed bottom-20 right-2 sm:bottom-4 sm:right-4 bg-background/80 text-foreground text-xs px-3 py-1.5 rounded-full shadow-lg border border-border/60 flex items-center gap-2 z-50">
      <ShieldCheck size={14} className="text-primary" />
      <span>{modeLabel} Active</span>
    </div>
  );
}
