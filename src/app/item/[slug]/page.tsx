
'use client'; // For localStorage access and useEffect

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { getProduceByCommonName, type ProduceInfo } from '@/lib/produceData';
import { getProduceOffline, saveProduceOffline } from '@/lib/offlineStore';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/userDataStore';
import { fetchRecipesForProduce } from '@/app/actions';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes-flow';

import NutrientChart from '@/components/charts/NutrientChart';
import VitaminChart from '@/components/charts/VitaminChart';
import MineralChart from '@/components/charts/MineralChart';
import IconLabel from '@/components/ui/IconLabel';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Leaf, Globe, Languages, MapPin, Activity, Heart, AlertTriangle, Sprout, CalendarDays, Info, WifiOff, MessageCircleWarning,
  CalendarCheck2, CalendarX2, Store, LocateFixed, BookmarkPlus, BookmarkCheck, Recycle, Footprints, ChefHat
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const getSeverityBadgeVariant = (severity: ProduceInfo['potentialAllergies'][0]['severity']): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case 'Severe':
      return 'destructive';
    case 'Moderate':
      return 'default'; 
    case 'Mild':
      return 'secondary';
    case 'Common':
      return 'outline'; // Use outline for less critical, but still notable
    case 'Rare':
      return 'outline';
    case 'Varies':
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

type Recipe = {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
};

