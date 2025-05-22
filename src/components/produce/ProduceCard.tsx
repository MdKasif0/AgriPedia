
import Link from 'next/link';
import Image from 'next/image';
import type { ProduceInfo } from '@/lib/produceData';
import { ChevronRight } from 'lucide-react';

interface ProduceCardProps {
  produce: ProduceInfo;
}

export default function ProduceCard({ produce }: ProduceCardProps) {
  // Generate a 1 or 2 word hint from the common name
  const commonNameWords = produce.commonName.toLowerCase().split(' ');
  const hint = commonNameWords.slice(0, 2).join(' ');

  return (
    <Link href={`/item/${produce.id}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
      <div className="relative aspect-[16/9] w-full bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <Image 
          src={produce.image} 
          alt={produce.commonName} 
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          data-ai-hint={hint} 
          className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 flex flex-col justify-between">
          {/* Top-left text overlay */}
          <div>
            <h3 className="text-xl font-bold text-white drop-shadow-md">{produce.commonName}</h3>
            <p className="text-sm text-gray-200 drop-shadow-md">({produce.scientificName})</p>
          </div>

          {/* Bottom-right "See Details" button overlay */}
          <div className="self-end">
            <div className="inline-flex items-center gap-1 px-4 py-2 bg-white/80 backdrop-blur-sm text-primary font-medium rounded-full text-sm shadow-md group-hover:bg-white group-hover:text-primary/90 transition-colors">
              <span>See Details</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
