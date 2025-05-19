import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <SearchX size={64} className="text-destructive mb-4" />
      <h1 className="text-4xl font-bold text-primary mb-3">404 - Not Found</h1>
      <p className="text-lg text-muted-foreground mb-6">
        The produce you are looking for could not be found.
      </p>
      <Link href="/">
        <Button variant="default">Go Back to AgriPedia Home</Button>
      </Link>
    </div>
  );
}
