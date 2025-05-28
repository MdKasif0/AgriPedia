
'use client';

import Link from 'next/link';
import { Leaf, ScanLine, Settings as SettingsIcon, MessagesSquare, Heart } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog'; // Removed DialogHeader, DialogTitle
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn, triggerHapticFeedback } from '@/lib/utils';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import NotificationPreferences from '@/components/NotificationPreferences';
import { Separator } from '@/components/ui/separator';
import ApiKeyManager from '@/components/settings/ApiKeyManager'; // Added ApiKeyManager

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
          isActive ? "text-primary font-semibold" : "text-neutral-400 hover:text-neutral-100"
        )}
        aria-label={label}
        onClick={() => {
          triggerHapticFeedback();
        }}
      >
        <div className={cn("p-1.5 rounded-full transition-all duration-200 ease-in-out", isActive ? "bg-primary/20" : "group-hover:bg-neutral-700/50")}>
          <Icon size={24} className={cn(isActive ? "text-primary" : "text-neutral-400 group-hover:text-neutral-100")} />
        </div>
        <span className={cn("text-xs mt-0.5", isActive ? "text-primary" : "text-neutral-400 group-hover:text-neutral-100")}>
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
    { id: "home", href: "/", icon: Leaf, label: "Home" },
    { id: "chat", href: "/chat", icon: MessagesSquare, label: "Chat AI" },
    {
      id: "scan",
      icon: ScanLine,
      label: "Scan",
      isCentralScan: true,
      onClick: () => setIsScanDialogOpen(true)
    },
    { id: "favorites", href: "/favorites", icon: Heart, label: "Favorites" },
    { id: "settings", icon: SettingsIcon, label: "Settings", onClickSheet: () => setIsSettingsSheetOpen(true) },
  ];

  return (
    <>
      <nav className="fixed inset-x-2 bottom-3 sm:inset-x-4 sm:bottom-3
                      bg-neutral-900/80 backdrop-blur-lg
                      border border-neutral-700/60
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
                  className="flex flex-col items-center justify-center p-1 group focus:outline-none flex-1 transform active:scale-90 transition-transform"
                  aria-label={item.label}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full shadow-md group-hover:bg-orange-600 transition-colors">
                    <item.icon size={26} className="text-white" />
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
                        isSettingsSheetOpen ? "text-primary font-semibold" : "text-neutral-400 hover:text-neutral-100"
                      )}
                      aria-label={item.label}
                    >
                      <div className={cn("p-1.5 rounded-full transition-all duration-200 ease-in-out", isSettingsSheetOpen ? "bg-primary/20" : "group-hover:bg-neutral-700/50")}>
                        <item.icon size={24} className={cn(isSettingsSheetOpen ? "text-primary" : "text-neutral-400 group-hover:text-neutral-100")} />
                      </div>
                      <span className={cn("text-xs mt-0.5", isSettingsSheetOpen ? "text-primary" : "text-neutral-400 group-hover:text-neutral-100")}>
                        {item.label}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-auto max-h-[75vh] flex flex-col rounded-t-2xl
                               bg-card text-card-foreground
                               border-t border-border/50" // Adjusted border
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
        <DialogContent className="w-full h-full p-0 bg-black text-gray-200 sm:max-w-md sm:mx-auto sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:shadow-xl">
          {/* DialogHeader and DialogTitle removed */}
          <ImageUploadForm onSuccessfulScan={() => setIsScanDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
