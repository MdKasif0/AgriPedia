
'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BellRing, BookOpenText } from 'lucide-react';

const NOTIFICATION_PREFS_KEY = 'agripedia-notification-prefs';

interface NotificationPrefs {
  seasonalAlerts: boolean;
  recipeTips: boolean;
}

export default function NotificationPreferences() {
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    seasonalAlerts: true,
    recipeTips: false,
  });

  useEffect(() => {
    setMounted(true);
    const storedPrefs = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (storedPrefs) {
      try {
        const parsedPrefs = JSON.parse(storedPrefs);
        // Ensure all keys exist to prevent errors with old localStorage data
        setPrefs(prev => ({
            seasonalAlerts: typeof parsedPrefs.seasonalAlerts === 'boolean' ? parsedPrefs.seasonalAlerts : prev.seasonalAlerts,
            recipeTips: typeof parsedPrefs.recipeTips === 'boolean' ? parsedPrefs.recipeTips : prev.recipeTips,
        }));
      } catch (e) {
        console.error("Failed to parse notification preferences from localStorage", e);
        // Fallback to default if parsing fails
        localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
      }
    } else {
        // Initialize localStorage if no prefs are stored
        localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    }
  }, []); // Initial load of prefs

  useEffect(() => {
    if (mounted) { // Only save to localStorage after initial mount & load
        localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    }
  }, [prefs, mounted]);

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  if (!mounted) {
    // Simple skeleton for switches
    return (
      <div className="space-y-4 p-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded bg-muted/50"></div>
          <div className="h-6 w-11 animate-pulse rounded-full bg-muted/50"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 animate-pulse rounded bg-muted/50"></div>
          <div className="h-6 w-11 animate-pulse rounded-full bg-muted/50"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="seasonal-alerts" className="flex items-center gap-2 cursor-pointer text-sm text-sidebar-foreground">
          <BellRing className="h-4 w-4 text-sidebar-primary" />
          Seasonal Alerts
        </Label>
        <Switch
          id="seasonal-alerts"
          checked={prefs.seasonalAlerts}
          onCheckedChange={() => handleToggle('seasonalAlerts')}
          aria-label="Toggle seasonal alerts"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="recipe-tips" className="flex items-center gap-2 cursor-pointer text-sm text-sidebar-foreground">
          <BookOpenText className="h-4 w-4 text-sidebar-primary" />
          Recipe Tips
        </Label>
        <Switch
          id="recipe-tips"
          checked={prefs.recipeTips}
          onCheckedChange={() => handleToggle('recipeTips')}
          aria-label="Toggle recipe tips notifications"
        />
      </div>
      <p className="text-xs text-muted-foreground px-1">
        Manage your notification preferences here. Actual notifications depend on overall push subscription status.
      </p>
    </div>
  );
}
