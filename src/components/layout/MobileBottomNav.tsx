
'use client';

import Link from 'next/link';
import { Home, ScanLine, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import { useState } from 'react';

export default function MobileBottomNav() {
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-md md:hidden z-50">
      <div className="container mx-auto flex justify-around items-center h-16">
        <Link href="/" passHref>
          <Button variant="ghost" className="flex flex-col items-center h-full p-2 text-primary hover:text-accent">
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Button>
        </Link>
        
        <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center h-full p-2 text-primary hover:text-accent">
              <ScanLine size={24} />
              <span className="text-xs mt-1">Scan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ScanLine className="text-primary"/> Scan Produce
              </DialogTitle>
            </DialogHeader>
            <ImageUploadForm />
          </DialogContent>
        </Dialog>

        {/* Link to favorites section on homepage for now */}
        <Link href="/#favorites-section" passHref>
           <Button variant="ghost" className="flex flex-col items-center h-full p-2 text-primary hover:text-accent">
            <Heart size={24} />
            <span className="text-xs mt-1">Favorites</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
