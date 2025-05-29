'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function ProduceCardSkeleton() {
  return (
    <div className="block group rounded-2xl">
      <div className="relative aspect-[16/9] w-full bg-card rounded-2xl shadow-lg overflow-hidden">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 flex flex-col justify-between">
          <div>
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="self-end">
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
