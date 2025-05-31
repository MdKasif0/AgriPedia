'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlantData, StagedGrowPlan } from '../../types/growPlanner'; // Adjusted path
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Sun, Droplets, CalendarDays, Clock, Leaf, ShieldAlert, CheckCircle2, PlusCircle, MinusCircle, Info } from 'lucide-react'; // Added more icons
import {
  addPlantToStagedPlan,
  removePlantFromStagedPlan,
  getStagedGrowPlan
} from '../../lib/userDataStore'; // Adjusted path

interface RecommendationResultsProps {
  recommendations: PlantData[];
  onBack: () => void;
}

// Helper to format planting months (remains the same)
const formatPlantingMonths = (plant: PlantData): string => {
  if (!plant.plantingMonths) return 'N/A';
  const currentMonth = new Date().getMonth() + 1;
  const isNorthernHemisphere = true;
  let months: number[] = [];
  if (Array.isArray(plant.plantingMonths)) {
    months = plant.plantingMonths;
  } else if (typeof plant.plantingMonths === 'object') {
    months = isNorthernHemisphere ? plant.plantingMonths.north : plant.plantingMonths.south;
  }
  if (!months || months.length === 0) return 'N/A';
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const relevantMonthNames = months.map(m => monthNames[m - 1]).join(', ');
  const isPlantableNow = months.includes(currentMonth);
  return `${relevantMonthNames} (${isPlantableNow ? 'Plant Now' : 'Seasonally'})`;
};


export default function RecommendationResults({ recommendations, onBack }: RecommendationResultsProps) {
  const router = useRouter();
  const [stagedPlan, setStagedPlan] = useState<StagedGrowPlan | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client where localStorage is available
    if (typeof window !== 'undefined') {
      setStagedPlan(getStagedGrowPlan());
    }
  }, []);

  const handleToggleStagedPlant = (plantId: string) => {
    let updatedPlan;
    if (stagedPlan?.plantIds.includes(plantId)) {
      updatedPlan = removePlantFromStagedPlan(plantId);
      alert(`"${recommendations.find(p=>p.id === plantId)?.commonName}" removed from your current selection.`);
    } else {
      updatedPlan = addPlantToStagedPlan(plantId);
      alert(`"${recommendations.find(p=>p.id === plantId)?.commonName}" added to your current selection.`);
    }
    setStagedPlan(updatedPlan);
  };

  const handleLearnMore = (plantId: string) => {
    router.push(`/item/${plantId}`);
  };

  if (!recommendations) {
    return (
        <div className="container mx-auto p-4">
            <Button onClick={onBack} variant="outline" className="mb-4">&larr; Back to Planner</Button>
            <p className="text-center text-muted-foreground">Loading recommendations...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button onClick={onBack} variant="outline" className="mb-6 text-base px-6 py-3">
        &larr; Back to Planner
      </Button>
      <h1 className="text-3xl font-bold text-center mb-2">Your Plant Recommendations</h1>
      {stagedPlan && stagedPlan.plantIds.length > 0 && (
        <p className="text-center text-muted-foreground mb-8">
          You have {stagedPlan.plantIds.length} plant(s) in your current selection.
        </p>
      )}


      {recommendations.length === 0 ? (
        <Card className="text-center p-8 mt-8">
          <CardHeader>
            <CardTitle>No Plants Match Your Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We couldn't find any plants that perfectly match all your selections.
            </p>
            <Button onClick={onBack}>Try Adjusting Planner Settings</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((plant) => {
            const isInStagedPlan = stagedPlan?.plantIds.includes(plant.id) ?? false;
            return (
              <Card key={plant.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold font-serif">{plant.commonName}</CardTitle>
                  <CardDescription className="text-sm italic">{plant.scientificName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3 pt-2">
                  <div className="relative w-full h-48 rounded-md overflow-hidden mb-3">
                    <Image
                      src={plant.image || '/placeholder-plant.jpg'}
                      alt={plant.commonName}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={recommendations.indexOf(plant) < 3}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground h-20 overflow-y-auto pr-1 scrollbar-thin">
                    {plant.shortSummary || plant.description || "No summary available."}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center"><Sun size={16} className="mr-2 text-amber-500" /><strong>Sunlight:</strong>&nbsp;{plant.sunlightRequirement || 'N/A'}</div>
                    <div className="flex items-center"><Droplets size={16} className="mr-2 text-blue-500" /><strong>Water:</strong>&nbsp;{plant.waterNeeds || 'N/A'}</div>
                    <div className="flex items-center"><CalendarDays size={16} className="mr-2 text-green-600" /><strong>Planting:</strong>&nbsp;{formatPlantingMonths(plant)}</div>
                    <div className="flex items-center"><Clock size={16} className="mr-2 text-gray-600" /><strong>Harvest:</strong>&nbsp;{plant.daysToHarvest ? `${plant.daysToHarvest.min}-${plant.daysToHarvest.max} days` : plant.growthDuration || 'N/A'}</div>
                  </div>

                  <div className="pt-2 space-x-1 space-y-1 flex flex-wrap items-center">
                    {plant.skillLevel && <Badge variant="outline">{plant.skillLevel}</Badge>}
                    {plant.spaceType?.map(st => <Badge key={st} variant="secondary" className="capitalize">{st.replace(/_/g, ' ')}</Badge>)}
                    {plant.isPetSafe === true && <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle2 size={12} className="mr-1 inline"/>Pet Safe</Badge>}
                    {plant.isPetSafe === false && <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200"><ShieldAlert size={12} className="mr-1 inline"/>Toxic to Pets</Badge>}
                    {plant.isIndoorFriendly === true && <Badge variant="outline"><Leaf size={12} className="mr-1 inline"/>Indoor Friendly</Badge>}
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-4 flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="w-full sm:w-auto flex-grow" onClick={() => handleLearnMore(plant.id)}>
                    <Info size={16} className="mr-2"/> Learn More
                  </Button>
                  <Button variant={isInStagedPlan ? "destructive" : "default"} className="w-full sm:w-auto flex-grow" onClick={() => handleToggleStagedPlant(plant.id)}>
                    {isInStagedPlan ? <><MinusCircle size={16} className="mr-2"/>Remove</> : <><PlusCircle size={16} className="mr-2"/>Add to Plan</>}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
