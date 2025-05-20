
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TextSearchForm from '@/components/search/TextSearchForm';
import ProduceCard from '@/components/produce/ProduceCard';
import type { ProduceInfo } from '@/lib/produceData';
import { searchProduce, getUniqueRegions, getUniqueSeasons } from '@/lib/produceData';
import { getFavoriteIds, getRecentSearches, addRecentSearch } from '@/lib/userDataStore';
import { Separator } from '@/components/ui/separator';
import { Apple, ListFilter, Heart, History, ExternalLink, Search, Info } from 'lucide-react'; // Removed Bell icons
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/ui/Loader';
import InfoBanner from '@/components/home/InfoBanner';

// VAPID_PUBLIC_KEY and related functions remain, assuming push notification logic might be used elsewhere or in future.
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
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
  const [recentSearchTerms, setRecentSearchTerms] = useState<string[]>([]);

  // Notification related states remain, as they might be tied to other UI or future features
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isVAPIDKeyConfigured, setIsVAPIDKeyConfigured] = useState(false);


  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null); 

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'PushManager' in window.ServiceWorkerRegistration.prototype) {
      setNotificationPermission(Notification.permission);
      setIsPushSupported(true);
    } else {
      setIsPushSupported(false);
    }
    setIsVAPIDKeyConfigured(VAPID_PUBLIC_KEY !== 'YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME');
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
    const allCurrentProduce = searchProduce('', { region: 'all', season: 'all' }); 
    setFavoriteProduceItems(favIds.map(id => allCurrentProduce.find(p => p.id === id)).filter(Boolean) as ProduceInfo[]);
    setRecentSearchTerms(getRecentSearches());
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


  const handleQueryChange = (newQuery: string) => {
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
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsVisible(false);
  };

  const handleSuggestionClick = (item: ProduceInfo) => {
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    addRecentSearch(item.commonName);
    loadUserData(); 
    router.push(`/item/${item.id}`); 
  };

  const handleSubmitSearch = (submittedQuery: string) => {
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
      router.push(`/item/${results[0].id}`);
    }
  };
  
  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term);
    setIsSuggestionsVisible(false);
    addRecentSearch(term);
    loadUserData();
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
  }, []);

  const handleNotificationSubscription = async () => {
    if (!isPushSupported || !navigator.serviceWorker) {
      toast({ title: "Notifications Not Supported", description: "Your browser does not support push notifications.", variant: "destructive" });
      return;
    }

    if (!isVAPIDKeyConfigured) {
      toast({ 
        title: "Push Notification Setup Incomplete", 
        description: "The VAPID public key for push notifications is not configured in the application. Please add it to enable subscriptions.", 
        variant: "destructive",
        duration: 7000,
      });
      console.warn("VAPID_PUBLIC_KEY is not set. Push subscription cannot proceed.");
      return;
    }

    setIsSubscribing(true);

    try {
      let currentPermission = notificationPermission;
      if (currentPermission === 'default') {
        const permissionResult = await Notification.requestPermission();
        setNotificationPermission(permissionResult); 
        currentPermission = permissionResult; 
      }

      if (currentPermission === 'denied') {
        toast({ title: "Permission Denied", description: "Notification permissions are currently denied. Please check your browser settings.", variant: "destructive" });
        setIsSubscribing(false);
        return;
      }
      
      if (currentPermission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            toast({ title: "Already Subscribed", description: "You are already subscribed to notifications." });
        } else {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
            
            console.log('User is subscribed:', subscription);
            toast({ title: "Subscribed!", description: "You'll now receive seasonal updates (once backend is fully implemented)." });
        }
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Subscription Failed", description: `Could not subscribe: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubscribing(false);
    }
  };


  return (
    <div className="space-y-8 py-6">
      <section className="text-left px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Explore Your Produce</h1>
        <p className="text-md sm:text-lg text-muted-foreground">
          Discover detailed information about fruits and vegetables.
        </p>
      </section>

      <InfoBanner 
        title="AgriPedia Tip!"
        description="Did you know? Apples float because 25% of their volume is air!"
        icon={Info}
      />
      
      {/* Grid for Search/Filter card */}
      <div className="grid md:grid-cols-1 gap-8 items-start"> {/* Changed md:grid-cols-3 to md:grid-cols-1 */}
        <section className="space-y-4"> {/* Removed md:col-span-2 */}
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
        </section>
        
        {/* Notifications card section has been removed */}
      </div>

      {(searchResults.length > 0) && (
        <>
          <Separator className="my-8 bg-border/20" />
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground">
              <ListFilter className="text-primary"/> 
              {searchQuery || selectedRegion !== 'all' || selectedSeason !== 'all' ? 'Filtered Results' : 'Discover Produce'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((item) => (
                <ProduceCard key={item.id} produce={item} />
              ))}
            </div>
          </section>
        </>
      )}

      {(!initialLoad && searchResults.length === 0 && (searchQuery.trim() !== '' || selectedRegion !== 'all' || selectedSeason !== 'all')) && (
        <>
          <Separator className="my-8 bg-border/20" />
          <section className="text-center py-8">
            <p className="text-muted-foreground text-lg">
              No produce found matching your search query and filters.
            </p>
          </section>
        </>
      )}
      
      {recentSearchTerms.length > 0 && (
        <>
          <Separator className="my-8 bg-border/20" />
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground"><History className="text-primary"/>Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {recentSearchTerms.map((term, index) => (
                <Button key={index} variant="outline" size="sm" onClick={() => handleRecentSearchClick(term)} className="rounded-full hover:bg-primary/10 border-primary/50 text-primary">
                  {term}
                  <ExternalLink size={14} className="ml-2 opacity-70"/>
                </Button>
              ))}
            </div>
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

      {(searchResults.length === 0 && favoriteProduceItems.length === 0 && recentSearchTerms.length === 0 && !initialLoad && !(searchQuery.trim() !== '' || selectedRegion !== 'all' || selectedSeason !== 'all')) && (
         <section className="py-8 text-center">
             <Apple className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">
              No produce data to display. Try searching or scanning an item.
              <br/>
              Favorite items and recent searches will appear here.
            </p>
          </section>
      )}
    </div>
  );
}

