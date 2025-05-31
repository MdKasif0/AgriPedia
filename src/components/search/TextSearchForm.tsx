
'use client';

import { type FormEvent, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import type { ProduceInfo } from '@/lib/produceData';
import ClientOnly from '@/components/ClientOnly';


interface TextSearchFormProps {
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: ProduceInfo[];
  isSuggestionsVisible: boolean;
  onSuggestionClick: (item: ProduceInfo) => void;
  onSubmitSearch: (query: string) => void;
  onClearSearch: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onFocus?: () => void; 
}

export default function TextSearchForm({
  query,
  onQueryChange,
  suggestions,
  isSuggestionsVisible,
  onSuggestionClick,
  onSubmitSearch,
  onClearSearch,
  inputRef,
  onFocus, 
}: TextSearchFormProps) {
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitSearch(query);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };
  
  const disabledSearchButtonFallback = (
    <Button type="submit" variant="default" className="rounded-lg" disabled={true}>
      <Search className="mr-2 h-5 w-5" /> Search
    </Button>
  );

  return (
    <form onSubmit={handleSubmit} className="relative space-y-2">
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={onFocus} 
            placeholder="E.g., Apple, Banana... (Ctrl/Cmd + K)"
            className="flex-grow pr-10 rounded-lg bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-1 focus:ring-accent-emerald transition-colors duration-200 ease-in-out"
            aria-label="Search for fruits or vegetables"
            autoComplete="off"
            id="main-search-input"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
              onClick={onClearSearch}
              aria-label="Clear search query"
            >
              <X size={18} />
            </Button>
          )}
        </div>
        {/* ClientOnly wrapper removed as search button is always enabled now */}
        <Button type="submit" variant="default" className="rounded-lg bg-accent-emerald text-white hover:bg-accent-emerald/90 transition-colors duration-200 ease-in-out">
          <Search className="mr-2 h-5 w-5" /> Search
        </Button>
      </div>

      {isSuggestionsVisible && suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          className="absolute z-10 w-full bg-card border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
        >
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-accent-emerald/10 hover:text-accent-emerald text-sm text-foreground transition-colors duration-200 ease-in-out"
                onClick={() => onSuggestionClick(item)}
              >
                {item.commonName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
