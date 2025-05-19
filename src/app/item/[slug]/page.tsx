'use client'; // For localStorage access and useEffect

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { getProduceByCommonName, type ProduceInfo } from '@/lib/produceData';
import { getProduceOffline, saveProduceOffline } from '@/lib/offlineStore';
import NutrientChart from '@/components/charts/NutrientChart';
import IconLabel from '@/components/ui/IconLabel';
import Loader from '@/components/ui/Loader';
import { Badge } from '@/components/ui/badge';
import {
  Leaf, BookOpen, Globe, Languages, MapPin, Activity, Heart, AlertTriangle, Sprout, CalendarDays, Info
} from 'lucide-react';

export default function ItemPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [produce, setProduce] = useState<ProduceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      let itemData: ProduceInfo | null = null;

      if (typeof window !== 'undefined' && !navigator.onLine) {
         setIsOffline(true);
      }
      
      // Try offline storage first
      itemData = getProduceOffline(slug);

      if (itemData) {
        setProduce(itemData);
      } else {
        // If not offline or not found in offline storage, fetch from "source" (mock data)
        // In a real app, this might be an API call
        const onlineData = getProduceByCommonName(slug);
        if (onlineData) {
          setProduce(onlineData);
          saveProduceOffline(onlineData); // Save for offline access
        } else {
          setProduce(null); // Triggers notFound below
        }
      }
      setIsLoading(false);
    }

    fetchData();
  }, [slug]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader text="Loading AgriPedia data..." size={48}/></div>;
  }

  if (!produce) {
    notFound(); // Or display a custom not found component
    return null;
  }

  return (
    <div className="space-y-8 py-8">
      {isOffline && (
        <div className="p-4 bg-accent text-accent-foreground rounded-md text-center">
          You are currently viewing this page offline. Some content may be limited.
        </div>
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
        <IconLabel icon={Sprout} label="Cultivation Process" className="md:col-span-2">
          <p className="whitespace-pre-line">{produce.cultivationProcess}</p>
        </IconLabel>
      </div>
      
      <section>
        <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2"><Activity className="text-primary"/>Nutritional Information</h2>
        <p className="text-muted-foreground mb-4">Calories: {produce.nutrition.calories}</p>
        <NutrientChart data={produce.nutrition.macronutrients} />
        <div className="grid md:grid-cols-2 gap-6 mt-6">
            <IconLabel icon={BookOpen} label="Vitamins">
                <ul className="space-y-1">
                    {produce.nutrition.vitamins.map(v => <li key={v.name}>{v.name}: {v.value}{v.unit} {v.rdi && `(${v.rdi} RDI)`}</li>)}
                </ul>
            </IconLabel>
            <IconLabel icon={BookOpen} label="Minerals">
                 <ul className="space-y-1">
                    {produce.nutrition.minerals.map(m => <li key={m.name}>{m.name}: {m.value}{m.unit} {m.rdi && `(${m.rdi} RDI)`}</li>)}
                </ul>
            </IconLabel>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <IconLabel icon={Heart} label="Health Benefits">
          <ul className="list-disc list-inside space-y-1">
            {produce.healthBenefits.map(benefit => <li key={benefit}>{benefit}</li>)}
          </ul>
        </IconLabel>
        <IconLabel icon={AlertTriangle} label="Potential Allergies">
          <ul className="list-disc list-inside space-y-1">
            {produce.potentialAllergies.map(allergy => <li key={allergy}>{allergy}</li>)}
          </ul>
        </IconLabel>
      </div>
    </div>
  );
}
