
'use client';

import Link from 'next/link';
import { Home, Leaf, ScanLine, Settings as SettingsIcon, MessagesSquare, Heart, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog'; // Added DialogTitle and DialogClose
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn, triggerHapticFeedback } from '@/lib/utils';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import NotificationPreferences from '@/components/NotificationPreferences';
import { Separator } from '@/components/ui/separator';
import ApiKeyManager from '@/components/settings/ApiKeyManager';
import UserModeSelector from '@/components/settings/UserModeSelector';
import InstallPWAButton from '@/components/pwa/InstallPWAButton';

interface NavItemProps {
  href?: string;
  icon: React.ElementType;
  label: string;
  currentPathname: string;
  isCentralScan?: boolean;
  onClick?: () => void;
  isActiveOverride?: boolean;
}

const NavItemLink: React.FC<Omit<NavItemProps, 'isCentralScan' | 'onClick' | 'isActiveOverride'>> = ({ href, icon: Icon, label, currentPathname }) => {
  const isActive = (href === "/" && currentPathname === href) || (href !== "/" && currentPathname.startsWith(href!));
  return (
    <Link href={href!} passHref legacyBehavior>
      <a
        className={cn(
          "flex flex-col items-center justify-center p-1 group focus:outline-none flex-1 transition-all duration-200 ease-in-out transform active:scale-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-md", // Added focus ring, offset uses card bg
          isActive ? "text-accent-emerald font-semibold" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={label}
        onClick={() => {
          triggerHapticFeedback();
        }}
      >
        <div className={cn(
            "p-1.5 rounded-full transition-all duration-200 ease-in-out",
            isActive ? "bg-accent-emerald/20 shadow-[0_0_15px_5px_rgba(0,195,122,0.2)]" : "group-hover:bg-muted/50" // Added glow to active
        )}>
          <Icon size={24} className={cn(isActive ? "text-accent-emerald" : "text-muted-foreground group-hover:text-foreground")} /> {/* Use accent-emerald for active icon */}
        </div>
        <span className={cn("text-xs mt-0.5", isActive ? "text-accent-emerald font-semibold" : "text-muted-foreground group-hover:text-foreground")}> {/* Use accent-emerald for active text */}
          {label}
        </span>
      </a>
    </Link>
  );
};


export default function MobileBottomNav() {
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const pathname = usePathname();

  const navItemsConfig = [
    { id: "home", href: "/", icon: Home, label: "Home" },
    // { id: "home", href: "/", icon: Leaf, label: "Home" }, // Removed Home
    { id: "chat", href: "/chat", icon: MessagesSquare, label: "Chat AI" },
    {
      id: "scan",
      icon: ScanLine,
      label: "Scan",
      isCentralScan: true,
      onClick: () => setIsScanDialogOpen(true)
    },
    // Changed favorites to search
    { id: "search", href: "/search", icon: Search, label: "Search" },
    { id: "settings", icon: SettingsIcon, label: "Settings", onClickSheet: () => setIsSettingsSheetOpen(true) },
  ];

  return (
    <>
      <nav className="fixed inset-x-2 bottom-3 sm:inset-x-4 sm:bottom-3
                      bg-card/80 backdrop-blur-lg
                      border border-border/60
                      shadow-xl rounded-2xl md:hidden z-50 h-16">
        <div className="flex justify-around items-center h-full px-1">
          {navItemsConfig.map((item) => {
            if (item.isCentralScan) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHapticFeedback();
                    item.onClick?.();
                  }}
                  className="flex flex-col items-center justify-center p-1 group focus:outline-none flex-1 transform active:scale-90 transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-full"
                  aria-label={item.label}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-accent-emerald text-white rounded-full shadow-md group-hover:bg-accent-emerald/90 transition-colors"> {/* Changed to emerald, added text-white */}
                    <item.icon size={26} className="text-accent-foreground" />
                  </div>
                </button>
              );
            }
            if (item.id === "settings") {
              return (
                <Sheet key={item.id} open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      onClick={() => {
                        triggerHapticFeedback();
                        setIsSettingsSheetOpen(true);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-1 group focus:outline-none flex-1 transition-all duration-200 ease-in-out transform active:scale-90",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-md", // Added focus ring
                        isSettingsSheetOpen ? "text-accent-emerald font-semibold" : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-label={item.label}
                    >
                      <div className={cn(
                        "p-1.5 rounded-full transition-all duration-200 ease-in-out",
                        isSettingsSheetOpen ? "bg-accent-emerald/20 shadow-[0_0_15px_5px_rgba(0,195,122,0.2)]" : "group-hover:bg-muted/50"
                      )}>
                        <item.icon size={24} className={cn(isSettingsSheetOpen ? "text-accent-emerald" : "text-muted-foreground group-hover:text-foreground")} />
                      </div>
                      <span className={cn("text-xs mt-0.5", isSettingsSheetOpen ? "text-accent-emerald font-semibold" : "text-muted-foreground group-hover:text-foreground")}> {/* Use accent-emerald for active text */}
                        {item.label}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-auto max-h-[75vh] flex flex-col rounded-t-2xl
                               bg-card text-card-foreground
                               border-t border-border/50"
                  >
                    <SheetHeader className="px-4 pt-4 pb-2 text-center">
                      <SheetTitle className="text-card-foreground text-lg">App Settings</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-border/50 mb-2" />
                    <div className="overflow-y-auto p-4 space-y-6">
                       <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">API Key</h3>
                        <ApiKeyManager />
                      </div>
                      <Separator className="bg-border/50" />
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Theme</h3>
                        <ThemeToggleButton />
                      </div>
                      <Separator className="bg-border/50" />
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Notifications</h3>
                        <NotificationPreferences />
                      </div>
                      <Separator className="bg-border/50" />
                       <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">User Mode</h3>
                        <UserModeSelector />
                      </div>
                      <Separator className="bg-border/50" />
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">General</h3>
                        <Link href="/settings/favorites" passHref>
                          <button
                            className="w-full flex items-center justify-start px-3 py-2 text-sm text-card-foreground hover:bg-muted rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card" // Added focus ring, offset uses card bg from sheet
                            onClick={() => {
                              triggerHapticFeedback();
                              setIsSettingsSheetOpen(false); // Close sheet on click
                            }}
                          >
                            <Heart size={18} className="mr-2 text-accent-emerald" /> {/* Changed to accent-emerald */}
                            My Favorites
                          </button>
                        </Link>
                      </div>
                      <Separator className="bg-border/50" />
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Install AgriPedia</h3>
                        <InstallPWAButton className="w-full" />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }
            return (
              <NavItemLink
                key={item.id}
                href={item.href}
                icon={item.icon}
                label={item.label}
                currentPathname={pathname}
              />
            );
          })}
        </div>
      </nav>
      <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
        <DialogContent className="p-0 bg-black text-gray-200 max-w-full w-full h-full sm:max-w-md sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:shadow-xl overflow-hidden">
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">Scan or Upload Produce Image</DialogTitle>
          <ImageUploadForm
            onSuccessfulScan={() => setIsScanDialogOpen(false)}
            onCloseDialog={() => setIsScanDialogOpen(false)}
          />
          <DialogClose className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}
