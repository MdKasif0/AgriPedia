'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { ProduceInfo } from '@/lib/produceData';
import { searchProduce } from '@/lib/produceData'; // Assuming this is client-side safe or you'll call an action

interface TextSearchFormProps {
  onResults: (results: ProduceInfo[]) => void;
}

export default function TextSearchForm({ onResults }: TextSearchFormProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    
    // For now, using client-side search from mock data
    // In a real app, this might call a server action or API route
    const results = searchProduce(query);
    onResults(results);

    // If only one result, directly navigate
    if (results.length === 1) {
      router.push(`/item/${results[0].id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center p-6 bg-card rounded-lg shadow-lg">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="E.g., Apple, Banana, Carrot..."
        className="flex-grow"
        aria-label="Search for fruits or vegetables"
      />
      <Button type="submit" variant="default">
        <Search className="mr-2 h-5 w-5" /> Search
      </Button>
    </form>
  );
}
