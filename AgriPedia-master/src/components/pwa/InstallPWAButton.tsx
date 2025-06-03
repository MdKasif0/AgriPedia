'use client';

import { usePWAInstall } from '@/context/PWAInstallContext';
import { Button } from '@/components/ui/button'; // Assuming Button component exists
import { Download } from 'lucide-react';

export default function InstallPWAButton({ className }: { className?: string }) {
  const { installPromptEvent, isAppInstalled, triggerInstallPrompt } = usePWAInstall();

  if (isAppInstalled || !installPromptEvent) {
    return null; // Don't show if already installed or no prompt event
  }

  return (
    <Button
      onClick={triggerInstallPrompt}
      variant="outline" // Or any other appropriate variant
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
}
