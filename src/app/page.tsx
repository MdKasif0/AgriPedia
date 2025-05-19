'use client';

import { useState } from 'react';
import TextSearchForm from '@/components/search/TextSearchForm';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import ProduceCard from '@/components/produce/ProduceCard';
import type { ProduceInfo } from '@/lib/produceData';
import { Separator } from '@/components/ui/separator';
import { Apple, ScanLine } from 'lucide-react'; // Changed Fruit to Apple

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<ProduceInfo[]>([]);

  const handleTextResults = (results: ProduceInfo[]) => {
    setSearchResults(results);
  };

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome to AgriPedia!</h1>
        <p className="text-lg text-muted-foreground">
          Discover detailed information about fruits and vegetables.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2"><Apple className="text-primary" /> Search by Name</h2> {/* Changed Fruit to Apple */}
          <TextSearchForm onResults={handleTextResults} />
        </section>
        <section className="space-y-4">
           <h2 className="text-2xl font-semibold flex items-center gap-2"><ScanLine className="text-primary" /> Scan with Camera</h2>
          <ImageUploadForm />
        </section>
      </div>

      {searchResults.length > 0 && (
        <>
          <Separator className="my-8" />
          <section>
            <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <ProduceCard key={item.id} produce={item} />
              ))}
            </div>
          </section>
        </>
      )}
       <section className="py-8 text-center">
          <p className="text-muted-foreground">
            Use the search bar to find produce by name, or use your camera to identify an item.
          </p>
        </section>
    </div>
  );
}
