
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TextSearchForm from '@/components/search/TextSearchForm';
import ImageUploadForm from '@/components/search/ImageUploadForm';
import ProduceCard from '@/components/produce/ProduceCard';
import type { ProduceInfo } from '@/lib/produceData';
import { searchProduce, getUniqueRegions, getUniqueSeasons, getAllProduce } from '@/lib/produceData';
import { Separator } from '@/components/ui/separator';
import { Apple, ScanLine, Filter, ListFilter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProduceInfo[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  
  const [searchResults, setSearchResults] = useState<ProduceInfo[]>([]);
  const [initialLoad, setInitialLoad] = useState(true); // To control initial display

  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchFormRef = useRef<HTMLDivElement>(null); // Ref for the search form area

  useEffect(() => {
    setAvailableRegions(getUniqueRegions());
    setAvailableSeasons(getUniqueSeasons());
    // Initially display all produce items or a curated list
    // For now, let's clear search results to match previous behavior of showing only after search
    // setSearchResults(getAllProduce()); 
    setInitialLoad(false);
  }, []);

  const updateFilteredResults = useCallback((query: string, region: string, season: string) => {
    const results = searchProduce(query, { 
      region: region === 'all' ? undefined : region, 
      season: season === 'all' ? undefined : season 
    });
    setSearchResults(results);
    setInitialLoad(false); // Results are from a search/filter action
  }, []);

  useEffect(() => {
    // This effect runs when query, region, or season changes to update results.
    // Avoid running on initial empty query unless a filter is set.
    if (!initialLoad) {
       updateFilteredResults(searchQuery, selectedRegion, selectedSeason);
    }
  }, [searchQuery, selectedRegion, selectedSeason, updateFilteredResults, initialLoad]);


  const handleQueryChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    if (newQuery.trim()) {
      // Debounce suggestion fetching slightly
      suggestionsTimeoutRef.current = setTimeout(() => {
        const currentSuggestions = searchProduce(newQuery.trim(), {}); // Suggestions based on query only
        setSuggestions(currentSuggestions);
        setIsSuggestionsVisible(true);
      }, 150);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
      // If query is cleared, re-evaluate results based on filters only
      updateFilteredResults("", selectedRegion, selectedSeason);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    updateFilteredResults("", selectedRegion, selectedSeason); // Update results with no query
  };

  const handleSuggestionClick = (item: ProduceInfo) => {
    setSearchQuery(item.commonName);
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    // Directly navigate, as this is a specific selection
    router.push(`/item/${item.id}`);
  };

  const handleSubmitSearch = (submittedQuery: string) => {
    setSearchQuery(submittedQuery); // Ensure query state is updated
    setIsSuggestionsVisible(false);
    // updateFilteredResults will be triggered by the useEffect watching searchQuery
    // If there's a single exact match, consider navigating directly.
    const results = searchProduce(submittedQuery, {
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      season: selectedSeason === 'all' ? undefined : selectedSeason
    });
    if (results.length === 1 && results[0].commonName.toLowerCase() === submittedQuery.toLowerCase()) {
      router.push(`/item/${results[0].id}`);
    } else {
       setSearchResults(results); // Update searchResults for display
    }
  };

  // Close suggestions when clicking outside
   useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target as Node)) {
        setIsSuggestionsVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);


  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome to AgriPedia!</h1>
        <p className="text-lg text-muted-foreground">
          Discover detailed information about fruits and vegetables.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <section className="space-y-4 md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                <Apple className="text-primary" /> Search Produce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" ref={searchFormRef}>
              <TextSearchForm
                query={searchQuery}
                onQueryChange={handleQueryChange}
                suggestions={suggestions}
                isSuggestionsVisible={isSuggestionsVisible}
                onSuggestionClick={handleSuggestionClick}
                onSubmitSearch={handleSubmitSearch}
                onClearSearch={handleClearSearch}
              />
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="region-filter" className="block text-sm font-medium text-foreground mb-1">Filter by Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger id="region-filter" className="w-full">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {availableRegions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="season-filter" className="block text-sm font-medium text-foreground mb-1">Filter by Season</label>
                  <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                    <SelectTrigger id="season-filter" className="w-full">
                      <SelectValue placeholder="All Seasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Seasons</SelectItem>
                      {availableSeasons.map(season => (
                        <SelectItem key={season} value={season}>{season}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                <ScanLine className="text-primary" /> Scan with Camera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploadForm />
            </CardContent>
          </Card>
        </section>
      </div>

      {(!initialLoad && searchResults.length > 0) && (
        <>
          <Separator className="my-8" />
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><ListFilter className="text-primary"/>Filtered Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <ProduceCard key={item.id} produce={item} />
              ))}
            </div>
          </section>
        </>
      )}

      {(!initialLoad &&searchResults.length === 0 && (searchQuery.trim() !== '' || selectedRegion !== 'all' || selectedSeason !== 'all')) && (
        <>
          <Separator className="my-8" />
          <section className="text-center py-8">
            <p className="text-muted-foreground text-lg">
              No produce found matching your search query and filters.
            </p>
          </section>
        </>
      )}
      
       <section className="py-8 text-center">
          <p className="text-muted-foreground">
            Use the search bar and filters to find produce, or use your camera to identify an item.
          </p>
        </section>
    </div>
  );
}

