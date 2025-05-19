import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProduceInfo } from '@/lib/produceData';
import { ChevronRight } from 'lucide-react';

interface ProduceCardProps {
  produce: ProduceInfo;
}

export default function ProduceCard({ produce }: ProduceCardProps) {
  return (
    <Link href={`/item/${produce.id}`} className="block hover:shadow-2xl transition-shadow duration-200 rounded-xl group">
      <Card className="h-full flex flex-col bg-card text-card-foreground rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="p-4">
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
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
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{produce.commonName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{produce.scientificName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">{produce.description}</p>
        </CardContent>
        <div className="p-4 pt-2 flex justify-end items-center text-sm text-primary group-hover:underline">
          View Details <ChevronRight size={18} className="ml-1" />
        </div>
      </Card>
    </Link>
  );
}
