
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, notFound, useRouter } from 'next/navigation';
import { getProduceByCommonName, type ProduceInfo, type Recipe } from '@/lib/produceData';
import { getProduceOffline, saveProduceOffline } from '@/lib/offlineStore';
import * as UserDataStore from '@/lib/userDataStore';
import { triggerHapticFeedback, playSound } from '@/lib/utils';
import dynamic from 'next/dynamic';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IconLabel from '@/components/ui/IconLabel';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Leaf, Globe, Languages, MapPin, Activity, Heart, AlertTriangle, Sprout, CalendarDays, Info, WifiOff, MessageCircleWarning,
  CalendarCheck2, CalendarX2, Store, LocateFixed, Share2,
  ArrowLeft
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ClientOnly from '@/components/ClientOnly';

const NutrientChart = dynamic(() => import('@/components/charts/NutrientChart'), {
  loading: () => <div className="mt-6 h-72 bg-muted rounded-lg animate-pulse"></div>,
  ssr: false
});
const VitaminChart = dynamic(() => import('@/components/charts/VitaminChart'), {
  loading: () => <div className="mt-6 h-72 bg-muted rounded-lg animate-pulse"></div>,
  ssr: false
});
const MineralChart = dynamic(() => import('@/components/charts/MineralChart'), {
  loading: () => <div className="mt-6 h-72 bg-muted rounded-lg animate-pulse"></div>,
  ssr: false
});

const getSeverityBadgeVariant = (severity: ProduceInfo['potentialAllergies'][0]['severity']): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case 'Severe':
      return 'destructive';
    case 'Moderate':
      return 'default'; // Using default (primary) for moderate as orange might be too close to destructive
    case 'Mild':
      return 'secondary';
    case 'Common':
    case 'Rare':
    case 'Varies':
    case 'Low':
    case 'Low to Moderate':
    case 'Moderate to High':
    case 'Very Low':
    case 'Harmless':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getCurrentSeason = (): string => {
  const month = new Date().getMonth(); // 0 (Jan) - 11 (Dec)
  if (month >= 2 && month <= 4) return 'Spring'; // Mar, Apr, May
  if (month >= 5 && month <= 7) return 'Summer'; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return 'Autumn'; // Sep, Oct, Nov
  return 'Winter'; // Dec, Jan, Feb
};


interface ItemDetailsPageProps {
  slugFromParams?: string | string[];
}