export default function ItemPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [produce, setProduce] = useState<ProduceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineSource, setIsOfflineSource] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [isCurrentlyInSeason, setIsCurrentlyInSeason] = useState<boolean | null>(null);
  const [currentSeasonMessage, setCurrentSeasonMessage] = useState<string>('');

  const [locationInfo, setLocationInfo] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setIsOfflineSource(false);
      let itemData: ProduceInfo | null = null;
      let onlineFetchAttempted = false;

      const isOnline = typeof window !== 'undefined' && navigator.onLine;

      if (isOnline) {
        try {
          const onlineData = getProduceByCommonName(slug);
          onlineFetchAttempted = true;
          if (onlineData) {
            itemData = onlineData;
            saveProduceOffline(onlineData);
          }
        } catch (error) {
          console.warn('Online fetch failed, trying offline cache:', error);
        }
      }

      if (!itemData) {
        const offlineData = getProduceOffline(slug);
        if (offlineData) {
          itemData = offlineData;
          setIsOfflineSource(true);
        }
      }
      
      if (!itemData && onlineFetchAttempted && isOnline) {
         setProduce(null);
      } else if (!itemData && !isOnline) {
        setProduce(null);
      } else {
        setProduce(itemData);
        if (itemData) {
          setIsBookmarked(isFavorite(itemData.id));
        }
      }
      setIsLoading(false);
    }

    fetchData();
  }, [slug]);

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

        // Fetch recipes
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
    if (isBookmarked) {
      removeFavorite(produce.id);
    } else {
      addFavorite(produce.id);
    }
    setIsBookmarked(!isBookmarked);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader text="Loading AgriPedia data..." size={48}/></div>;
  }

  if (!produce) {
    notFound();
    return null;
  }

  return (
    <div className="space-y-8 py-8">
      {isOfflineSource && (
        <Alert variant="default" className="bg-accent/80 text-accent-foreground border-accent-foreground/30">
          <WifiOff className="h-5 w-5 text-accent-foreground" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are viewing a cached version of this page. Some information might be outdated.
          </AlertDescription>
        </Alert>
      )}
      <header className="text-center relative">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
          <Leaf size={32} sm:size={40} className="text-primary" /> {produce.commonName}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground italic">{produce.scientificName}</p>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleBookmark} 
            className="absolute top-0 right-0 text-foreground hover:text-primary"
            aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isBookmarked ? <BookmarkCheck size={28} className="text-primary fill-primary" /> : <BookmarkPlus size={28} />}
        </Button>
      </header>

      <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl">
        <Image
          src={produce.image}
          alt={produce.commonName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 672px"
          style={{ objectFit: 'cover' }}
          data-ai-hint={`${produce.commonName.toLowerCase()} detail view`}
          priority={true} 
        />
      </div>
      
      <IconLabel icon={Info} label="Description" className="bg-card rounded-xl shadow-lg">
        <p className="text-card-foreground/90">{produce.description}</p>
      </IconLabel>

      <div className="grid md:grid-cols-2 gap-6">
        <IconLabel icon={Globe} label="Origin" className="bg-card rounded-xl shadow-lg">
          <p className="text-card-foreground/90">{produce.origin}</p>
        </IconLabel>
        <IconLabel icon={MapPin} label="Major Growing Regions" className="bg-card rounded-xl shadow-lg">
          <ul className="list-disc list-inside text-card-foreground/90">
            {produce.regions.map(region => <li key={region}>{region}</li>)}
          </ul>
        </IconLabel>
        <IconLabel icon={Languages} label="Local Names" className="bg-card rounded-xl shadow-lg">
          <div className="flex flex-wrap gap-2">
            {produce.localNames.map(name => <Badge key={name} variant="secondary" className="bg-secondary/70 text-secondary-foreground">{name}</Badge>)}
          </div>
        </IconLabel>
        <IconLabel icon={CalendarDays} label="Growth Duration" className="bg-card rounded-xl shadow-lg">
          <p className="text-card-foreground/90">{produce.growthDuration}</p>
        </IconLabel>
        <IconLabel icon={Sprout} label="Cultivation Process & Ideal Conditions" className="md:col-span-2 bg-card rounded-xl shadow-lg">
          <p className="whitespace-pre-line text-card-foreground/90">{produce.cultivationProcess}</p>
        </IconLabel>
      </div>
      
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 flex items-center gap-2 justify-center text-foreground"><Activity className="text-primary"/>Nutritional Information</h2>
        <p className="text-muted-foreground mb-6 text-center">Calories per 100g: {produce.nutrition.calories}</p>
        
        <NutrientChart data={produce.nutrition.macronutrients} className="rounded-xl shadow-lg" />
        
        {(produce.nutrition.vitamins && produce.nutrition.vitamins.length > 0) && (
            <VitaminChart data={produce.nutrition.vitamins} className="mt-6 rounded-xl shadow-lg" />
        )}
        
        {(produce.nutrition.minerals && produce.nutrition.minerals.length > 0) && (
            <MineralChart data={produce.nutrition.minerals} className="mt-6 rounded-xl shadow-lg" />
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <IconLabel icon={Heart} label="Health Benefits" className="bg-card rounded-xl shadow-lg">
          <ul className="list-disc list-inside space-y-1 text-card-foreground/90">
            {produce.healthBenefits.map(benefit => <li key={benefit}>{benefit}</li>)}
          </ul>
        </IconLabel>
        <IconLabel icon={AlertTriangle} label="Potential Allergies & Sensitivities" className="bg-card rounded-xl shadow-lg">
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
          <IconLabel icon={Recycle} label="Sustainability Tips" className="bg-card rounded-xl shadow-lg">
            <ul className="list-disc list-inside space-y-1 text-card-foreground/90">
              {produce.sustainabilityTips.map((tip, index) => <li key={index}>{tip}</li>)}
            </ul>
          </IconLabel>
        )}
        {produce.carbonFootprintInfo && (
          <IconLabel icon={Footprints} label="Carbon Footprint Info" className="bg-card rounded-xl shadow-lg">
            <p className="text-card-foreground/90">{produce.carbonFootprintInfo}</p>
          </IconLabel>
        )}
      </div>
      
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 flex items-center gap-2 justify-center text-foreground"><ChefHat className="text-primary"/>Recipe Ideas</h2>
        {isLoadingRecipes && <Loader text="Generating recipe ideas with AI..." />}
        {recipeError && <Alert variant="destructive" className="rounded-xl"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{recipeError}</AlertDescription></Alert>}
        {!isLoadingRecipes && !recipeError && recipes && recipes.length > 0 && (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <Card key={index} className="bg-card rounded-xl shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle className="text-xl text-primary">{recipe.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
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
          className="bg-card rounded-xl shadow-lg"
        >
          {isCurrentlyInSeason === null ? (
            <Loader text="Checking seasonality..." size={16} />
          ) : (
            <p className="text-card-foreground/90">{currentSeasonMessage}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Note: Seasonality can vary by specific locale and year.</p>
        </IconLabel>

        <IconLabel icon={Store} label="Find Locally (Future Feature)" className="bg-card rounded-xl shadow-lg">
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

