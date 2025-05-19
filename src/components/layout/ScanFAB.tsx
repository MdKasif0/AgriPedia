
'use client';

import { useState } from 'react';
import { Camera, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUploadForm from '@/components/search/ImageUploadForm';

export default function ScanFAB() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 rounded-full w-16 h-16 shadow-xl z-40"
          aria-label="Scan Produce"
        >
          <Camera size={28} />
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
  );
}
