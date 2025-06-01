'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getPlannerData,
  savePlannerData,
} from '@/lib/userDataStore';
import type { PlannerData } from '@/types/planner'; // Corrected path for PlannerData

// Import all the step components
import LocationStep from '@/components/planner/LocationStep';
import GrowingSpaceStep from '@/components/planner/GrowingSpaceStep';
import SunlightExposureStep from '@/components/planner/SunlightExposureStep';
import PurposeStep from '@/components/planner/PurposeStep';
import ExperienceLevelStep from '@/components/planner/ExperienceLevelStep';
import TimeCommitmentStep from '@/components/planner/TimeCommitmentStep';
import ProgressBar from '@/components/planner/ProgressBar';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface PlannerStep {
  id: number;
  name: string;
  component: React.FC<any>;
  fields: (keyof PlannerData)[];
}

const steps: PlannerStep[] = [
  { id: 1, name: 'Location', component: LocationStep, fields: ['location'] },
  { id: 2, name: 'Growing Space', component: GrowingSpaceStep, fields: ['space'] },
  { id: 3, name: 'Sunlight Exposure', component: SunlightExposureStep, fields: ['sunlight'] },
  { id: 4, name: 'Gardening Purpose', component: PurposeStep, fields: ['purpose'] },
  { id: 5, name: 'Experience Level', component: ExperienceLevelStep, fields: ['experience'] },
  { id: 6, name: 'Time Commitment', component: TimeCommitmentStep, fields: ['timeCommitment'] },
];

const TOTAL_STEPS = steps.length;

export default function PlannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<Partial<PlannerData>>(() => {
    if (typeof window !== 'undefined') { // Ensure localStorage is available
        const existingData = getPlannerData();
        if (existingData) {
            return existingData;
        }
    }
    return { // Default initial state if no existing data or not in browser yet
      userId: undefined, // Will be set on save
      location: { lat: null, lon: null, climateZone: '', simplifiedClimate: '' },
      space: '',
      sunlight: '',
      purpose: [],
      experience: '',
      timeCommitment: '',
      createdAt: undefined, // Will be set on save
    };
  });

  useEffect(() => {
    // This effect runs once on mount on the client to ensure hydration matches server if possible,
    // and then loads from localStorage.
    const existingData = getPlannerData();
    if (existingData) {
      setFormData(existingData);
    } else {
        // If no data in localStorage, ensure a default structure with potential undefined for userId/createdAt
        setFormData({
            userId: undefined,
            location: { lat: null, lon: null, climateZone: '', simplifiedClimate: '' },
            space: '',
            sunlight: '',
            purpose: [],
            experience: '',
            timeCommitment: '',
            createdAt: undefined,
        });
    }
  }, []);

  const handleNext = () => {
    // TODO: Add validation logic here for the current step's data in formData
    // using steps[currentStep - 1].fields to know which fields to validate.
    // For now, we proceed assuming data is valid.

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - prepare and save data
      const finalData: PlannerData = {
        userId: formData.userId || `user_${new Date().getTime()}`,
        location: {
            lat: formData.location?.lat || null,
            lon: formData.location?.lon || null,
            climateZone: formData.location?.climateZone || '',
            simplifiedClimate: formData.location?.simplifiedClimate || '',
        },
        space: formData.space || '',
        sunlight: formData.sunlight || '',
        purpose: formData.purpose || [],
        experience: formData.experience || '',
        timeCommitment: formData.timeCommitment || '',
        createdAt: formData.createdAt || new Date().toISOString(),
      };

      savePlannerData(finalData);
      toast({
        title: 'Grow Planner Saved!',
        description: 'Your preferences have been saved. You can now get personalized advice.',
        variant: 'success', // Assuming 'success' variant exists or use default
      });
      router.push('/');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: Partial<PlannerData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const CurrentStepComponent = steps.find(step => step.id === currentStep)?.component;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
      <Card className="shadow-xl rounded-xl overflow-hidden bg-card text-card-foreground">
        <CardHeader className="bg-muted/50 dark:bg-muted/20 p-6">
          {TOTAL_STEPS > 0 && <ProgressBar currentStep={currentStep -1} totalSteps={TOTAL_STEPS} className="mb-4"/>}
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Your Grow Planner
          </CardTitle>
          {steps.find(step => step.id === currentStep)?.name && (
            <CardDescription className="text-center text-muted-foreground mt-1">
              Step {currentStep} of {TOTAL_STEPS}: {steps.find(step => step.id === currentStep)?.name}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6 sm:p-8 min-h-[300px]"> {/* Added min-height */}
          {CurrentStepComponent ? (
            <CurrentStepComponent
              onDataChange={updateFormData} // Prop name used in PersonalizedGrowPlanner.tsx was onNext
              data={formData} // Prop name used in PersonalizedGrowPlanner.tsx was data
              // The step components (LocationStep etc.) need to be adapted to use `onDataChange` and `data`
              // or this component needs to pass props like `onNext` and `onBack` if they are structured like PersonalizedGrowPlanner
            />
          ) : (
            <p>Step component not found.</p>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 dark:bg-muted/20 p-6 flex justify-between items-center border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600">
            {currentStep === TOTAL_STEPS ? 'Finish & Save' : 'Next'}
            {currentStep === TOTAL_STEPS ? <CheckCircle className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
