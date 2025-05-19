
'use client';

import Link from 'next/link';
import { Leaf, Search, Heart, UserCircle, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface LinkButtonProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentPathname: string;
  isDialog?: boolean;
  onDialogTrigger?: () => void;
}

const LinkButton: React.FC<LinkButtonProps> = ({ href, icon: Icon, label, currentPathname, isDialog, onDialogTrigger }) => {
  const isActive = !isDialog && currentPathname === href;

  const content = (
    <>
      <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/10'}`}>
        <Icon size={22} className={isActive ? 'text-primary-foreground' : 'text-card-foreground/80 group-hover:text-primary'} />
      </div>
      <span className={`text-xs mt-0.5 transition-colors ${isActive ? 'text-primary font-medium' : 'text-card-foreground/70 group-hover:text-primary'}`}>
        {label}
      </span>
    </>
  );

  if (isDialog) {
    return (
      <button
        onClick={onDialogTrigger}
        className="flex flex-col items-center justify-center h-full p-1 sm:p-2 rounded-md transition-colors w-1/4 group"
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} passHref legacyBehavior>
      <a className="flex flex-col items-center justify-center h-full p-1 sm:p-2 rounded-md transition-colors w-1/4 group" aria-label={label}>
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
    { href: "/search", icon: Search, label: "Search", isDialog: true, onDialogTrigger: () => setIsScanDialogOpen(true) }, // Placeholder for a dedicated search page or scan
    { href: "/#favorites-section", icon: Heart, label: "Favorites" },
    { href: "/profile", icon: UserCircle, label: "Profile" }, // Placeholder
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:hidden z-50">
        <div className="mx-auto flex justify-around items-center h-16 max-w-md">
          {navItems.map((item) => (
            <LinkButton
              key={item.label}
              href={item.href}
              icon={item.icon}
              label={item.label}
              currentPathname={pathname}
              isDialog={item.isDialog}
              onDialogTrigger={item.isDialog ? () => setIsScanDialogOpen(true) : undefined}
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
