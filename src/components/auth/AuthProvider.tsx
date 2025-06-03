import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';

const publicRoutes = ['/auth/login', '/auth/register', '/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if the current route is public
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated and trying to access a protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
} 