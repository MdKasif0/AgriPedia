'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { StagedGrowPlan, PlantData } from '../../types/growPlanner'; // Adjust path if necessary
import { getStagedGrowPlan, clearStagedGrowPlan } from '../../lib/userDataStore'; // Adjust path
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'; // Assuming these exist
import { Button } from '@/components/ui/button';
import { Loader2, Sun, Droplets, Sprout } from 'lucide-react'; // Assuming these exist

export default function GrowPlanPage() {
  const [stagedPlan, setStagedPlan] = useState<StagedGrowPlan | null>(null);
  const [detailedPlants, setDetailedPlants] = useState<PlantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allPlantsData, setAllPlantsData] = useState<PlantData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllPlants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/plants/all');
        if (!response.ok) {
          throw new Error(`Failed to fetch plant data: ${response.statusText}`);
        }
        const plants: PlantData[] = await response.json();
        setAllPlantsData(plants);
      } catch (err: any) {
        console.error("Error fetching all plant data:", err);
        setError(err.message || "Could not load plant data. Please try again later.");
      }
      // isLoading will be set to false in the second useEffect after staged plan is processed
    };
    fetchAllPlants();
  }, []);

  useEffect(() => {
    if (allPlantsData.length > 0) {
      const currentStagedPlan = getStagedGrowPlan();
      setStagedPlan(currentStagedPlan);

      if (currentStagedPlan && currentStagedPlan.plantIds && currentStagedPlan.plantIds.length > 0) {
        const planPlants = allPlantsData.filter(plant => currentStagedPlan.plantIds.includes(plant.id));
        setDetailedPlants(planPlants);
      } else {
        setDetailedPlants([]); // Ensure detailedPlants is empty if no staged plan or no IDs
      }
    }
    // Only set isLoading to false once allPlantsData has been processed (or if it's empty from fetch)
    // This prevents showing "empty plan" message prematurely if allPlantsData is still loading.
    if (!isLoading && allPlantsData.length === 0 && !error) {
        // If still loading allPlantsData, isLoading is true from the first effect.
        // If done loading allPlantsData and it's empty (and no error), then it's truly loaded.
    }
    setIsLoading(false); // Moved here, after all data processing for the current pass

  }, [allPlantsData, isLoading, error]); // Rerun when allPlantsData is populated or if initial loading state changes.

  const handleClearStagedPlan = () => {
    clearStagedGrowPlan();
    setStagedPlan(null);
    setDetailedPlants([]);
    alert("Your current Grow Plan selection has been cleared.");
  };

  const handleSavePlan = () => {
    // For now, this is a placeholder.
    // Future: This would involve saving `stagedPlan` to a more permanent user-specific list.
    if (!stagedPlan || stagedPlan.plantIds.length === 0) {
      alert("There are no plants in your current selection to save.");
      return;
    }
    alert(`Plan "${stagedPlan.customName || 'My Grow Plan'}" would be saved with ${stagedPlan.plantIds.length} plants.`);
    // Example: await saveUserGrowPlan(convertToUserGrowPlan(stagedPlan, detailedPlants));
    // Then potentially clear the staged plan or navigate.
  };


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your Grow Plan...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-6 text-destructive">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }


  if (!stagedPlan || detailedPlants.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Sprout size={48} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Grow Plan is Empty</h1>
        <p className="text-muted-foreground mb-6">
          You haven't added any plants to your current grow plan yet.
        </p>
        <Button asChild size="lg">
          <Link href="/">Find Plants to Grow</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">
          {stagedPlan.customName || "My Current Grow Plan"} ({detailedPlants.length} {detailedPlants.length === 1 ? 'plant' : 'plants'})
        </h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearStagedPlan}>Clear Current Plan</Button>
            <Button onClick={handleSavePlan} disabled={detailedPlants.length === 0}>
                Save this Plan
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {detailedPlants.map((plant) => (
          <Card key={plant.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative w-full h-40">
                <Image
                  src={plant.image || '/placeholder-plant.jpg'} // Ensure placeholder
                  alt={plant.commonName}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-2">
              <CardTitle className="text-lg font-semibold">{plant.commonName}</CardTitle>
              <CardDescription className="text-xs italic">{plant.scientificName}</CardDescription>
              <div className="text-sm space-y-1 pt-1">
                <div className="flex items-center"><Sun size={14} className="mr-2 text-amber-500" />Sun: {plant.sunlightRequirement}</div>
                <div className="flex items-center"><Droplets size={14} className="mr-2 text-blue-500" />Water: {plant.waterNeeds || 'N/A'}</div>
              </div>
               <p className="text-xs text-muted-foreground pt-1 h-12 overflow-y-auto scrollbar-thin">
                  {plant.shortSummary || plant.description?.substring(0,70)+"..." || "No summary."}
               </p>
            </CardContent>
            <CardFooter className="p-4 mt-auto">
              <Button asChild variant="default" className="w-full">
                <Link href={`/item/${plant.id}`}>View Full Guide</Link>
              </Button>
              {/* Optional: Add remove button here if needed directly on this page */}
            </CardFooter>
          </Card>
        ))}
      </div>
       {detailedPlants.length > 0 && (
         <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-2">Ready to finalize your garden?</p>
            <Button onClick={handleSavePlan} size="lg" disabled={detailedPlants.length === 0}>
                Save this Plan to My Collection
            </Button>
             <p className="text-xs text-muted-foreground mt-2">(This feature is coming soon!)</p>
        </div>
       )}
    </div>
  );
}
