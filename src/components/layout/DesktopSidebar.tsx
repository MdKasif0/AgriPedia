
'use client';

import Link from 'next/link';
import { Home, Settings, Bell, Palette, Leaf, MessagesSquare, ScanLine, Heart, KeyRound, Users, Search } from 'lucide-react'; // Added KeyRound, Users, Search
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

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4 flex items-center justify-between">
        {state === 'expanded' ? (
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-sidebar-primary hover:text-sidebar-primary/90">
                <Leaf size={28} className="animate-leaf-sway"/> AgriPedia
            </Link>
        ) : (
            <Link href="/" aria-label="AgriPedia Home" className="text-sidebar-primary hover:text-sidebar-primary/90">
                 <Leaf size={28} className="animate-leaf-sway" />
            </Link>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" legacyBehavior passHref>
              <SidebarMenuButton asChild tooltip="Home" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                <a><Home /> <span>Home</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          {/* Removed Home MenuItem */}
          <SidebarMenuItem>
            <Link href="/chat" legacyBehavior passHref>
              <SidebarMenuButton asChild tooltip="Chat with AgriAI" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                <a><MessagesSquare /> <span>Chat AI</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/scan" legacyBehavior passHref>
              <SidebarMenuButton asChild tooltip="Scan Produce" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                <a><ScanLine /> <span>Scan Produce</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/search" legacyBehavior passHref>
              <SidebarMenuButton asChild tooltip="Search" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                <a><Search /> <span>Search</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-4 bg-sidebar-border" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
            <Settings size={16}/> {state === 'expanded' ? 'Settings' : ''}
          </SidebarGroupLabel>
          
          <div className="flex flex-col gap-2 px-2 py-1">
             <div className="flex items-center justify-between p-1 rounded-md hover:bg-sidebar-accent/10"> {/* Ensure this div structure is consistent */}
                <span className="text-sm text-sidebar-foreground flex items-center gap-2">
                    <Palette size={16} className="text-sidebar-primary"/> Theme
                </span>
                <ThemeToggleButton />
            </div>
            {/* Added My Favorites link */}
            <Link href="/settings/favorites" passHref legacyBehavior>
                 <a className="flex items-center gap-2 p-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                    <Heart size={16} className="text-sidebar-primary" />
                    <span>My Favorites</span>
                </a>
            </Link>
          </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-sidebar-border" />

        <SidebarGroup>
             <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
                <Bell size={16}/> {state === 'expanded' ? 'Notifications' : ''}
            </SidebarGroupLabel>
            <NotificationPreferences />
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-sidebar-border" />

        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
                <KeyRound size={16} /> {state === 'expanded' ? 'API Key' : ''}
            </SidebarGroupLabel>
            <div className="p-2">
                <ApiKeyManager />
            </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-sidebar-border" />

        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
                <Users size={16} /> {state === 'expanded' ? 'User Mode' : ''}
            </SidebarGroupLabel>
            <div className="p-2">
                <UserModeSelector />
            </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
            {/* Optional: Add an icon like PackageCheck or DownloadCloud */}
            {state === 'expanded' ? 'App' : ''}
          </SidebarGroupLabel>
          <div className="flex flex-col gap-2 px-2 py-1">
            <InstallPWAButton className="w-full justify-start text-sm !bg-transparent !hover:bg-sidebar-accent !text-sidebar-foreground !hover:text-sidebar-accent-foreground" />
          </div>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}
