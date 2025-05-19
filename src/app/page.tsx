
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TextSearchForm from '@/components/search/TextSearchForm';
// ImageUploadForm is now accessed via global FAB/Dialog
import ProduceCard from '@/components/produce/ProduceCard';
import type { ProduceInfo } from '@/lib/produceData';
import { searchProduce, getUniqueRegions, getUniqueSeasons, getAllProduce } from '@/lib/produceData';
import { getFavoriteIds, getRecentSearches, addRecentSearch } from '@/lib/userDataStore';
import { Separator } from '@/components/ui/separator';
import { Apple, ListFilter, Heart, History, ExternalLink, BellRing, BellOff, BellPlus, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/ui/Loader';

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

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);


  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref for the search input

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'PushManager' in window.ServiceWorkerRegistration.prototype) {
      setNotificationPermission(Notification.permission);
      setIsPushSupported(true);
    } else {
      setIsPushSupported(false);
    }
  }, []);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
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
    const allProduce = getAllProduce();
    setFavoriteProduceItems(favIds.map(id => allProduce.find(p => p.id === id)).filter(Boolean) as ProduceInfo[]);
    setRecentSearchTerms(getRecentSearches());
  }, []);

  useEffect(() => {
    setAvailableRegions(getUniqueRegions());
    setAvailableSeasons(getUniqueSeasons());
    loadUserData();
    setInitialLoad(false); // After initial data load, mark as not initial load
  }, [loadUserData]);

  const updateFilteredResults = useCallback((query: string, region: string, season: string) => {
    const results = searchProduce(query, { 
      region: region === 'all' ? undefined : region, 
      season: season === 'all' ? undefined : season 
    });
    setSearchResults(results);
    setInitialLoad(false); // Any update to filters/query means it's not the initial pristine load
  }, []);

  useEffect(() => {
    // Only run filtering if it's not the initial load OR if any filter/query has changed
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
      suggestionsTimeoutRef.current = setTimeout(() => {
        const currentSuggestions = searchProduce(newQuery.trim(), {}); // Suggestions based on query only
        setSuggestions(currentSuggestions);
        setIsSuggestionsVisible(true);
      }, 150);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
      // When query is cleared, re-apply current filters to all data
      updateFilteredResults("", selectedRegion, selectedSeason);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    updateFilteredResults("", selectedRegion, selectedSeason);
  };

  const handleSuggestionClick = (item: ProduceInfo) => {
    // setSearchQuery(item.commonName); // This would re-trigger searchResults update
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    addRecentSearch(item.commonName);
    loadUserData(); 
    router.push(`/item/${item.id}`); // Directly navigate to item page
  };

  const handleSubmitSearch = (submittedQuery: string) => {
    // setSearchQuery(submittedQuery); // This will be set by handleQueryChange or direct input
    setIsSuggestionsVisible(false);
    addRecentSearch(submittedQuery);
    loadUserData(); 
    // The useEffect for searchQuery, selectedRegion, selectedSeason will handle updating searchResults
    // If the query comes directly from submit (not suggestion), ensure results are updated:
    updateFilteredResults(submittedQuery, selectedRegion, selectedSeason);

    const results = searchProduce(submittedQuery, {
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      season: selectedSeason === 'all' ? undefined : selectedSeason
    });
    if (results.length === 1 && results[0].commonName.toLowerCase() === submittedQuery.toLowerCase()) {
      router.push(`/item/${results[0].id}`);
    }
    // else, searchResults will be updated by updateFilteredResults and displayed
  };
  
  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term); // This will trigger useEffect to update results
    // No need to call handleSubmitSearch directly, as setSearchQuery + useEffect handles it
    // Make sure suggestions are closed
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
    if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME') {
      toast({ title: "Setup Incomplete", description: "Push notification VAPID key is not configured.", variant: "destructive" });
      console.warn("VAPID_PUBLIC_KEY is not set. Push subscription will likely fail or be incomplete.");
    }

    setIsSubscribing(true);

    try {
      if (notificationPermission === 'default') {
        const permissionResult = await Notification.requestPermission();
        setNotificationPermission(permissionResult);
        if (permissionResult !== 'granted') {
          toast({ title: "Permission Denied", description: "You've denied notification permissions.", variant: "destructive" });
          setIsSubscribing(false);
          return;
        }
      }

      if (notificationPermission === 'denied') {
        toast({ title: "Permission Denied", description: "Notification permissions are currently denied. Please check your browser settings.", variant: "destructive" });
        setIsSubscribing(false);
        return;
      }
      
      if (notificationPermission === 'granted') {
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
            // TODO: Send the subscription object to your backend server to store it
            // Example: await fetch('/api/subscribe-notifications', { method: 'POST', body: JSON.stringify(subscription), headers: {'Content-Type': 'application/json'} });
            toast({ title: "Subscribed!", description: "You'll now receive seasonal updates (once backend is ready)." });
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
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Welcome to AgriPedia!</h1>
        <p className="text-md sm:text-lg text-muted-foreground">
          Discover detailed information about fruits and vegetables.
        </p>
      </section>

      {/* Main content grid: Search + Filters (2/3 width), Notifications (1/3 width) */}
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <section className="space-y-4 md:col-span-2"> {/* Search and filters take 2 columns */}
          <Card className="shadow-xl rounded-xl bg-card">
            <CardHeader className="p-6">
              <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-foreground">
                <Search className="text-primary" /> Search Produce
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
                inputRef={searchInputRef} // Pass the ref here
              />
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="region-filter" className="block text-sm font-medium text-foreground mb-1">Filter by Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger id="region-filter" className="w-full rounded-lg">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
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
                    <SelectTrigger id="season-filter" className="w-full rounded-lg">
                      <SelectValue placeholder="All Seasons" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
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
        
        <section className="space-y-4 md:col-span-1"> {/* Notifications card takes 1 column */}
          <Card className="shadow-xl rounded-xl bg-card">
             <CardHeader className="p-6">
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-foreground">
                    {notificationPermission === 'granted' ? <BellRing className="text-primary" /> : <BellPlus className="text-primary" />}
                    Notifications
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
                {isPushSupported ? (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {notificationPermission === 'granted' 
                                ? "You are subscribed to seasonal notifications."
                                : notificationPermission === 'denied'
                                ? "Notifications are disabled. Please update your browser settings to enable them."
                                : "Enable notifications to get updates on seasonal produce."
                            }
                        </p>
                        {notificationPermission !== 'denied' && (
                            <Button 
                                onClick={handleNotificationSubscription} 
                                disabled={isSubscribing || notificationPermission === 'granted'}
                                className="w-full rounded-lg"
                                variant={notificationPermission === 'granted' ? "outline" : "default"}
                            >
                                {isSubscribing && <Loader text="Processing..." size={18} />}
                                {!isSubscribing && notificationPermission === 'granted' && <><BellOff className="mr-2"/> Unsubscribe (Future)</>}
                                {!isSubscribing && notificationPermission !== 'granted' && <><BellPlus className="mr-2"/> Enable Notifications</>}
                            </Button>
                        )}
                         {VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE_REPLACE_ME' && notificationPermission !== 'denied' && (
                            <p className="text-xs text-destructive text-center">Note: App config needed for notifications to fully work.</p>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Push notifications are not supported by your browser or device.</p>
                )}
            </CardContent>
          </Card>
        </section>
      </div>

      {(!initialLoad && searchResults.length > 0) && (
        <>
          <Separator className="my-8 bg-border/50" />
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground"><ListFilter className="text-primary"/>Filtered Results</h2>
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
          <Separator className="my-8 bg-border/50" />
          <section className="text-center py-8">
            <p className="text-muted-foreground text-lg">
              No produce found matching your search query and filters.
            </p>
          </section>
        </>
      )}
      
      {recentSearchTerms.length > 0 && (
        <>
          <Separator className="my-8 bg-border/50" />
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
          <Separator className="my-8 bg-border/50" />
          <section id="favorites-section"> {/* Added ID for bottom nav link */}
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2 text-foreground"><Heart className="text-primary"/>My Favorite Produce</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProduceItems.map((item) => (
                <ProduceCard key={item.id} produce={item} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Message when no user data is present and it's the initial view */}
      {(favoriteProduceItems.length === 0 && recentSearchTerms.length === 0 && initialLoad && searchResults.length === 0 && searchQuery.trim() === '' && selectedRegion === 'all' && selectedSeason === 'all') && (
         <section className="py-8 text-center">
            <p className="text-muted-foreground">
              Use the search bar and filters to find produce, or use the scan button to identify an item. Favorite items and recent searches will appear here.
            </p>
          </section>
      )}
    </div>
  );
}
