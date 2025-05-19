
'use client'; // For localStorage access and useEffect

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { getProduceByCommonName, type ProduceInfo } from '@/lib/produceData';
import { getProduceOffline, saveProduceOffline } from '@/lib/offlineStore';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/userDataStore';
import NutrientChart from '@/components/charts/NutrientChart';
import VitaminChart from '@/components/charts/VitaminChart';
import MineralChart from '@/components/charts/MineralChart';
import IconLabel from '@/components/ui/IconLabel';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Leaf, Globe, Languages, MapPin, Activity, Heart, AlertTriangle, Sprout, CalendarDays, Info, WifiOff, MessageCircleWarning,
  CalendarCheck2, CalendarX2, Store, LocateFixed, BookmarkPlus, BookmarkCheck
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
      return 'outline';
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
            saveProduceOffline(onlineData); // Save to offline store on successful fetch
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
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
          <Leaf size={40} /> {produce.commonName}
        </h1>
        <p className="text-xl text-muted-foreground italic">{produce.scientificName}</p>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleBookmark} 
            className="absolute top-0 right-0 text-primary hover:text-accent"
            aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isBookmarked ? <BookmarkCheck size={28} className="fill-accent" /> : <BookmarkPlus size={28} />}
        </Button>
      </header>

      <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden shadow-xl">
        <Image
          src={produce.image}
          alt={produce.commonName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 672px"
          style={{ objectFit: 'cover' }}
          data-ai-hint={`${produce.commonName.toLowerCase()} detail view`}
          priority
        />
      </div>
      
      <IconLabel icon={Info} label="Description" className="bg-card-foreground/5">
        <p>{produce.description}</p>
      </IconLabel>

      <div className="grid md:grid-cols-2 gap-6">
        <IconLabel icon={Globe} label="Origin">
          <p>{produce.origin}</p>
        </IconLabel>
        <IconLabel icon={MapPin} label="Major Growing Regions">
          <ul className="list-disc list-inside">
            {produce.regions.map(region => <li key={region}>{region}</li>)}
          </ul>
        </IconLabel>
        <IconLabel icon={Languages} label="Local Names">
          <div className="flex flex-wrap gap-2">
            {produce.localNames.map(name => <Badge key={name} variant="secondary">{name}</Badge>)}
          </div>
        </IconLabel>
        <IconLabel icon={CalendarDays} label="Growth Duration">
          <p>{produce.growthDuration}</p>
        </IconLabel>
        <IconLabel icon={Sprout} label="Cultivation Process & Ideal Conditions" className="md:col-span-2">
          <p className="whitespace-pre-line">{produce.cultivationProcess}</p>
        </IconLabel>
      </div>
      
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2 justify-center"><Activity className="text-primary"/>Nutritional Information</h2>
        <p className="text-muted-foreground mb-6 text-center">Calories per 100g: {produce.nutrition.calories}</p>
        
        <NutrientChart data={produce.nutrition.macronutrients} />
        
        {(produce.nutrition.vitamins && produce.nutrition.vitamins.length > 0) && (
            <VitaminChart data={produce.nutrition.vitamins} className="mt-6" />
        )}
        
        {(produce.nutrition.minerals && produce.nutrition.minerals.length > 0) && (
            <MineralChart data={produce.nutrition.minerals} className="mt-6" />
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <IconLabel icon={Heart} label="Health Benefits">
          <ul className="list-disc list-inside space-y-1">
            {produce.healthBenefits.map(benefit => <li key={benefit}>{benefit}</li>)}
          </ul>
        </IconLabel>
        <IconLabel icon={AlertTriangle} label="Potential Allergies & Sensitivities">
           {produce.potentialAllergies.length > 0 ? (
            <ul className="space-y-3">
              {produce.potentialAllergies.map((allergy, index) => (
                <li key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                     <MessageCircleWarning className="h-4 w-4 text-destructive" />
                    <span className="font-medium">{allergy.name}</span>
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
        <IconLabel 
          icon={isCurrentlyInSeason === null ? CalendarDays : isCurrentlyInSeason ? CalendarCheck2 : CalendarX2} 
          label="Seasonal Availability"
        >
          {isCurrentlyInSeason === null ? (
            <Loader text="Checking seasonality..." size={16} />
          ) : (
            <p>{currentSeasonMessage}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Note: Seasonality can vary by specific locale and year.</p>
        </IconLabel>

        <IconLabel icon={Store} label="Find Locally (Future Feature)">
          <Button onClick={handleLocationClick} disabled={isLocating} variant="outline" className="w-full sm:w-auto">
            {isLocating ? <Loader text="Getting location..." size={18} /> : <><LocateFixed className="mr-2 h-4 w-4" /> Use My Location</>}
          </Button>
          {locationInfo && (
            <Alert variant={locationInfo.startsWith("Location (Lat:") ? "default" : "destructive"} className="mt-4 text-sm">
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

