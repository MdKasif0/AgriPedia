'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search,
  Bell,
  User,
  Home,
  Leaf,
  Calendar,
  BookOpen,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Plants', icon: Leaf, href: '/plants' },
  { name: 'Timeline', icon: Calendar, href: '/timeline' },
  { name: 'Journal', icon: BookOpen, href: '/journal' },
  { name: 'Community', icon: Users, href: '/community' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  const Sidebar = () => (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300",
      isDesktop ? "translate-x-0" : "-translate-x-full",
      isSidebarOpen && "translate-x-0"
    )}>
      <div className="flex h-16 items-center px-4 border-b">
        <h1 className="text-xl font-bold">AgriPedia</h1>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href={item.href}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );

  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
      <nav className="grid grid-cols-5 h-16">
        {navigation.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className="flex flex-col items-center justify-center h-full"
            asChild
          >
            <a href={item.href}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm transition-shadow duration-200",
        isScrolled && "shadow-sm"
      )}>
        <div className="flex h-16 items-center px-4 gap-4">
          {!isDesktop && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}

          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search plants, guides, or community..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {isDesktop && <Sidebar />}

      {/* Main Content */}
      <main className={cn(
        "min-h-screen pt-16 transition-all duration-300",
        isDesktop && isSidebarOpen ? "lg:pl-64" : "lg:pl-0",
        !isDesktop && "pb-16"
      )}>
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      {!isDesktop && <MobileNav />}
    </div>
  );
} 