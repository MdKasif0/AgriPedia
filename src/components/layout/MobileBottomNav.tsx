
'use client';

import Link from 'next/link';
import { Leaf, Heart, ScanLine, Settings as SettingsIcon } from 'lucide-react'; // Renamed Settings to SettingsIcon
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  isActiveOverride?: boolean; // For settings sheet trigger
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, currentPathname, isCentralScan, onClick, isActiveOverride }) => {
  const isActive = isActiveOverride !== undefined ? isActiveOverride : (href && (
    currentPathname === href ||
    (href === "/#favorites-section" && currentPathname === "/" && typeof window !== "undefined" && window.location.hash === "#favorites-section")
  ));

  const itemBaseClass = "flex flex-col items-center justify-center p-1 group focus:outline-none";
  const iconSize = isCentralScan ? 30 : 24;
  const iconColor = isActive ? 'text-black' : 'text-gray-500';
  const labelColor = isActive ? 'text-black font-semibold' : 'text-gray-500';

  const content = (
    <>
      {isCentralScan ? (
        <div className="flex items-center justify-center w-14 h-14 bg-orange-500 rounded-full shadow-md transform group-hover:scale-110 transition-transform">
          <Icon size={iconSize} className="text-white" />
        </div>
      ) : (
        <Icon size={iconSize} className={cn(iconColor, "mb-0.5 group-hover:text-black transition-colors")} />
      )}
      {!isCentralScan && (
        <span className={cn("text-xs", labelColor, "group-hover:text-black transition-colors")}>
          {label}
        </span>
      )}
    </>
  );

  if (onClick && !href) { // For buttons like scan or settings trigger
    return (
      <button onClick={onClick} className={cn(itemBaseClass, "flex-1")} aria-label={label}>
        {content}
      </button>
    );
  }
  
  // For SheetTrigger wrapped NavItem (Settings)
  if (!href && !onClick && label === "Settings") {
     return (
      <div className={cn(itemBaseClass, "flex-1")} aria-label={label}>
        {content}
      </div>
    );
  }


  return (
    <Link href={href!} passHref legacyBehavior>
      <a className={cn(itemBaseClass, "flex-1")} aria-label={label}>
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
    { href: "/", icon: Leaf, label: "Discover" },
    { 
      icon: ScanLine, 
      label: "Scan Produce", 
      isCentralScan: true,
      onClick: () => setIsScanDialogOpen(true) 
    },
    { href: "/#favorites-section", icon: Heart, label: "Favorites" },
    { icon: SettingsIcon, label: "Settings", onClickSheet: () => setIsSettingsSheetOpen(true) }, // Special handling for sheet
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 shadow-lg md:hidden z-50 h-16">
        <div className="mx-auto flex justify-around items-center h-full max-w-md px-2">
          {navItemsConfig.map((item, index) => {
            if (item.label === "Settings") {
              return (
                <Sheet key={index} open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
                  <SheetTrigger asChild>
                    {/* The NavItem itself will be the trigger content. Pass isActive for styling. */}
                    <button className="flex flex-col items-center justify-center p-1 group focus:outline-none flex-1" aria-label={item.label}>
                       <SettingsIcon size={24} className={cn(isSettingsSheetOpen ? 'text-black' : 'text-gray-500', "mb-0.5 group-hover:text-black transition-colors")} />
                       <span className={cn("text-xs", isSettingsSheetOpen ? 'text-black font-semibold' : 'text-gray-500', "group-hover:text-black transition-colors")}>
                        {item.label}
                       </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[60vh] flex flex-col rounded-t-2xl bg-card text-card-foreground">
                    <SheetHeader className="px-4 pt-4 pb-2">
                      <SheetTitle className="text-card-foreground text-center text-lg">App Settings</SheetTitle>
                    </SheetHeader>
                    <Separator className="bg-border/50" />
                    <div className="overflow-y-auto p-4 space-y-6">
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
          <ImageUploadForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