export default function ItemDetailsPage({ slugFromParams: slugFromParamsProp }: ItemDetailsPageProps) {
  const { toast } = useToast();
  const paramsHook = useParams<{ slug?: string | string[] }>();
  const router = useRouter();

  const slugFromParams = slugFromParamsProp || paramsHook.slug;

  const processedSlug = useMemo(() => {
    if (!slugFromParams) return '';
    const slugValue = typeof slugFromParams === 'string' ? slugFromParams : Array.isArray(slugFromParams) ? slugFromParams[0] : '';
    try {
        return decodeURIComponent(slugValue);
    } catch (e) {
        console.error("Failed to decode slug:", slugValue, e);
        return slugValue; // Return original if decoding fails
    }
  }, [slugFromParams]);


  const [produce, setProduce] = useState<ProduceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineSource, setIsOfflineSource] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [animateFavorite, setAnimateFavorite] = useState(false);

  const [isCurrentlyInSeason, setIsCurrentlyInSeason] = useState<boolean | null>(null);
  const [currentSeasonMessage, setCurrentSeasonMessage] = useState<string>('');

  const [locationInfo, setLocationInfo] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!processedSlug) {
      setIsLoading(false);
      setProduce(null);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setIsOfflineSource(false); // Reset for each fetch
      let itemData: ProduceInfo | null = null;
      const isOnline = typeof window !== 'undefined' && navigator.onLine;

      if (isOnline) {
        try {
          const onlineData = getProduceByCommonName(processedSlug);
          if (onlineData) {
            itemData = onlineData;
            saveProduceOffline(onlineData); // Save fresh data to offline store
            // UserDataStore.addRecentView(onlineData.id); // Feature was removed
          }
        } catch (error) {
          console.warn('Online fetch failed, trying offline cache for:', processedSlug, error);
        }
      }

      if (!itemData) {
        const offlineData = getProduceOffline(processedSlug);
        if (offlineData) {
          itemData = offlineData;
          setIsOfflineSource(true);
        }
      }

      setProduce(itemData);
      if (itemData) {
        setIsFavorited(UserDataStore.isFavorite(itemData.id));
      }
      setIsLoading(false);
    }

    fetchData();
  }, [processedSlug]);


  useEffect(() => {
    if (produce) {
        const seasonName = getCurrentSeason();
        const isInSeason = produce.seasons.includes(seasonName);
        setIsCurrentlyInSeason(isInSeason);
        setCurrentSeasonMessage(
            isInSeason
                ? `Based on typical Northern Hemisphere timing, ${produce.commonName}s are likely in season now (${seasonName}).`
                : `Based on typical Northern Hemisphere timing, ${produce.commonName}s are likely out of season now (${seasonName}). Check local availability for specifics.`
        );
    }
  }, [produce]);

  const handleLocationClick = () => {
    setIsLocating(true);
    setLocationInfo(null);
    triggerHapticFeedback();
    if (!navigator.geolocation) {
        setLocationInfo("Geolocation is not supported by your browser.");
        setIsLocating(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocationInfo(`Location (Lat: ${position.coords.latitude.toFixed(2)}, Lng: ${position.coords.longitude.toFixed(2)}). Nearby market information and more precise local availability using this location is coming in a future update!`);
            setIsLocating(false);
        },
        (error) => {
            let message = "Could not retrieve location.";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = "Location access denied. Please enable location permissions in your browser settings.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = "Location information is currently unavailable.";
                    break;
                case error.TIMEOUT:
                    message = "Request to get location timed out.";
                    break;
            }
            setLocationInfo(message);
            setIsLocating(false);
        }
    );
  };

  const handleToggleFavorite = () => {
    if (!produce) return;
    triggerHapticFeedback();
    if (isFavorited) {
      UserDataStore.removeFavorite(produce.id);
    } else {
      UserDataStore.addFavorite(produce.id);
      playSound('/sounds/bookmark-added.mp3');
      setAnimateFavorite(true);
      setTimeout(() => setAnimateFavorite(false), 300); // Match animation duration
    }
    setIsFavorited(!isFavorited);
  };

  const handleShare = async () => {
    if (!produce) return;
    triggerHapticFeedback();
    const shareData = {
      title: `Learn about ${produce.commonName} - AgriPedia`,
      text: `Check out ${produce.commonName} on AgriPedia: ${produce.description.substring(0, 100)}...`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: 'Shared!', description: `${produce.commonName} details shared successfully.` });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied!', description: `URL for ${produce.commonName} copied to clipboard.` });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({ title: 'Share Failed', description: 'Could not share at this time.', variant: 'destructive' });
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader text="Loading AgriPedia data..." size={48}/></div>;
  }

  if (!produce && !isLoading) {
    notFound(); // Call notFound if produce is null and not loading
    return null;
  }
  if (!produce) return null; // Should be caught by the above, but good for safety


  const commonNameWords = produce.commonName.toLowerCase().split(' ');
  const imageHint = commonNameWords.length > 1 ? commonNameWords.slice(0, 2).join(' ') : commonNameWords[0];

  const recipesToDisplay: Recipe[] = produce.staticRecipes || [];


  return (
    <div className="space-y-6 py-8">
      {isOfflineSource && (
        <Alert variant="default" className="bg-secondary/80 text-secondary-foreground border-secondary-foreground/30">
          <WifiOff className="h-5 w-5 text-secondary-foreground" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are viewing a cached version of this page. Some information might be outdated.
          </AlertDescription>
        </Alert>
      )}
      
      <header className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back" className="flex-shrink-0 self-start sm:self-center">
          <ArrowLeft className="text-foreground h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <div className="flex-1 text-center min-w-0 order-first sm:order-none mb-2 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5 flex items-center justify-center sm:justify-start gap-2 truncate">
            <Leaf className="text-primary h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" /> 
            <span className="truncate">{produce.commonName}</span>
          </h1>
          <p className="text-sm sm:text-md text-muted-foreground italic truncate">{produce.scientificName}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 self-start sm:self-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-foreground hover:text-primary active:scale-110 transition-all duration-150 ease-in-out active:brightness-90"
                aria-label={`Share ${produce.commonName} details`}
            >
                <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="text-foreground hover:text-primary active:scale-110 transition-all duration-150 ease-in-out active:brightness-90"
                aria-label={isFavorited ? `Remove ${produce.commonName} from favorites` : `Add ${produce.commonName} to favorites`}
            >
                {isFavorited ? (
                  <Heart className={`text-primary fill-primary ${animateFavorite ? 'animate-pop' : ''} h-5 w-5 sm:h-6 sm:w-6`} />
                ) : (
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
            </Button>
        </div>
      </header>

      <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl mb-6">
        <Image
          src={produce.image}
          alt={produce.commonName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 672px"
          style={{ objectFit: 'cover' }}
          data-ai-hint={imageHint}
          priority={true}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-2"> {/* Wrapper for horizontal scroll */}
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="recipe">Recipes</TabsTrigger>
            <TabsTrigger value="additional">Details</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <IconLabel icon={Info} label="Description" className="bg-card rounded-lg shadow-lg">
            <p className="text-card-foreground/90">{produce.description}</p>
          </IconLabel>
          <div className="grid md:grid-cols-2 gap-6">
            <IconLabel icon={Globe} label="Origin" className="bg-card rounded-lg shadow-lg">
              <p className="text-card-foreground/90">{produce.origin}</p>
            </IconLabel>
            <IconLabel icon={Languages} label="Local Names" className="bg-card rounded-lg shadow-lg">
              <div className="flex flex-wrap gap-2">
                {produce.localNames.map(name => <Badge key={name} variant="secondary" className="bg-secondary/70 text-secondary-foreground">{name}</Badge>)}
              </div>
            </IconLabel>
          </div>
          <IconLabel icon={MapPin} label="Major Growing Regions" className="bg-card rounded-lg shadow-lg">
            <ul className="list-disc list-inside text-card-foreground/90">
              {produce.regions.map(region => <li key={region}>{region}</li>)}
            </ul>
          </IconLabel>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6 space-y-6">
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2 justify-center text-foreground"><Activity className="text-primary"/>Nutritional Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center">Calories per 100g: {produce.nutrition.calories}</p>

            <ClientOnly fallback={<div className="h-72 bg-muted rounded-lg animate-pulse"></div>}>
              <NutrientChart data={produce.nutrition.macronutrients} className="rounded-lg shadow-lg overflow-hidden" />
            </ClientOnly>

            {(produce.nutrition.vitamins && produce.nutrition.vitamins.length > 0) && (
              <ClientOnly fallback={<div className="mt-6 h-72 bg-muted rounded-lg animate-pulse"></div>}>
                <VitaminChart data={produce.nutrition.vitamins} className="mt-6 rounded-lg shadow-lg overflow-hidden" />
              </ClientOnly>
            )}

            {(produce.nutrition.minerals && produce.nutrition.minerals.length > 0) && (
              <ClientOnly fallback={<div className="mt-6 h-72 bg-muted rounded-lg animate-pulse"></div>}>
                <MineralChart data={produce.nutrition.minerals} className="mt-6 rounded-lg shadow-lg overflow-hidden" />
              </ClientOnly>
            )}
          </section>
          <IconLabel icon={Heart} label="Health Benefits" className="bg-card rounded-lg shadow-lg">
            <ul className="list-disc list-inside space-y-1 text-card-foreground/90">
              {produce.healthBenefits.map(benefit => <li key={benefit}>{benefit}</li>)}
            </ul>
          </IconLabel>
        </TabsContent>

        <TabsContent value="recipe" className="mt-6 space-y-6">
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2 justify-center text-foreground"><Heart className="text-primary"/>Recipe Ideas</h2>
            {recipesToDisplay.length > 0 ? (
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {recipesToDisplay.map((recipe, index) => (
                  <Card key={index} className="bg-card rounded-lg shadow-lg">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg sm:text-xl text-primary">{recipe.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{recipe.description}</p>
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-1">Main Ingredients:</h4>
                        <ul className="list-disc list-inside text-sm space-y-0.5 text-card-foreground/90">
                          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-1">Steps:</h4>
                        <ol className="list-decimal list-inside text-sm space-y-1 text-card-foreground/90">
                          {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No recipe ideas available at the moment.</p>
            )}
          </section>
        </TabsContent>

        <TabsContent value="additional" className="mt-6 space-y-6">
            <IconLabel icon={AlertTriangle} label="Potential Allergies & Sensitivities" className="bg-card rounded-lg shadow-lg">
            {produce.potentialAllergies.length > 0 ? (
                <ul className="space-y-3">
                {produce.potentialAllergies.map((allergy, index) => (
                    <li key={index} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <MessageCircleWarning className="h-4 w-4 text-destructive shrink-0" />
                        <span className="font-medium text-card-foreground">{allergy.name}</span>
                        <Badge variant={getSeverityBadgeVariant(allergy.severity)} className="ml-auto capitalize">
                        {allergy.severity}
                        </Badge>
                    </div>
                    {allergy.details && <p className="text-xs text-muted-foreground pl-6">{allergy.details}</p>}
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No common allergies reported for this item.</p>
            )}
            </IconLabel>
            <IconLabel icon={Sprout} label="Cultivation Process & Ideal Conditions" className="md:col-span-2 bg-card rounded-lg shadow-lg">
              <p className="whitespace-pre-line text-card-foreground/90">{produce.cultivationProcess}</p>
            </IconLabel>
            <IconLabel icon={CalendarDays} label="Growth Duration" className="bg-card rounded-lg shadow-lg">
              <p className="text-card-foreground/90">{produce.growthDuration}</p>
            </IconLabel>

            <div className="grid md:grid-cols-2 gap-6">
                <IconLabel
                icon={isCurrentlyInSeason === null ? CalendarDays : isCurrentlyInSeason ? CalendarCheck2 : CalendarX2}
                label="Seasonal Availability"
                className="bg-card rounded-lg shadow-lg"
                >
                {isCurrentlyInSeason === null ? (
                    <Loader text="Checking seasonality..." size={16} />
                ) : (
                    <p className="text-card-foreground/90">{currentSeasonMessage}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Note: Seasonality can vary by specific locale and year.</p>
                </IconLabel>

                <IconLabel icon={Store} label="Find Locally (Future Feature)" className="bg-card rounded-lg shadow-lg">
                <Button onClick={handleLocationClick} disabled={isLocating} variant="outline" className="w-full sm:w-auto hover:bg-primary/10 border-primary/50 text-primary">
                    {isLocating ? <Loader text="Getting location..." size={18} /> : <><LocateFixed className="mr-2 h-4 w-4" /> Use My Location</>}
                </Button>
                {locationInfo && (
                    <Alert variant={locationInfo.startsWith("Location (Lat:") ? "default" : "destructive"} className="mt-4 text-sm rounded-lg">
                    <AlertTitle>{locationInfo.startsWith("Location (Lat:") ? "Location Acquired" : "Location Notice"}</AlertTitle>
                    <AlertDescription>{locationInfo}</AlertDescription>
                    </Alert>
                )}
                {!locationInfo && !isLocating && <p className="text-xs text-muted-foreground mt-2">Click the button to share your location. This will be used in the future to find nearby markets.</p>}
                </IconLabel>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {produce.sustainabilityTips && produce.sustainabilityTips.length > 0 && (
                <IconLabel icon={Recycle} label="Sustainability Tips" className="bg-card rounded-lg shadow-lg">
                    <ul className="list-disc list-inside space-y-1 text-card-foreground/90">
                    {produce.sustainabilityTips.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                </IconLabel>
                )}
                {produce.carbonFootprintInfo && (
                <IconLabel icon={Heart} label="Carbon Footprint Info" className="bg-card rounded-lg shadow-lg">
                    <p className="text-card-foreground/90">{produce.carbonFootprintInfo}</p>
                </IconLabel>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
