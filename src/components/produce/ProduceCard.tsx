import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProduceInfo } from '@/lib/produceData';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProduceCardProps {
  produce: ProduceInfo;
}

export default function ProduceCard({ produce }: ProduceCardProps) {
  return (
    <Link href={`/item/${produce.id}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
      <Card className="h-full flex flex-col bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="relative w-full h-40 sm:h-48 mb-3 rounded-lg overflow-hidden">
            <Image 
              src={produce.image} 
              alt={produce.commonName} 
              fill 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              data-ai-hint={`${produce.commonName.toLowerCase()} fruit vegetable`} 
              className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
          </div>
          <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">{produce.commonName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">{produce.scientificName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-2">
          <p className="text-sm text-card-foreground/80 line-clamp-3 mb-3">{produce.description}</p>
        </CardContent>
        <div className="p-4 pt-0 mt-auto">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors"
            // Making the whole card clickable, so this button is more for visual cue
            // It doesn't need its own separate click handler here.
            asChild={false} // Important: if Link wraps Card, Button should not be asChild for Link's behavior
            tabIndex={-1} // Prevents tabbing to this if card is focusable
          >
            View Details <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      </Card>
    </Link>
  );
}
