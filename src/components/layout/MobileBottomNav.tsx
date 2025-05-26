'use client';

import Link from 'next/link';
import { Leaf, ScanLine, Settings as SettingsIcon, MessagesSquare, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn, triggerHapticFeedback } from '@/lib/utils';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import NotificationPreferences from '@/components/NotificationPreferences';
import { Separator } from '@/components/ui/separator';

interface NavItemProps {
  href?: string;
  icon: React.ElementType;
  label: string;
  currentPathname: string;
  isCentralScan?: boolean;
  onClick?: () => void;
  isActiveOverride?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, currentPathname, isCentralScan, onClick, isActiveOverride }) => {
  const isActive = isActiveOverride !== undefined ? isActiveOverride : (href && (
    (href === "/" && currentPathname === href) || 
    (href !== "/" && currentPathname.startsWith(href)) 
  ));

  const itemBaseClass = "flex flex-col items-center justify-center p-1 group focus:outline-none transition-colors duration-200";
  const iconSize = isCentralScan ? 30 : 24;

  const iconColor = isActive ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-100';
  const labelColor = isActive ? 'text-primary font-semibold' : 'text-neutral-400 group-hover:text-neutral-100';

  const content = (
    <>
      {isCentralScan ? (
        <div className="flex items-center justify-center w-14 h-14 bg-orange-500 rounded-full shadow-md transform group-hover:scale-110 transition-transform">
          <Icon size={iconSize} className="text-white" />
        </div>
      ) : (
        <Icon size={iconSize} className={cn(iconColor, "mb-0.5")} />
      )}
      {!isCentralScan && (
        <span className={cn("text-xs", labelColor)}>
          {label}
        </span>
      )}
    </>
  );

  const handleItemClick = () => {
    triggerHapticFeedback();
    if (onClick) {
      onClick();
    }
  };

  if (onClick && !href) {
    return (
      <button onClick={handleItemClick} className={cn(itemBaseClass, "flex-1")} aria-label={label}>
        {content}
      </button>
    );
  }

  if (!href && !onClick && label === "Settings") { 
     return (
      <div className={cn(itemBaseClass, "flex-1")} aria-label={label} onClick={triggerHapticFeedback}>
        {content}
      </div>
    );
  }
  
  return (
    <Link href={href!} passHref legacyBehavior>
      <a className={cn(itemBaseClass, "flex-1")} aria-label={label} onClick={triggerHapticFeedback}>
        {content}
      </a>
    </Link>
  );
};


export default function MobileBottomNav() {
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const pathname = usePathname();

  const navItemsConfig = [
    { href: "/", icon: Leaf, label: "Home" },
    { href: "/chat", icon: MessagesSquare, label: "Chat AI" },
    {
      icon: ScanLine,
      label: "Scan Produce",
      isCentralScan: true,
      onClick: () => setIsScanDialogOpen(true)
    },
    { href: "/favorites", icon: Heart, label: "Favorites" }, // Changed href
    { icon: SettingsIcon, label: "Settings", onClickSheet: () => setIsSettingsSheetOpen(true) },
  ];

  return (
    <>
      <nav className="fixed inset-x-2 bottom-3 sm:inset-x-4 sm:bottom-4
                      bg-neutral-900/80 backdrop-blur-lg
                      border border-neutral-700/60
                      shadow-xl rounded-2xl md:hidden z-50 h-16">
        <div className="flex justify-around items-center h-full px-1">
          {navItemsConfig.map((item, index) => {
            if (item.label === "Settings") {
              return (
                <Sheet key={index} open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                        onClick={() => {
                          triggerHapticFeedback();
                          setIsSettingsSheetOpen(true);
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center p-1 group focus:outline-none flex-1 transition-colors duration-200",
                            isSettingsSheetOpen ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-100'
                        )}
                        aria-label={item.label}
                    >
                       <SettingsIcon size={24} className={cn("mb-0.5", isSettingsSheetOpen ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-100')} />
                       <span className={cn("text-xs", isSettingsSheetOpen ? 'text-primary font-semibold' : 'text-neutral-400 group-hover:text-neutral-100')}>
                        {item.label}
                       </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-[60vh] flex flex-col rounded-t-2xl
                               bg-card text-card-foreground
                               border-t border-neutral-700/60"
                  >
                    <SheetHeader className="px-4 pt-4 pb-2">
                      <SheetTitle className="text-card-foreground text-center text-lg">App Settings</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-border/50" />
                    <div className="overflow-y-auto p-4 space-y-6">
                       <div>
                        <h3 className="mb-3 text-md font-medium text-muted-foreground">API Key</h3>
                         {/* Placeholder for ApiKeyManager if it's used here */}
                      </div>
                      <Separator className="bg-border/50" />
                      <div>
                        <h3 className="mb-3 text-md font-medium text-muted-foreground">Theme</h3>
                        <ThemeToggleButton />
                      </div>
                      <Separator className="bg-border/50" />
                      <div>
                        <h3 className="mb-3 text-md font-medium text-muted-foreground">Notifications</h3>
                        <NotificationPreferences />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }
            return (
              <NavItem
                key={index}
                href={item.href}
                icon={item.icon}
                label={item.label}
                currentPathname={pathname}
                isCentralScan={item.isCentralScan}
                onClick={item.onClick}
                isActiveOverride={item.label === "Settings" ? isSettingsSheetOpen : undefined}
              />
            );
          })}
        </div>
      </nav>
      <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-card-foreground">
              <ScanLine className="text-primary" /> Scan Produce
            </DialogTitle>
          </DialogHeader>
          <ImageUploadForm onSuccessfulScan={() => setIsScanDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
