
'use client';

import Link from 'next/link';
import { Leaf, Heart, ScanLine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href?: string;
  icon: React.ElementType;
  label: string;
  currentPathname: string;
  isCentralScan?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, currentPathname, isCentralScan, onClick }) => {
  const isActive = href && (
    currentPathname === href ||
    (href === "/#favorites-section" && currentPathname === "/" && typeof window !== "undefined" && window.location.hash === "#favorites-section")
  );

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

  if (onClick && !href) { // For buttons like the central scan
    return (
      <button onClick={onClick} className={cn(itemBaseClass, "flex-1")} aria-label={label}>
        {content}
      </button>
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
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Leaf, label: "Discover" },
    { 
      icon: ScanLine, 
      label: "Scan Produce", 
      isCentralScan: true,
      onClick: () => setIsScanDialogOpen(true) 
    },
    { href: "/#favorites-section", icon: Heart, label: "Favorites" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 shadow-lg md:hidden z-50 h-16">
        <div className="mx-auto flex justify-around items-center h-full max-w-md px-2">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              href={item.href}
              icon={item.icon}
              label={item.label}
              currentPathname={pathname}
              isCentralScan={item.isCentralScan}
              onClick={item.onClick}
            />
          ))}
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
