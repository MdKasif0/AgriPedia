
'use client';

import Link from 'next/link';
import { Home, Settings, Bell, Palette, Leaf } from 'lucide-react'; // Added Leaf
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarFooter, // Temporarily remove if not used
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import NotificationPreferences from '@/components/NotificationPreferences';

export default function DesktopSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4 flex items-center justify-between">
        {state === 'expanded' ? (
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-sidebar-primary hover:text-sidebar-primary/90">
                <Leaf size={28}/> AgriPedia
            </Link>
        ) : (
            <Link href="/" aria-label="AgriPedia Home">
                 <Leaf size={28} className="text-sidebar-primary"/>
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
          {/* Add other primary navigation items here if needed */}
        </SidebarMenu>

        <SidebarSeparator className="my-4 bg-sidebar-border" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
            <Settings size={16}/> {state === 'expanded' ? 'Settings' : ''}
          </SidebarGroupLabel>
          
          <div className="flex flex-col gap-2 px-2 py-1">
             <div className="flex items-center justify-between p-1 rounded-md hover:bg-sidebar-accent/10">
                <span className="text-sm text-sidebar-foreground flex items-center gap-2">
                    <Palette size={16} className="text-sidebar-primary"/> Theme
                </span>
                <ThemeToggleButton />
            </div>
          </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-sidebar-border" />

        <SidebarGroup>
             <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
                <Bell size={16}/> {state === 'expanded' ? 'Notifications' : ''}
            </SidebarGroupLabel>
            <NotificationPreferences />
        </SidebarGroup>

      </SidebarContent>
      {/* <SidebarFooter className="p-2 mt-auto">
        Footer content if any
      </SidebarFooter> */}
    </Sidebar>
  );
}
