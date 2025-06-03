import { WifiOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <WifiOff size={64} className="text-destructive mb-4" />
      <h1 className="text-3xl font-bold text-primary mb-2">You are offline</h1>
      <p className="text-lg text-muted-foreground mb-6">
        It seems you're not connected to the internet. Some features may be unavailable.
        Previously visited items might be available.
      </p>
      <Link href="/">
        <Button variant="default">Go to Homepage</Button>
      </Link>
      {/* TODO: List locally stored items if possible */}
    </div>
  );
}
