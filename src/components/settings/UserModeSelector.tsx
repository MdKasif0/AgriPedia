'use client';

import { useState, useEffect } from 'react';
import { USER_MODES, type UserModeId, DEFAULT_USER_MODE_ID } from '@/lib/constants';
import * as UserDataStore from '@/lib/userDataStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming this path
import { triggerHapticFeedback } from '@/lib/utils';

export default function UserModeSelector() {
  const [currentMode, setCurrentMode] = useState<UserModeId>(DEFAULT_USER_MODE_ID);

  useEffect(() => {
    setCurrentMode(UserDataStore.getCurrentUserMode());

    const handleUserModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ modeId: UserModeId }>;
      if (customEvent.detail && customEvent.detail.modeId) {
        setCurrentMode(customEvent.detail.modeId);
      }
    };
    window.addEventListener('userModeChanged', handleUserModeChange);
    return () => {
      window.removeEventListener('userModeChanged', handleUserModeChange);
    };
  }, []);

  const handleModeChange = (newModeId: UserModeId) => {
    triggerHapticFeedback();
    UserDataStore.setCurrentUserMode(newModeId);
    // setCurrentMode is already handled by the event listener,
    // but setting it here provides immediate UI feedback if needed for some reason.
    // setCurrentMode(newModeId); 
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="user-mode-select">Select User Mode</Label>
      <Select
        value={currentMode}
        onValueChange={(value) => handleModeChange(value as UserModeId)}
        name="user-mode-select"
      >
        <SelectTrigger id="user-mode-select" className="w-full">
          <SelectValue placeholder="Select a mode" />
        </SelectTrigger>
        <SelectContent>
          {USER_MODES.map((mode) => (
            <SelectItem key={mode.id} value={mode.id}>
              {mode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground px-1">
        This will tailor the app's content and features. (Effect on content is coming soon).
      </p>
    </div>
  );
}
