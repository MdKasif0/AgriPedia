
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
  CalendarCheck2, CalendarX2, Store, LocateFixed, Share2, ArrowLeft, Recycle,
  History, Thermometer, CloudRain, Mountain, Layers, Waves, Droplets, CalendarCog, Bug, ShieldAlert, Truck, Archive, MapPinned, AreaChart, TrendingUp, FlaskConical, TestTubeDiagonal, NotebookPen, Newspaper
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ClientOnly from '@/components/ClientOnly';
import CropCalendarDisplay from '@/components/produce/CropCalendarDisplay';

const NutrientChart = dynamic(() => import('@/components/charts/NutrientChart'), {
  loading: () => <div className="mt-6 h-[250px] sm:h-[300px] bg-muted rounded-lg animate-pulse"></div>,
  ssr: false
});
const VitaminChart = dynamic(() => import('@/components/charts/VitaminChart'), {
  loading: () => <div className="mt-6 h-[250px] sm:h-[300px] bg-muted rounded-lg animate-pulse"></div>,
  ssr: false
});
const MineralChart = dynamic(() => import('@/components/charts/MineralChart'), {
  loading: () => <div className="mt-6 h-[250px] sm:h-[300px] bg-muted rounded-lg animate-pulse"></div>,
  ssr: false
});

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
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
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
        return slugValue;
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
      setIsOfflineSource(false);
      let itemData: ProduceInfo | null = null;
      const isOnline = typeof window !== 'undefined' && navigator.onLine;

      if (isOnline) {
        try {
          const onlineData = getProduceByCommonName(processedSlug);
          if (onlineData) {
            itemData = onlineData;
            saveProduceOffline(onlineData);
            // UserDataStore.addRecentView(onlineData.id); // Feature removed
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
      setTimeout(() => setAnimateFavorite(false), 300);
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
  const recipesToDisplay: Recipe[] = produce.staticRecipes || [];

  return (
    <div className="space-y-4 py-4 md:py-6">
      {isOfflineSource && (
        <Alert variant="default" className="bg-secondary/80 text-secondary-foreground border-secondary-foreground/30 mx-2 md:mx-0">
          <WifiOff className="h-5 w-5 text-secondary-foreground" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are viewing a cached version of this page. Some information might be outdated.
          </AlertDescription>
        </Alert>
      )}
      
      <header className="flex items-center justify-between mb-4 px-2 md:px-0 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back" className="text-foreground hover:bg-accent/10">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground flex-1 text-center truncate px-2">
          {produce.commonName} Details
        </h1>
        <div className="flex items-center gap-0">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-foreground hover:text-primary active:scale-110 transition-all duration-150 ease-in-out active:brightness-90 hover:bg-accent/10"
                aria-label={`Share ${produce.commonName} details`}
            >
                <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="text-foreground hover:text-primary active:scale-110 transition-all duration-150 ease-in-out active:brightness-90 hover:bg-accent/10"
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

      <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-card mb-6">
        <Image
          src={produce.image}
          alt={produce.commonName}
          fill
          sizes="(max-width: 640px) 100vw, 512px"
          style={{ objectFit: 'cover' }}
          data-ai-hint={imageHint}
          priority={true}
        />
        <div className="absolute bottom-4 right-4 p-3 bg-background/80 backdrop-blur-md rounded-lg shadow-md text-right">
          <h2 className="text-xl font-bold text-foreground">{produce.commonName}</h2>
          <p className="text-sm text-muted-foreground italic">{produce.scientificName}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto pb-2 px-2 md:px-0">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="recipe">Recipes</TabsTrigger>
            <TabsTrigger value="additional">Details</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 space-y-6 px-2 md:px-0">
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

        <TabsContent value="nutrition" className="mt-6 space-y-6 px-2 md:px-0">
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2 justify-center text-foreground"><Activity className="text-primary"/>Nutritional Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center">Calories per 100g: {produce.nutrition.calories}</p>

            <ClientOnly fallback={<div className="h-[250px] sm:h-[300px] bg-muted rounded-lg animate-pulse"></div>}>
              <NutrientChart data={produce.nutrition.macronutrients} className="rounded-lg shadow-lg overflow-hidden" />
            </ClientOnly>

            {(produce.nutrition.vitamins && produce.nutrition.vitamins.length > 0) && (
              <ClientOnly fallback={<div className="mt-6 h-[250px] sm:h-[300px] bg-muted rounded-lg animate-pulse"></div>}>
                <VitaminChart data={produce.nutrition.vitamins} className="mt-6 rounded-lg shadow-lg overflow-hidden" />
              </ClientOnly>
            )}

            {(produce.nutrition.minerals && produce.nutrition.minerals.length > 0) && (
              <ClientOnly fallback={<div className="mt-6 h-[250px] sm:h-[300px] bg-muted rounded-lg animate-pulse"></div>}>
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

        <TabsContent value="recipe" className="mt-6 space-y-6 px-2 md:px-0">
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

        <TabsContent value="additional" className="mt-6 space-y-6 px-2 md:px-0">
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

            {/* New Agricultural Information Fields Start Here */}

            {produce.uses && produce.uses.length > 0 && (
              <IconLabel icon={Leaf} label="Common Uses" className="bg-card rounded-lg shadow-lg">
                <div className="flex flex-wrap gap-2">
                  {produce.uses.map(use => <Badge key={use} variant="outline" className="bg-muted hover:bg-muted/80 text-muted-foreground">{use}</Badge>)}
                </div>
              </IconLabel>
            )}

            {produce.originAndDomesticationHistory && (
              <IconLabel icon={History} label="Origin & Domestication History" className="bg-card rounded-lg shadow-lg">
                <p className="text-card-foreground/90 whitespace-pre-line">{produce.originAndDomesticationHistory}</p>
              </IconLabel>
            )}

            {produce.climaticRequirements && (
              <IconLabel icon={Thermometer} label="Climatic Requirements" className="bg-card rounded-lg shadow-lg">
                {produce.climaticRequirements.temperature && <p className="text-card-foreground/90"><strong>Temperature:</strong> {produce.climaticRequirements.temperature}</p>}
                {produce.climaticRequirements.rainfall && <p className="text-card-foreground/90"><strong>Rainfall:</strong> {produce.climaticRequirements.rainfall}</p>}
                {produce.climaticRequirements.altitude && <p className="text-card-foreground/90"><strong>Altitude:</strong> {produce.climaticRequirements.altitude}</p>}
              </IconLabel>
            )}

            {produce.soilPreferences && (
              <IconLabel icon={Layers} label="Soil Preferences" className="bg-card rounded-lg shadow-lg">
                <p className="text-card-foreground/90 whitespace-pre-line">{produce.soilPreferences}</p>
              </IconLabel>
            )}

            {produce.irrigationAndWaterNeeds && (
              <IconLabel icon={Waves} label="Irrigation & Water Needs" className="bg-card rounded-lg shadow-lg">
                <p className="text-card-foreground/90 whitespace-pre-line">{produce.irrigationAndWaterNeeds}</p>
              </IconLabel>
            )}

            {(produce.plantingAndHarvestCycles || (produce.seasons && produce.seasons.length > 0)) && (
              <IconLabel icon={CalendarDays} label="Crop Calendar / Planting & Harvesting" className="bg-card rounded-lg shadow-lg">
                <CropCalendarDisplay produce={produce} />
              </IconLabel>
            )}

            {produce.pestAndDiseaseManagement && (
              <IconLabel icon={Bug} label="Pest & Disease Management" className="bg-card rounded-lg shadow-lg">
                <p className="text-card-foreground/90 whitespace-pre-line">{produce.pestAndDiseaseManagement}</p>
              </IconLabel>
            )}

            {produce.postHarvestHandling && (
              <IconLabel icon={Truck} label="Post-Harvest Handling" className="bg-card rounded-lg shadow-lg">
                <p className="text-card-foreground/90 whitespace-pre-line">{produce.postHarvestHandling}</p>
              </IconLabel>
            )}

            {produce.majorProducingCountriesOrRegions && produce.majorProducingCountriesOrRegions.length > 0 && (
              <IconLabel icon={MapPinned} label="Major Producing Countries/Regions" className="bg-card rounded-lg shadow-lg">
                <div className="flex flex-wrap gap-2">
                  {produce.majorProducingCountriesOrRegions.map(region => <Badge key={region} variant="outline" className="bg-muted hover:bg-muted/80 text-muted-foreground">{region}</Badge>)}
                </div>
              </IconLabel>
            )}

            {produce.marketValueAndGlobalDemand && (
              <IconLabel icon={AreaChart} label="Market Value & Global Demand" className="bg-card rounded-lg shadow-lg">
                <p className="text-card-foreground/90 whitespace-pre-line">{produce.marketValueAndGlobalDemand}</p>
              </IconLabel>
            )}

            {/* New Agricultural Information Fields End Here */}

            <IconLabel icon={FlaskConical} label="Soil Suitability Checker (Future AI Feature)" className="bg-card rounded-lg shadow-lg">
              {produce.soilPreferences && produce.soilPreferences.trim() !== "" ? (
                <p className="text-card-foreground/90 mb-2">
                  This plant's general soil preferences: <span className="italic">{produce.soilPreferences}</span>
                </p>
              ) : (
                <p className="text-muted-foreground mb-2">
                  General soil preference information is not specified for this plant.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                An advanced AI-powered Soil Suitability Checker is coming soon! This feature will allow you to input your local soil and climate conditions for a detailed suitability analysis for this plant.
              </p>
            </IconLabel>

            <IconLabel icon={TestTubeDiagonal} label="Fertilizer & Treatment Guide (Coming Soon)" className="bg-card rounded-lg shadow-lg">
              <p className="text-sm text-muted-foreground">
                A comprehensive guide on organic and chemical fertilizers and treatments, including safe usage guidelines, is planned for this section. For current recommendations, please consult local agricultural extension services or qualified experts.
              </p>
            </IconLabel>

            <IconLabel icon={NotebookPen} label="Growth Tracker / Crop Journal (Coming Soon)" className="bg-card rounded-lg shadow-lg">
              <p className="text-sm text-muted-foreground">
                Track your planting progress! A personal Crop Journal feature is planned, allowing you to log planting dates, growth stages, notes, and even photos. This feature will require a user account to save your personalized data.
              </p>
            </IconLabel>

            <IconLabel icon={Newspaper} label="Agricultural News & Trends (Coming Soon)" className="bg-card rounded-lg shadow-lg">
              <p className="text-sm text-muted-foreground">
                Stay updated! This section will feature recent news and trends in the world of agriculture, offering insights and updates relevant to enthusiasts and professionals alike. Integration with a live news source is planned for a future update.
              </p>
            </IconLabel>
            
        </TabsContent>
      </Tabs>
    </div>
  );
}