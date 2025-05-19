
'use client';

import Link from 'next/link';
import { Home, Settings, Bell, Palette } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
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
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="p-4 flex items-center justify-between">
        {state === 'expanded' && <span className="text-lg font-semibold text-primary">AgriPedia</span>}
        {/* SidebarTrigger can be placed here if needed, or in a main header */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" legacyBehavior passHref>
              <SidebarMenuButton asChild tooltip="Home">
                <a><Home /> <span>Home</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-4" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Settings size={16}/> {state === 'expanded' ? 'Settings' : ''}
          </SidebarGroupLabel>
          
          <div className="flex flex-col gap-2 px-2 py-1">
             <div className="flex items-center justify-between">
                <span className="text-sm text-sidebar-foreground flex items-center gap-2">
                    <Palette size={16} className="text-sidebar-primary"/> Theme
                </span>
                <ThemeToggleButton />
            </div>
          </div>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
             <SidebarGroupLabel className="flex items-center gap-2">
                <Bell size={16}/> {state === 'expanded' ? 'Notifications' : ''}
            </SidebarGroupLabel>
            <NotificationPreferences />
        </SidebarGroup>


      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto">
        {/* Future settings link or user profile element */}
        {/* <SidebarMenuButton asChild tooltip="Settings">
          <a><Settings /> <span>Settings</span></a>
        </SidebarMenuButton> */}
      </SidebarFooter>
    </Sidebar>
  );
}
