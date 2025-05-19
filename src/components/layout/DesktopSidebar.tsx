
'use client';

import Link from 'next/link';
import { Home, Heart, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'; // Assuming this is the correct path to your advanced sidebar
import { useSidebar } from '@/components/ui/sidebar'; // Assuming useSidebar is exported

export default function DesktopSidebar() {
  const { state } = useSidebar(); // To adjust content based on collapsed/expanded

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="p-4 items-center">
        {/* Can add a logo or title here if sidebar is expanded */}
        {state === 'expanded' && <span className="text-lg font-semibold text-primary">AgriPedia</span>}
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
          {/* Example for a future favorites page link */}
          {/* <SidebarMenuItem>
            <Link href="/favorites" legacyBehavior passHref>
              <SidebarMenuButton asChild tooltip="Favorites">
                <a><Heart /> <span>Favorites</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Placeholder for settings or user profile icon if needed */}
        {/* <SidebarMenuButton asChild tooltip="Settings">
          <a><Settings /> <span>Settings</span></a>
        </SidebarMenuButton> */}
      </SidebarFooter>
    </Sidebar>
  );
}
