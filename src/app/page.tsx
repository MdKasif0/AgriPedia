'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Redirect to the new search page if the home page should not be accessed directly.
    // Or, if it should be blank but accessible, remove this redirect.
    // For now, let's assume it should be blank and accessible.
    // If a redirect is desired, uncomment the following line:
    // router.replace('/search');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {/* You can leave this div empty or add a subtle message if needed */}
      {/* <h1 className="text-2xl font-semibold text-muted-foreground">Welcome</h1> */}
      {/* <p className="text-muted-foreground">Content is being organized.</p> */}
    </div>
  );
}
