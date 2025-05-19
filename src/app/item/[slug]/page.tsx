
'use client'; // For localStorage access and useEffect

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { getProduceByCommonName, type ProduceInfo } from '@/lib/produceData';
import { getProduceOffline, saveProduceOffline } from '@/lib/offlineStore';
import NutrientChart from '@/components/charts/NutrientChart';
import VitaminChart from '@/components/charts/VitaminChart';
import MineralChart from '@/components/charts/MineralChart';
import IconLabel from '@/components/ui/IconLabel';
import Loader from '@/components/ui/Loader';
import { Badge } from '@/components/ui/badge';
import {
  Leaf, Globe, Languages, MapPin, Activity, Heart, AlertTriangle, Sprout, CalendarDays, Info, WifiOff, MessageCircleWarning
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const getSeverityBadgeVariant = (severity: ProduceInfo['potentialAllergies'][0]['severity']): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case 'Severe':
      return 'destructive';
    case 'Moderate':
      return 'default'; // Using default for moderate, which is primary color
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


export default function ItemPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [produce, setProduce] = useState<ProduceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineSource, setIsOfflineSource] = useState(false);

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
      }

      setIsLoading(false);
    }

    fetchData();
  }, [slug]);

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
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
          <Leaf size={40} /> {produce.commonName}
        </h1>
        <p className="text-xl text-muted-foreground italic">{produce.scientificName}</p>
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
    </div>
  );
}

