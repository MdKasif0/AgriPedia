
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, notFound, usePathname } from 'next/navigation';
import { getProduceByCommonName, type ProduceInfo } from '@/lib/produceData';
import { getProduceOffline, saveProduceOffline } from '@/lib/offlineStore';
import * as UserDataStore from '@/lib/userDataStore'; // Still used for favorites
import { fetchRecipesForProduce } from '@/app/actions';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes-flow';
import { triggerHapticFeedback, playSound } from '@/lib/utils';
import dynamic from 'next/dynamic';

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

import IconLabel from '@/components/ui/IconLabel';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Leaf, Globe, Languages, MapPin, Activity, Heart, AlertTriangle, Sprout, CalendarDays, Info, WifiOff, MessageCircleWarning,
  CalendarCheck2, CalendarX2, Store, LocateFixed, BookmarkPlus, BookmarkCheck, Recycle, Footprints, ChefHat, Share2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ClientOnly from '@/components/ClientOnly';


const getSeverityBadgeVariant = (severity: ProduceInfo['potentialAllergies'][0]['severity']): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case 'Severe':
      return 'destructive';
    case 'Moderate':
      return 'default'; 
    case 'Mild':
      return 'secondary';
    case 'Common':
    case 'Rare':
    case 'Varies':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getCurrentSeason = (): string => {
  const month = new Date().getMonth(); 
  if (month >= 2 && month <= 4) return 'Spring'; 
  if (month >= 5 && month <= 7) return 'Summer'; 
  if (month >= 8 && month <= 10) return 'Autumn'; 
  return 'Winter'; 
};

type Recipe = {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
};

