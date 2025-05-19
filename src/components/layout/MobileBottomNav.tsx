
'use client';

import Link from 'next/link';
import { Home, ScanLine, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';
import { usePathname } from 'next/navigation'; // To highlight active link

export default function MobileBottomNav() {
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const pathname = usePathname();

  const linkClasses = "flex flex-col items-center justify-center h-full p-2 rounded-md transition-colors";
  const activeClasses = "text-primary bg-primary/10"; // Active link style: primary color text, subtle background
  const inactiveClasses = "text-card-foreground/70 hover:text-primary hover:bg-primary/5";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:hidden z-50">
      <div className="container mx-auto flex justify-around items-center h-16">
        <Link href="/" passHref>
          <Button 
            variant="ghost" 
            className={`${linkClasses} ${pathname === '/' ? activeClasses : inactiveClasses}`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Button>
        </Link>
        
        <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className={`${linkClasses} ${inactiveClasses}`}>
              <ScanLine size={24} />
              <span className="text-xs mt-1">Scan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-card-foreground">
                <ScanLine className="text-primary"/> Scan Produce
              </DialogTitle>
            </DialogHeader>
            <ImageUploadForm />
          </DialogContent>
        </Dialog>

        <Link href="/#favorites-section" passHref>
           <Button 
            variant="ghost" 
            className={`${linkClasses} ${pathname.includes('#favorites-section') ? activeClasses : inactiveClasses}`}
          >
            <Heart size={24} />
            <span className="text-xs mt-1">Favorites</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
