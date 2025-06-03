'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  Home,
  Leaf,
  Calendar,
  Users,
  Camera,
  BookOpen,
  LogIn,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'My Garden', href: '/garden', icon: Leaf },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Scanner', href: '/scanner', icon: Camera },
  { name: 'Learn', href: '/learn', icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useStore();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold">AgriPedia</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 