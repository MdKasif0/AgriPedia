'use client';

import Link from 'next/link';
import { Home, Settings, Bell, Palette, Leaf, MessagesSquare, ScanLine, Heart, KeyRound, Users, Search, Calendar } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import NotificationPreferences from '@/components/NotificationPreferences';
import ApiKeyManager from '@/components/settings/ApiKeyManager';
import UserModeSelector from '@/components/settings/UserModeSelector';
import InstallPWAButton from '@/components/pwa/InstallPWAButton';

export default function DesktopSidebar() {
  const { state } = useSidebar();

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      id: 'grow-plans',
      label: 'Grow Plans',
      href: '/grow-plan/plans',
      icon: Calendar,
    },
    {
      id: 'chat',
      label: 'Chat with AgriAI',
      href: '/chat',
      icon: MessagesSquare,
    },
    {
      id: 'scan',
      label: 'Scan Produce',
      href: '/scan',
      icon: ScanLine,
    },
    {
      id: 'search',
      label: 'Search',
      href: '/search',
      icon: Search,
    },
  ];

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="bg-neutral-900/80 backdrop-blur-lg text-foreground shadow-lg border-r border-border/30">
      <SidebarHeader className="p-4 flex items-center justify-between">
        {state === 'expanded' ? (
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/90 transition-colors duration-200 ease-in-out">
                <Leaf size={28} className="animate-leaf-sway"/> AgriPedia
            </Link>
        ) : (
            <Link href="/" aria-label="AgriPedia Home" className="text-primary hover:text-primary/90 transition-colors duration-200 ease-in-out">
                 <Leaf size={28} className="animate-leaf-sway" />
            </Link>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton asChild tooltip={item.label} className="text-foreground hover:bg-accent-emerald/10 hover:text-accent-emerald data-[active=true]:text-accent-emerald data-[active=true]:border-r-2 data-[active=true]:border-accent-emerald transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background">
                  <a><item.icon /> <span>{item.label}</span></a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-4 bg-border/50" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-muted-foreground">
            <Settings size={16}/> {state === 'expanded' ? 'Settings' : ''}
          </SidebarGroupLabel>
          
          <div className="flex flex-col gap-2 px-2 py-1">
             <div className="flex items-center justify-between p-1 rounded-md hover:bg-accent-emerald/10 transition-colors duration-200 ease-in-out">
                <span className="text-sm text-foreground flex items-center gap-2">
                    <Palette size={16} className="text-accent-emerald"/> Theme
                </span>
                <ThemeToggleButton />
            </div>
            <Link href="/settings/favorites" passHref legacyBehavior>
                 <a className="flex items-center gap-2 p-2 rounded-md text-sm text-foreground hover:bg-accent-emerald/10 hover:text-accent-emerald data-[active=true]:text-accent-emerald data-[active=true]:border-r-2 data-[active=true]:border-accent-emerald transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background">
                    <Heart size={16} className="text-accent-emerald" />
                    <span>My Favorites</span>
                </a>
            </Link>
          </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-border/50" />

        <SidebarGroup>
             <SidebarGroupLabel className="flex items-center gap-2 text-muted-foreground">
                <Bell size={16}/> {state === 'expanded' ? 'Notifications' : ''}
            </SidebarGroupLabel>
            <NotificationPreferences />
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-border/50" />

        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 text-muted-foreground">
                <KeyRound size={16} /> {state === 'expanded' ? 'API Key' : ''}
            </SidebarGroupLabel>
            <div className="p-2">
                <ApiKeyManager />
            </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-border/50" />

        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 text-muted-foreground">
                <Users size={16} /> {state === 'expanded' ? 'User Mode' : ''}
            </SidebarGroupLabel>
            <div className="p-2">
                <UserModeSelector />
            </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-border/50" />

        <div className="p-2">
            <InstallPWAButton className="w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
} 