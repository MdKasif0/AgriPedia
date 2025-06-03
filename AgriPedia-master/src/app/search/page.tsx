'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ProduceCard from '@/components/produce/ProduceCard';
import type { ProduceInfo } from '@/lib/produceData';
import { searchProduce, getUniqueRegions, getUniqueSeasons, getAllProduce, getInSeasonProduce } from '@/lib/produceData';
import * as UserDataStore from '@/lib/userDataStore';
import { Separator } from '@/components/ui/separator';
import { Apple, ListFilter, Heart, Search, Info, AlertTriangle, Loader2, ScanLine, Bell } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InfoBanner from '@/components/home/InfoBanner';
import { fetchDynamicAgriTip } from '@/app/actions';
import ClientOnly from '@/components/ClientOnly';
import { triggerHapticFeedback, playSound } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const SearchFormFallback = () => {
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
};

const TextSearchForm = dynamic(() => import('@/components/search/TextSearchForm'), {
  ssr: false,
  loading: () => <SearchFormFallback />,
});


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

  const [seasonalSuggestions, setSeasonalSuggestions] = useState<ProduceInfo[]>([]);

  const [dynamicTip, setDynamicTip] = useState<string>("Loading an interesting tip...");
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
      console.warn("VAPID public key is not configured. Push notifications will not work.");
    }
  }, []);

  useEffect(() => {
    const loadTip = async () => {
      setIsTipLoading(true);
      setTipError(null);
      try {
        const tip = await fetchDynamicAgriTip();
        if (tip) {
          if (tip.toLowerCase().includes("could not load") || tip.toLowerCase().includes("failed") || tip.toLowerCase().includes("limited")) {
            setTipError(tip);
            setDynamicTip("Discover amazing facts about your food!"); // Fallback description
          } else {
            setDynamicTip(tip);
          }
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

  const loadUserData = useCallback(() => {
    // Removed favorite items loading from here
    const currentSeasonal = getInSeasonProduce(5);
    setSeasonalSuggestions(currentSeasonal);
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
    updateFilteredResults('', 'all', 'all'); // Load all items initially
    setInitialLoad(false);
  }, [loadUserData, updateFilteredResults]);


  useEffect(() => {
    if (!initialLoad) {
      updateFilteredResults(searchQuery, selectedRegion, selectedSeason);
    }
  }, [searchQuery, selectedRegion, selectedSeason, initialLoad, updateFilteredResults]);


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

  const handleSuggestionClick = useCallback((item: ProduceInfo) => {
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    UserDataStore.addRecentSearch(item.commonName);
    loadUserData();
    triggerHapticFeedback();
    router.push(`/item/${encodeURIComponent(item.id)}`);
  }, [loadUserData, router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions(seasonalSuggestions);
    setIsSuggestionsVisible(true);
    searchInputRef.current?.focus();
    triggerHapticFeedback();
  }, [seasonalSuggestions]);

  const handleSubmitSearch = useCallback((submittedQuery: string) => {
    setIsSuggestionsVisible(false);
    if (submittedQuery.trim()) {
        UserDataStore.addRecentSearch(submittedQuery);
        loadUserData();
    }
    const results = searchProduce(submittedQuery, {
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      season: selectedSeason === 'all' ? undefined : selectedSeason
    });
    if (results.length === 1 && results[0].commonName.toLowerCase() === submittedQuery.toLowerCase()) {
      router.push(`/item/${encodeURIComponent(results[0].id)}`);
    }
  }, [loadUserData, router, selectedRegion, selectedSeason]);

  const handleFocusSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSuggestions(seasonalSuggestions);
      setIsSuggestionsVisible(true);
    } else {
      handleQueryChange(searchQuery);
    }
  }, [searchQuery, seasonalSuggestions, handleQueryChange]);

  const handleNotificationSubscription = async () => {
    setIsSubscribing(true);
    setNotificationStatus(null);
    triggerHapticFeedback();

    if (!vapidKeyConfigured) {
      toast({
        title: 'Notifications Not Configured',
        description: "Push notifications require VAPID key setup by the site administrator.",
        variant: 'destructive',
      });
      setIsSubscribing(false);
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotificationStatus('Push notifications are not supported by your browser.');
      toast({ title: 'Unsupported Browser', description: 'Push notifications not supported.', variant: 'destructive' });
      setIsSubscribing(false);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotificationStatus('Notification permission denied.');
        toast({ title: 'Permission Denied', description: 'Notifications permission was denied.', variant: 'destructive' });
        setIsSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        setNotificationStatus('Already subscribed to notifications.');
        toast({ title: 'Already Subscribed', description: 'You are already subscribed to notifications.' });
      } else {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey || publicKey === VAPID_PUBLIC_KEY_PLACEHOLDER) {
          setNotificationStatus('VAPID public key not configured. Cannot subscribe.');
          toast({ title: 'Setup Incomplete', description: 'VAPID public key not configured.', variant: 'destructive' });
          setIsSubscribing(false);
          return;
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });
        setNotificationStatus('Successfully subscribed to notifications!');
        playSound('/sounds/scan-success.mp3');
        toast({ title: 'Subscribed!', description: 'You will now receive notifications.' });
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setNotificationStatus("Error: " + errorMessage);
      toast({ title: 'Subscription Error', description: "Failed to subscribe: " + errorMessage, variant: 'destructive' });
    } finally {
      setIsSubscribing(false);
    }
  };

  const pageContent = (
    <div className="space-y-8 py-6">
      <ClientOnly fallback={<div className="h-24 bg-muted rounded-xl animate-pulse"></div>}>
        <InfoBanner
          title="AgriPedia Tip!"
          description={isTipLoading ? "Loading a fresh tip..." : tipError || dynamicTip}
          icon={isTipLoading ? Loader2 : (tipError ? AlertTriangle : Info)}
          iconProps={isTipLoading ? {className: "animate-spin"} : {}}
          className="bg-primary/80 backdrop-blur-md text-primary-foreground rounded-xl shadow-xl border border-primary-foreground/20"
        />
      </ClientOnly>

      <div className="grid md:grid-cols-1 gap-8 items-start">
        <section className="space-y-4">
          <Card className="shadow-xl rounded-2xl bg-card text-card-foreground">
            <CardHeader className="p-6">
              <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-card-foreground">
                <Search className="text-primary" /> Search & Filter Produce
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
                  onFocus={handleFocusSearch}
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
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            <ListFilter className="text-primary" />
            {(searchQuery || selectedRegion !== 'all' || selectedSeason !== 'all') ? 'Filtered Results' : 'All Produce'}
          </h2>
          <span className="text-sm text-muted-foreground">{searchResults.length} item(s)</span>
        </div>
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map(item => (
              <ProduceCard key={item.id} produce={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No produce found matching your criteria. <Apple className="inline-block h-4 w-4" /></p>
        )}
      </section>
    </div>
  );
  return pageContent;
}
