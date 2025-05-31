'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Loader2, MapPin, Sun, Home, Maximize, Ruler, Target, Clock, Award, Leaf, Sprout, PawPrint, Flower } from 'lucide-react';
import type { LocationData, GrowPlannerData, PlantData } from '@/types/growPlanner';
import { saveGrowPlannerData, clearStagedGrowPlan } from '../../lib/userDataStore'; // Added clearStagedGrowPlan
import { getAllPlantData } from '../../lib/produceData';
import { getPlantRecommendations } from '../../lib/recommendationEngine';
import RecommendationResults from '../planner/RecommendationResults';

const TOTAL_STEPS = 6;

export default function PersonalizedGrowPlanner() {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<GrowPlannerData>>({
    location: { lat: undefined, lon: undefined, address: undefined, climateZone: undefined },
    purpose: [],
    spaceDimensions: { length: undefined, width: undefined, unit: 'meters' },
    timeCommitment: 'low',
    experience: 'beginner',
    sunlight: undefined,
    space: undefined,
  });

  const [allPlants, setAllPlants] = useState<PlantData[]>([]);
  const [recommendations, setRecommendations] = useState<PlantData[] | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingAllPlants, setIsLoadingAllPlants] = useState(false);


  useEffect(() => {
    const loadInitialData = async () => {
      if (showForm && allPlants.length === 0) { // Load only when form is shown and plants not yet loaded
        setIsLoadingAllPlants(true);
        try {
          const plants = await getAllPlantData();
          setAllPlants(plants);
        } catch (error) {
          console.error("Failed to load all plant data:", error);
          // Optionally, set an error state to show to the user
        } finally {
          setIsLoadingAllPlants(false);
        }
      }
    };
    loadInitialData();
  }, [showForm, allPlants.length]);


  const nextStep = () => setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleFormChange = (key: keyof GrowPlannerData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (key: keyof LocationData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...(prev.location || {}), [key]: value } as LocationData,
    }));
  };

  const handleDimensionChange = (key: 'length' | 'width' | 'unit', value: any) => {
    setFormData((prev) => ({
      ...prev,
      spaceDimensions: { ...(prev.spaceDimensions || { unit: 'meters' }), [key]: value },
    }));
  };

  const handlePurposeChange = (purposeValue: GrowPlannerData['purpose'][number], checked: boolean) => {
    setFormData((prev) => {
      const currentPurposes = prev.purpose || [];
      if (checked) {
        return { ...prev, purpose: [...currentPurposes, purposeValue] };
      } else {
        return { ...prev, purpose: currentPurposes.filter((p) => p !== purposeValue) };
      }
    });
  };

  const mapSliderValueToTime = (value: number): GrowPlannerData['timeCommitment'] => {
    if (value === 0) return 'low';
    if (value === 1) return 'medium';
    if (value === 2) return 'high';
    return 'low';
  };

  const mapTimeToSliderValue = (time: GrowPlannerData['timeCommitment']): number => {
    if (time === 'low') return 0;
    if (time === 'medium') return 1;
    if (time === 'high') return 2;
    return 0;
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationChange('lat', position.coords.latitude);
          handleLocationChange('lon', position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Could not detect location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const resetFormAndRecommendations = () => {
    setShowForm(false); // Or true if you want to keep the form open
    setCurrentStep(1);
    setFormData({
      location: { lat: undefined, lon: undefined, address: undefined, climateZone: undefined },
      purpose: [],
      spaceDimensions: { length: undefined, width: undefined, unit: 'meters' },
      timeCommitment: 'low',
      experience: 'beginner',
      sunlight: undefined,
      space: undefined,
    });
    setRecommendations(null); // Clear recommendations
    // allPlants remains loaded
  };

  const handleBackToPlanner = () => {
    setRecommendations(null); // Clear recommendations to show the form again
    setCurrentStep(TOTAL_STEPS); // Optionally go back to the last step or step 1
  };


  const handleSubmit = async () => {
    const fullFormData: GrowPlannerData = {
      planId: `plan-${Date.now()}`,
      userId: undefined,
      location: formData.location || {},
      space: formData.space || 'balcony',
      spaceDimensions: formData.spaceDimensions,
      sunlight: formData.sunlight || 'partial',
      purpose: formData.purpose || [],
      timeCommitment: formData.timeCommitment || 'low',
      experience: formData.experience || 'beginner',
      createdAt: new Date().toISOString(),
      customName: formData.customName || `My Grow Plan ${new Date().toLocaleDateString()}`,
    };

    if (!fullFormData.location.lat && !fullFormData.location.lon && !fullFormData.location.address && !fullFormData.location.climateZone && !fullFormData.location.climateZone) {
        alert("Please provide some location information (coordinates or climate zone).");
        setCurrentStep(1); return;
    }
    if (!fullFormData.space) {
        alert("Please select your growing space type."); setCurrentStep(2); return;
    }
    if (!fullFormData.sunlight) {
        alert("Please select the sunlight exposure."); setCurrentStep(3); return;
    }
    if (fullFormData.purpose.length === 0) {
        alert("Please select at least one purpose for growing."); setCurrentStep(4); return;
    }

    setIsLoadingRecommendations(true);
    try {
      // Simulate delay for fetching recommendations if needed, or for getAllPlantData if it was just called
      // await new Promise(resolve => setTimeout(resolve, 1000));

      if (allPlants.length === 0 && !isLoadingAllPlants) {
        // This case should ideally be handled by the useEffect, but as a fallback:
        console.warn("All plants data not loaded yet. Attempting to load now...");
        setIsLoadingAllPlants(true);
        const plants = await getAllPlantData();
        setAllPlants(plants);
        setIsLoadingAllPlants(false);
        if (plants.length === 0) {
            alert("Could not load plant data for recommendations. Please try again.");
            setIsLoadingRecommendations(false);
            return;
        }
        const plantRecs = getPlantRecommendations(fullFormData, plants);
        setRecommendations(plantRecs);
      } else if (isLoadingAllPlants) {
        alert("Plant data is still loading. Please wait a moment and try again.");
        setIsLoadingRecommendations(false);
        return;
      } else {
        const plantRecs = getPlantRecommendations(fullFormData, allPlants);
        setRecommendations(plantRecs);
      }

      clearStagedGrowPlan(); // Clear any previous staged plan before new recommendations
      saveGrowPlannerData(fullFormData); // Save the planner settings that generated these recommendations
      console.log("Grow Planner Data saved:", fullFormData);

    } catch (error) {
        console.error("Failed to get recommendations or save Grow Plan:", error);
        alert("There was an error processing your request. Please try again.");
    } finally {
        setIsLoadingRecommendations(false);
    }
  };


  if (!showForm) {
    return (
      <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <CardHeader className="flex flex-row items-center gap-3">
          <Sprout size={28} className="text-primary group-hover:animate-sprout origin-bottom transition-transform duration-300" />
          <CardTitle className="font-serif">Personalized Grow Planner</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            Answer a few questions to get tailored plant recommendations for your space and preferences.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setShowForm(true)}>
            Get Started
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isLoadingAllPlants && recommendations === null) {
    return (
        <Card className="rounded-2xl h-full flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading Plant Data...</p>
            <p className="text-sm text-muted-foreground">Getting everything ready for your recommendations.</p>
        </Card>
    );
  }

  if (isLoadingRecommendations) {
    return (
        <Card className="rounded-2xl h-full flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Generating Your Recommendations...</p>
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
        </Card>
    );
  }

  if (recommendations !== null) {
    return <RecommendationResults recommendations={recommendations} onBack={handleBackToPlanner} />;
  }

  // Render the multi-step form
  return (
    <Card className="rounded-2xl h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          {currentStep === 1 && <><MapPin className="mr-2 h-5 w-5 inline text-primary" />Step 1: Your Location</>}
          {currentStep === 2 && <><Home className="mr-2 h-5 w-5 inline text-primary" />Step 2: Your Growing Space</>}
          {currentStep === 3 && <><Sun className="mr-2 h-5 w-5 inline text-primary" />Step 3: Sunlight Exposure</>}
          {currentStep === 4 && <><Target className="mr-2 h-5 w-5 inline text-primary" />Step 4: Purpose of Growing</>}
          {currentStep === 5 && <><Clock className="mr-2 h-5 w-5 inline text-primary" />Step 5: Time Commitment</>}
          {currentStep === 6 && <><Award className="mr-2 h-5 w-5 inline text-primary" />Step 6: Your Gardening Experience</>}
        </CardTitle>
        <CardDescription>
            {currentStep === 1 && "Help us understand your growing environment."}
            {currentStep === 2 && "Where do you plan to grow your plants?"}
            {currentStep === 3 && "How much direct sunlight does this space receive daily?"}
            {currentStep === 4 && "What do you want to grow? Select all that apply."}
            {currentStep === 5 && "How much time can you dedicate to plant care each week?"}
            {currentStep === 6 && "How would you rate your gardening skills?"}
        </CardDescription>
         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            ></div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-6 overflow-y-auto py-4 min-h-[300px]"> {/* Added min-h for consistent form height */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Button onClick={handleDetectLocation} variant="outline" className="w-full">
              <MapPin className="mr-2 h-4 w-4" /> Detect My Location
            </Button>
            <div className="text-center my-2 text-sm text-muted-foreground">OR</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat" type="number" placeholder="e.g., 34.0522"
                  value={formData.location?.lat || ''}
                  onChange={(e) => handleLocationChange('lat', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lon">Longitude</Label>
                <Input
                  id="lon" type="number" placeholder="e.g., -118.2437"
                  value={formData.location?.lon || ''}
                  onChange={(e) => handleLocationChange('lon', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Predominant Climate Zone (Optional)</Label>
              <RadioGroup
                value={formData.location?.climateZone || ''}
                onValueChange={(value) => handleLocationChange('climateZone', value)}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {["Temperate", "Tropical", "Arid", "Continental", "Polar"].map((zone) => (
                  <Label key={zone} htmlFor={`climate-${zone}`} className={`flex items-center justify-center text-center border p-3 rounded-md cursor-pointer hover:bg-accent ${formData.location?.climateZone === zone ? 'border-primary bg-accent' : ''}`}>
                    <RadioGroupItem value={zone} id={`climate-${zone}`} className="sr-only" />
                    <span>{zone}</span>
                  </Label>
                ))}
              </RadioGroup>
               <p className="text-xs text-muted-foreground pt-1">
                Knowing your climate helps us suggest the most suitable plants. If unsure, we can infer from coordinates.
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Type of Space</Label>
              <RadioGroup
                value={formData.space || ''}
                onValueChange={(value) => handleFormChange('space', value as GrowPlannerData['space'])}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {[
                  { value: 'indoor', label: 'Indoor', icon: <Home className="mr-2 h-4 w-4" /> },
                  { value: 'balcony', label: 'Balcony', icon: <Maximize className="mr-2 h-4 w-4" /> },
                  { value: 'small_yard', label: 'Small Yard', icon: <Ruler className="mr-2 h-4 w-4" /> },
                  { value: 'large_garden', label: 'Large Garden', icon: <Sprout className="mr-2 h-4 w-4" /> },
                  { value: 'greenhouse', label: 'Greenhouse', icon: <Home className="mr-2 h-4 w-4" /> },
                ].map((spaceOpt) => (
                  <Label key={spaceOpt.value} htmlFor={`space-${spaceOpt.value}`}
                    className={`flex items-center justify-center text-center border p-3 rounded-md cursor-pointer hover:bg-accent ${formData.space === spaceOpt.value ? 'border-primary bg-accent' : ''}`}>
                    <RadioGroupItem value={spaceOpt.value} id={`space-${spaceOpt.value}`} className="sr-only" />
                    {spaceOpt.icon} <span>{spaceOpt.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-4 pt-4">
              <Label className="font-medium">Optional: Space Dimensions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Input id="length" type="number" placeholder="e.g., 5"
                    value={formData.spaceDimensions?.length || ''}
                    onChange={(e) => handleDimensionChange('length', e.target.value ? parseFloat(e.target.value) : undefined)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input id="width" type="number" placeholder="e.g., 2"
                    value={formData.spaceDimensions?.width || ''}
                    onChange={(e) => handleDimensionChange('width', e.target.value ? parseFloat(e.target.value) : undefined)} />
                </div>
              </div>
              <div className="space-y-2"> <Label>Unit</Label>
                <RadioGroup value={formData.spaceDimensions?.unit || 'meters'}
                  onValueChange={(value) => handleDimensionChange('unit', value as 'meters' | 'feet')}
                  className="flex space-x-4">
                  {["meters", "feet"].map((unit) => (
                    <div key={unit} className="flex items-center space-x-2">
                      <RadioGroupItem value={unit} id={`unit-${unit}`} />
                      <Label htmlFor={`unit-${unit}`}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <TooltipProvider>
            <RadioGroup value={formData.sunlight || ''}
              onValueChange={(value) => handleFormChange('sunlight', value as GrowPlannerData['sunlight'])}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Low Light', desc: '< 3 hrs direct sun' },
                { value: 'partial', label: 'Partial Sun', desc: '3-6 hrs direct sun' },
                { value: 'full', label: 'Full Sun', desc: '> 6 hrs direct sun' },
              ].map((sunOpt) => (
                <Tooltip key={sunOpt.value} delayDuration={100}>
                  <TooltipTrigger asChild>
                     <Label htmlFor={`sunlight-${sunOpt.value}`}
                      className={`flex flex-col items-center justify-center text-center space-y-1 border p-4 rounded-md cursor-pointer hover:bg-accent ${formData.sunlight === sunOpt.value ? 'border-primary bg-accent' : ''}`}>
                      <RadioGroupItem value={sunOpt.value} id={`sunlight-${sunOpt.value}`} className="sr-only" />
                      <Sun className={`h-6 w-6 ${formData.sunlight === sunOpt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">{sunOpt.label}</span>
                      <span className="text-xs text-muted-foreground">{sunOpt.desc}</span>
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent><p>{sunOpt.desc}</p></TooltipContent>
                </Tooltip>
              ))}
            </RadioGroup>
          </TooltipProvider>
        )}

        {currentStep === 4 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { value: 'vegetables', label: 'Vegetables', icon: <Leaf className="mr-2 h-4 w-4" /> },
              { value: 'herbs', label: 'Herbs', icon: <Sprout className="mr-2 h-4 w-4" /> },
              { value: 'fruits', label: 'Fruits', icon: <Flower className="mr-2 h-4 w-4 text-red-500" /> },
              { value: 'flowers', label: 'Flowers', icon: <Flower className="mr-2 h-4 w-4 text-pink-500" /> },
              { value: 'medicinal', label: 'Medicinal', icon: <Leaf className="mr-2 h-4 w-4 text-green-600" /> },
              { value: 'pet_safe', label: 'Pet-Safe', icon: <PawPrint className="mr-2 h-4 w-4" /> },
            ].map((purposeOpt) => (
              <Label key={purposeOpt.value} htmlFor={`purpose-${purposeOpt.value}`}
                className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent ${formData.purpose?.includes(purposeOpt.value as any) ? 'border-primary bg-accent' : ''}`}>
                <Checkbox id={`purpose-${purposeOpt.value}`}
                  checked={formData.purpose?.includes(purposeOpt.value as any)}
                  onCheckedChange={(checked) => handlePurposeChange(purposeOpt.value as any, !!checked)}
                  className="form-checkbox" />
                {purposeOpt.icon} <span className="text-sm">{purposeOpt.label}</span>
              </Label>
            ))}
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4 pt-2">
            <Slider min={0} max={2} step={1}
              value={[mapTimeToSliderValue(formData.timeCommitment || 'low')]}
              onValueChange={(value) => handleFormChange('timeCommitment', mapSliderValueToTime(value[0]))}
              className="my-6" />
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground px-1">
              <span>Low Maint. (&lt;2 hrs/wk)</span>
              <span>Medium (2-5 hrs/wk)</span>
              <span>High (&gt;5 hrs/wk)</span>
            </div>
          </div>
        )}

        {currentStep === 6 && (
           <RadioGroup value={formData.experience || 'beginner'}
            onValueChange={(value) => handleFormChange('experience', value as GrowPlannerData['experience'])}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { value: 'beginner', label: 'Beginner', desc: "I'm new to this!" },
              { value: 'intermediate', label: 'Intermediate', desc: 'I have some experience.' },
              { value: 'advanced', label: 'Advanced', desc: 'I have a green thumb!' },
            ].map((expOpt) => (
              <Label key={expOpt.value} htmlFor={`exp-${expOpt.value}`}
                className={`flex flex-col items-center justify-center text-center space-y-1 border p-4 rounded-md cursor-pointer hover:bg-accent ${formData.experience === expOpt.value ? 'border-primary bg-accent' : ''}`}>
                <RadioGroupItem value={expOpt.value} id={`exp-${expOpt.value}`} className="sr-only" />
                <Award className={`h-6 w-6 ${formData.experience === expOpt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium">{expOpt.label}</span>
                <span className="text-xs text-muted-foreground">{expOpt.desc}</span>
              </Label>
            ))}
          </RadioGroup>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-6 mt-auto">
        <Button variant="outline" onClick={currentStep === 1 ? resetFormAndRecommendations : prevStep} className="px-6">
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep < TOTAL_STEPS && (
          <Button onClick={nextStep} className="px-6">Next</Button>
        )}
        {currentStep === TOTAL_STEPS && (
          <Button onClick={handleSubmit} className="px-6" disabled={isLoadingAllPlants || isLoadingRecommendations}>
            {isLoadingRecommendations || isLoadingAllPlants ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get Recommendations
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
