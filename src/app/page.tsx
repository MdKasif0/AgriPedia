
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ProduceCard from '@/components/produce/ProduceCard';
import type { ProduceInfo } from '@/lib/produceData';
import { searchProduce, getUniqueRegions, getUniqueSeasons, getAllProduce, getInSeasonProduce } from '@/lib/produceData';
import { getFavoriteIds, addRecentSearch } from '@/lib/userDataStore';
import { Separator } from '@/components/ui/separator';
import { Apple, ListFilter, Heart, Search, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InfoBanner from '@/components/home/InfoBanner';
import { fetchDynamicAgriTip } from '@/app/actions';
import ClientOnly from '@/components/ClientOnly';
import { triggerHapticFeedback } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Ensure useToast is imported

// Dynamically import TextSearchForm
const TextSearchForm = dynamic(() => import('@/components/search/TextSearchForm'), {
  ssr: false, // Ensure it's only client-side
  loading: () => <SearchFormFallback />, // Provide a loading component
});

function SearchFormFallback() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-10 bg-muted rounded-lg flex-grow"></div>
      <div className="h-10 w-24 bg-muted rounded-lg"></div>
      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        <div className="h-10 bg-muted rounded-lg"></div>
        <div className="h-10 bg-muted rounded-lg"></div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProduceInfo[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);

  const [searchResults, setSearchResults] = useState<ProduceInfo[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const [favoriteProduceItems, setFavoriteProduceItems] = useState<ProduceInfo[]>([]);
  const [seasonalSuggestions, setSeasonalSuggestions] = useState<ProduceInfo[]>([]);

  const [dynamicTip, setDynamicTip] = useState<string>("Did you know? Apples float because 25% of their volume is air!");
  const [isTipLoading, setIsTipLoading] = useState<boolean>(true);
  const [tipError, setTipError] = useState<string | null>(null);

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [vapidKeyConfigured, setVapidKeyConfigured] = useState(false);

  const VAPID_PUBLIC_KEY_PLACEHOLDER = 'YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME';


  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (key && key !== VAPID_PUBLIC_KEY_PLACEHOLDER) {
      setVapidKeyConfigured(true);
    } else {
      setVapidKeyConfigured(false);
    }
  }, []);

  useEffect(() => {
    const loadTip = async () => {
      setIsTipLoading(true);
      setTipError(null);
      try {
        const tip = await fetchDynamicAgriTip();
        if (tip) {
          setDynamicTip(tip);
        } else {
          setTipError("Could not load a fresh tip today!");
          setDynamicTip("Discover amazing facts about your food!");
        }
      } catch (error) {
        console.error("Error fetching tip:", error);
        setTipError("Failed to fetch a tip.");
        setDynamicTip("Explore interesting food facts!");
      } finally {
        setIsTipLoading(false);
      }
    };
    loadTip();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loadUserData = useCallback(() => {
    const favIds = getFavoriteIds();
    const allCurrentProduce = getAllProduce();
    setFavoriteProduceItems(favIds.map(id => allCurrentProduce.find(p => p.id === id)).filter(Boolean) as ProduceInfo[]);
    setSeasonalSuggestions(getInSeasonProduce(5)); 
  }, []);

  const updateFilteredResults = useCallback((query: string, region: string, season: string) => {
    const results = searchProduce(query, {
      region: region === 'all' ? undefined : region,
      season: season === 'all' ? undefined : season
    });
    setSearchResults(results);
  }, []);

  useEffect(() => {
    setAvailableRegions(getUniqueRegions());
    setAvailableSeasons(getUniqueSeasons());
    loadUserData();
    updateFilteredResults('', 'all', 'all');
    setInitialLoad(false);
  }, [loadUserData, updateFilteredResults]);

  useEffect(() => {
    if (!initialLoad) {
      updateFilteredResults(searchQuery, selectedRegion, selectedSeason);
    }
  }, [searchQuery, selectedRegion, selectedSeason, initialLoad, updateFilteredResults]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    if (newQuery.trim()) {
      suggestionsTimeoutRef.current = setTimeout(() => {
        const currentSuggestions = searchProduce(newQuery.trim(), {});
        setSuggestions(currentSuggestions);
        setIsSuggestionsVisible(true);
      }, 150);
    } else {
      setSuggestions(seasonalSuggestions);
      setIsSuggestionsVisible(true);
    }
  }, [seasonalSuggestions]); 

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions(seasonalSuggestions); 
    setIsSuggestionsVisible(true); 
    searchInputRef.current?.focus();
    triggerHapticFeedback();
  }, [seasonalSuggestions]);

  const handleSuggestionClick = useCallback((item: ProduceInfo) => {
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    addRecentSearch(item.commonName);
    loadUserData(); 
    triggerHapticFeedback();
    router.push(`/item/${item.id.toLowerCase().replace(/\s+/g, '-')}`);
  }, [loadUserData, router]);

  const handleSubmitSearch = useCallback((submittedQuery: string) => {
    setIsSuggestionsVisible(false);
    if (submittedQuery.trim()) {
        addRecentSearch(submittedQuery);
        loadUserData(); 
    }
    const results = searchProduce(submittedQuery, {
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      season: selectedSeason === 'all' ? undefined : selectedSeason
    });
    if (results.length === 1 && results[0].commonName.toLowerCase() === submittedQuery.toLowerCase()) {
      router.push(`/item/${results[0].id.toLowerCase().replace(/\s+/g, '-')}`);
    }
  }, [loadUserData, router, selectedRegion, selectedSeason]);


  const handleNotificationSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotificationStatus('Push notifications are not supported by your browser.');
      return;
    }
    if (!vapidKeyConfigured) {
        setNotificationStatus('Notifications not configured by site admin (VAPID key missing).');
        console.error('VAPID public key is not configured or is the placeholder.');
        toast({
          title: 'Setup Incomplete',
          description: 'Push notifications are not fully configured for this site yet.',
          variant: 'destructive'
        });
        return;
    }

    setIsSubscribing(true);
    setNotificationStatus('Processing...');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotificationStatus('Notification permission denied.');
        setIsSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey || vapidKey === VAPID_PUBLIC_KEY_PLACEHOLDER) {
          throw new Error('VAPID public key is not configured.');
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
      }
      
      console.log('Push subscription:', subscription);
      toast({
        title: 'Subscribed!',
        description: 'You are now subscribed to notifications.',
      });
      setNotificationStatus('Subscribed to notifications successfully!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setNotificationStatus("Error: " + errorMessage);
      toast({
        title: 'Subscription Failed',
        description: "Error: " + errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubscribing(false);
    }
  };

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
  }, []); // Added semicolon

  // Removed unused handleFocusSearch useCallback hook
  
  return (
    <div className="space-y-8 py-6">
      <ClientOnly fallback={<div className="h-24 bg-muted rounded-xl animate-pulse"></div>}>
        <InfoBanner
          title="AgriPedia Tip!"
          description={isTipLoading ? "Loading a fresh tip..." : tipError || dynamicTip}
          icon={isTipLoading ? Loader2 : (tipError ? AlertTriangle : Info)}
          iconProps={isTipLoading ? {className: "animate-spin"} : {}}
          className="bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-xl shadow-lg"
        />
      </ClientOnly>

      <div className="grid md:grid-cols-1 gap-8 items-start">
        <section className="space-y-4">
          <ClientOnly fallback={<SearchFormFallback />}>
            <Card className="shadow-xl rounded-2xl bg-card text-card-foreground">
              <CardHeader className="p-6">
                <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-card-foreground">
                  <Search className="text-primary" /> Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0" ref={searchFormRef}>
                <TextSearchForm
                    query={searchQuery}
                    onQueryChange={handleQueryChange}
                    suggestions={suggestions}
                    isSuggestionsVisible={isSuggestionsVisible}
                    onSuggestionClick={handleSuggestionClick}
                    onSubmitSearch={handleSubmitSearch}
                    onClearSearch={handleClearSearch}
                    inputRef={searchInputRef}
                />
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label htmlFor="region-filter" className="block text-sm font-medium text-card-foreground mb-1">Filter by Region</label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger id="region-filter" className="w-full rounded-lg bg-input border-border text-card-foreground">
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-popover text-popover-foreground border-border">
                        <SelectItem value="all">All Regions</SelectItem>
                        {availableRegions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="season-filter" className="block text-sm font-medium text-card-foreground mb-1">Filter by Season</label>
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                      <SelectTrigger id="season-filter" className="w-full rounded-lg bg-input border-border text-card-foreground">
                        <SelectValue placeholder="All Seasons" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-popover text-popover-foreground border-border">
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
          </ClientOnly>
        </section>
      </div>

      {(searchResults.length > 0) && (
        <>
          <Separator className="my-8 bg-border/20" />
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground">
              <ListFilter className="text-primary"/>
              {searchQuery || selectedRegion !== 'all' || selectedSeason !== 'all' ? 'Filtered Results' : 'All Produce'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((item) => (
                <ProduceCard key={item.id} produce={item} />
              ))}
            </div>
          </section>
        </>
      )}

      {(!initialLoad && searchResults.length === 0 && (searchQuery.trim() !== '' || selectedRegion !== 'all' || selectedSeason !== 'all'))) && (
        <>
          <Separator className="my-8 bg-border/20" />
          <section className="text-center py-8">
            <p className="text-muted-foreground text-lg">
              No produce found matching your search query and filters.
            </p>
          </section>
        </>
      )}

      {favoriteProduceItems.length > 0 && (
        <>
          <Separator className="my-8 bg-border/20" />
          <section id="favorites-section">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground"><Heart className="text-primary"/>My Favorite Produce</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProduceItems.map((item) => (
                <ProduceCard key={item.id} produce={item} />
              ))}
            </div>
          </section>
        </>
      )}

      {(searchResults.length === 0 && favoriteProduceItems.length === 0 && !initialLoad && !(searchQuery.trim() !== '' || selectedRegion !== 'all' || selectedSeason !== 'all')) && (
         <section className="py-8 text-center">
             <Apple className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">
              No produce data to display. Try searching or scanning an item.
              <br/>
              Favorite items will appear here.
            </p>
          </section>
      )}
    </div>
  );
}
