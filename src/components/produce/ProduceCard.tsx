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
    <Link href={`/item/${produce.id}`} className="block hover:shadow-xl transition-shadow duration-200 rounded-lg">
      <Card className="h-full flex flex-col group">
        <CardHeader>
          <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
            <Image 
              src={produce.image} 
              alt={produce.commonName} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              data-ai-hint={`${produce.commonName.toLowerCase()} fruit vegetable`} 
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <CardTitle className="text-xl text-primary group-hover:text-accent transition-colors">{produce.commonName}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{produce.scientificName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm line-clamp-3">{produce.description}</p>
        </CardContent>
        <div className="p-6 pt-0 flex justify-end items-center text-sm text-primary group-hover:text-accent transition-colors">
          View Details <ChevronRight size={18} className="ml-1" />
        </div>
      </Card>
    </Link>
  );
}