export default function ItemDetailsPage({ slugFromParams }: { slugFromParams?: string | string[] }) {
  const { toast } = useToast();
  const params = useParams<{ slug?: string | string[] }>(); 
  const pathname = usePathname(); 

  const actualSlugParam = slugFromParams || params?.slug;

  const [produce, setProduce] = useState<ProduceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineSource, setIsOfflineSource] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [animateBookmark, setAnimateBookmark] = useState(false);

  const [isCurrentlyInSeason, setIsCurrentlyInSeason] = useState<boolean | null>(null);
  const [currentSeasonMessage, setCurrentSeasonMessage] = useState<string>('');

  const [locationInfo, setLocationInfo] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  const processedSlug = useMemo(() => {
    if (!actualSlugParam) return '';
    return typeof actualSlugParam === 'string' ? decodeURIComponent(actualSlugParam) : Array.isArray(actualSlugParam) ? decodeURIComponent(actualSlugParam[0]) : '';
  }, [actualSlugParam]);


  useEffect(() => {
    if (!processedSlug) {
      setIsLoading(false);
      setProduce(null);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setIsOfflineSource(false);
      let itemData: ProduceInfo | null = null;
      const isOnline = typeof window !== 'undefined' && navigator.onLine;

      if (isOnline) {
        try {
          const onlineData = getProduceByCommonName(processedSlug);
          if (onlineData) {
            itemData = onlineData;
            saveProduceOffline(onlineData);
            // Removed UserDataStore.addRecentView call
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
        setIsBookmarked(UserDataStore.isFavorite(itemData.id));
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

        const loadRecipes = async () => {
          setIsLoadingRecipes(true);
          setRecipeError(null);
          setRecipes(null);
          try {
            const result = await fetchRecipesForProduce(produce.commonName);
            if (result && result.recipes) {
              setRecipes(result.recipes);
            } else {
              setRecipeError('Could not fetch recipes at this time.');
            }
          } catch (err) {
            console.error("Error fetching recipes:", err);
            setRecipeError('Failed to load recipes. Please try again later.');
          } finally {
            setIsLoadingRecipes(false);
          }
        };
        loadRecipes();
    }
  }, [produce]);

  const handleLocationClick = () => {
    setIsLocating(true);
    setLocationInfo(null);
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

  const handleToggleBookmark = () => {
    if (!produce) return;
    triggerHapticFeedback();
    if (isBookmarked) {
      UserDataStore.removeFavorite(produce.id);
    } else {
      UserDataStore.addFavorite(produce.id);
      playSound('/sounds/bookmark-added.mp3');
      setAnimateBookmark(true);
      setTimeout(() => setAnimateBookmark(false), 300); 
    }
    setIsBookmarked(!isBookmarked);
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
    notFound();
    return null;
  }
  if (!produce) return null; 

  const commonNameWords = produce.commonName.toLowerCase().split(' ');
  const imageHint = commonNameWords.length > 1 ? commonNameWords.slice(0, 2).join(' ') : commonNameWords[0];


  return (
    <div className="space-y-8 py-8">
      {isOfflineSource && (
        <Alert variant="default" className="bg-secondary/80 text-secondary-foreground border-secondary-foreground/30">
          <WifiOff className="h-5 w-5 text-secondary-foreground" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are viewing a cached version of this page. Some information might be outdated.
          </AlertDescription>
        </Alert>
      )}
      <header className="text-center relative">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
          <Leaf size={32} className="h-8 w-8 sm:h-10 sm:w-10 text-primary" /> {produce.commonName}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground italic">{produce.scientificName}</p>
        <div className="absolute top-0 right-0 flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-foreground hover:text-primary active:scale-110"
                aria-label={`Share ${produce.commonName} details`}
            >
                <Share2 size={24} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleBookmark}
                className="text-foreground hover:text-primary active:scale-110"
                aria-label={isBookmarked ? `Remove ${produce.commonName} from favorites` : `Add ${produce.commonName} to favorites`}
            >
                {isBookmarked ? <BookmarkCheck size={28} className={`text-primary fill-primary ${animateBookmark ? 'animate-pop' : ''}`} /> : <BookmarkPlus size={28} />}
            </Button>
        </div>
      </header>

      <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
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

      <IconLabel icon={Info} label="Description" className="bg-card rounded-lg shadow-lg">
        <p className="text-card-foreground/90">{produce.description}</p>
      </IconLabel>

      <div className="grid md:grid-cols-2 gap-6">
        <IconLabel icon={Globe} label="Origin" className="bg-card rounded-lg shadow-lg">
          <p className="text-card-foreground/90">{produce.origin}</p>
        </IconLabel>
        <IconLabel icon={MapPin} label="Major Growing Regions" className="bg-card rounded-lg shadow-lg">
          <ul className="list-disc list-inside text-card-foreground/90">
            {produce.regions.map(region => <li key={region}>{region}</li>)}
          </ul>
        </IconLabel>
        <IconLabel icon={Languages} label="Local Names" className="bg-card rounded-lg shadow-lg">
          <div className="flex flex-wrap gap-2">
            {produce.localNames.map(name => <Badge key={name} variant="secondary" className="bg-secondary/70 text-secondary-foreground">{name}</Badge>)}
          </div>
        </IconLabel>
        <IconLabel icon={CalendarDays} label="Growth Duration" className="bg-card rounded-lg shadow-lg">
          <p className="text-card-foreground/90">{produce.growthDuration}</p>
        </IconLabel>
        <IconLabel icon={Sprout} label="Cultivation Process & Ideal Conditions" className="md:col-span-2 bg-card rounded-lg shadow-lg">
          <p className="whitespace-pre-line text-card-foreground/90">{produce.cultivationProcess}</p>
        </IconLabel>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 flex items-center gap-2 justify-center text-foreground"><Activity className="text-primary"/>Nutritional Information</h2>
        <p className="text-muted-foreground mb-6 text-center">Calories per 100g: {produce.nutrition.calories}</p>

        <ClientOnly fallback={<div className="h-72 bg-muted rounded-lg animate-pulse"></div>}>
          <NutrientChart data={produce.nutrition.macronutrients} className="rounded-lg shadow-lg" />
        </ClientOnly>

        {(produce.nutrition.vitamins && produce.nutrition.vitamins.length > 0) && (
          <ClientOnly fallback={<div className="mt-6 h-72 bg-muted rounded-lg animate-pulse"></div>}>
            <VitaminChart data={produce.nutrition.vitamins} className="mt-6 rounded-lg shadow-lg" />
          </ClientOnly>
        )}

        {(produce.nutrition.minerals && produce.nutrition.minerals.length > 0) && (
          <ClientOnly fallback={<div className="mt-6 h-72 bg-muted rounded-lg animate-pulse"></div>}>
            <MineralChart data={produce.nutrition.minerals} className="mt-6 rounded-lg shadow-lg" />
          </ClientOnly>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <IconLabel icon={Heart} label="Health Benefits" className="bg-card rounded-lg shadow-lg">
          <ul className="list-disc list-inside space-y-1 text-card-foreground/90">
            {produce.healthBenefits.map(benefit => <li key={benefit}>{benefit}</li>)}
          </ul>
        </IconLabel>
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
          <IconLabel icon={Footprints} label="Carbon Footprint Info" className="bg-card rounded-lg shadow-lg">
            <p className="text-card-foreground/90">{produce.carbonFootprintInfo}</p>
          </IconLabel>
        )}
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 flex items-center gap-2 justify-center text-foreground"><ChefHat className="text-primary"/>Recipe Ideas</h2>
        {isLoadingRecipes && <Loader text="Generating recipe ideas with AI..." />}
        {recipeError && <Alert variant="destructive" className="rounded-lg"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{recipeError}</AlertDescription></Alert>}
        {!isLoadingRecipes && !recipeError && recipes && recipes.length > 0 && (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
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
        )}
        {!isLoadingRecipes && !recipeError && (!recipes || recipes.length === 0) && (
          <p className="text-center text-muted-foreground">No recipe ideas available at the moment.</p>
        )}
      </section>

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

    </div>
  );
}
