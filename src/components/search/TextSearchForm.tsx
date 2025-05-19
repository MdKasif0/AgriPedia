
'use client';

import { useState, type FormEvent, useRef, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import type { ProduceInfo } from '@/lib/produceData';

interface TextSearchFormProps {
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: ProduceInfo[];
  isSuggestionsVisible: boolean;
  onSuggestionClick: (item: ProduceInfo) => void;
  onSubmitSearch: (query: string) => void;
  onClearSearch: () => void;
  inputRef?: React.RefObject<HTMLInputElement>; // Added for focusing from parent
}

export default function TextSearchForm({
  query,
  onQueryChange,
  suggestions,
  isSuggestionsVisible,
  onSuggestionClick,
  onSubmitSearch,
  onClearSearch,
  inputRef, // Consuming the ref
}: TextSearchFormProps) {
  // const internalInputRef = useRef<HTMLInputElement>(null); // Keep internal if no external provided, or remove if external always used
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    onSubmitSearch(query);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-2">
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Input
            ref={inputRef} // Use the passed ref
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && onQueryChange(query)} // Re-trigger suggestions visibility if needed
            placeholder="E.g., Apple, Banana, Carrot... (Ctrl+K)"
            className="flex-grow pr-10" 
            aria-label="Search for fruits or vegetables"
            autoComplete="off"
            id="main-search-input" // Adding an ID for potential direct targeting, though ref is preferred
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={onClearSearch}
              aria-label="Clear search query"
            >
              <X size={18} />
            </Button>
          )}
        </div>
        <Button type="submit" variant="default" disabled={!query.trim()}>
          <Search className="mr-2 h-5 w-5" /> Search
        </Button>
      </div>

      {isSuggestionsVisible && suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
        >
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
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
