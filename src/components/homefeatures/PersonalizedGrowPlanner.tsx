import React, { useState, useEffect, useRef } from 'react';
import LocationStep from '../planner/LocationStep';
import GrowingSpaceStep from '../planner/GrowingSpaceStep';
import SunlightExposureStep from '../planner/SunlightExposureStep';
import PurposeStep from '../planner/PurposeStep';
import TimeCommitmentStep from '../planner/TimeCommitmentStep';
import ExperienceLevelStep from '../planner/ExperienceLevelStep';
import ProgressBar from '../planner/ProgressBar';
import ErrorBoundary from '../ErrorBoundary';
import { Button } from '@/components/ui/button';
import { savePlannerData, getPlannerData, clearPlannerData } from '@/lib/userDataStore';
import type { PlannerData } from '@/types/planner';
import { recommendPlantsFlow } from '@/ai/flows/recommend-plants-flow'; // Import the new flow
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For displaying errors/info
import { Loader2 } from 'lucide-react'; // For loading spinner

const TOTAL_PLANNER_STEPS = 6; // Location to Experience Level

// Simple validation function (keep existing)
const isValidStepData = (data: any): boolean => {
  if (typeof data !== 'object' || data === null) {
    console.error("Validation Error: Step data is not an object.", data);
    return false;
  }
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (typeof data[key] === 'function') {
        console.error(`Validation Error: Step data for key '${key}' is a function.`, data);
        return false;
      }
      if (typeof data[key] === 'object' && data[key] !== null) {
        try {
          JSON.stringify(data[key]);
        } catch (e) {
          console.error(`Validation Error: Step data for key '${key}' is too complex or has circular references.`, data[key], e);
          return false;
        }
      }
    }
  }
  return true;
};


const PersonalizedGrowPlanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<PlannerData>>({}); // Use Partial<PlannerData>
  const [animationClass, setAnimationClass] = useState('animate-fadeIn');
  const [displayedStep, setDisplayedStep] = useState(currentStep);
  const previousStepRef = useRef<number>(currentStep);

  // State for AI recommendations
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  useEffect(() => {
    if (previousStepRef.current < currentStep) {
      setAnimationClass('animate-slideOutToLeft');
      setTimeout(() => {
        setDisplayedStep(currentStep);
        setAnimationClass('animate-slideInFromRight');
        previousStepRef.current = currentStep;
      }, 300);
    } else if (previousStepRef.current > currentStep) {
      setAnimationClass('animate-slideOutToRight');
      setTimeout(() => {
        setDisplayedStep(currentStep);
        setAnimationClass('animate-slideInFromLeft');
        previousStepRef.current = currentStep;
      }, 300);
    } else if (displayedStep !== currentStep) {
      setDisplayedStep(currentStep);
      setAnimationClass('animate-fadeIn');
    }
  }, [currentStep, displayedStep]);

  useEffect(() => {
    const loadedData = getPlannerData();
    if (loadedData) {
      console.log("Loaded planner data from local storage:", loadedData);
      setFormData(loadedData);
    }
  }, []);

  // Effect to call AI flow when planner is complete
  useEffect(() => {
    if (currentStep === TOTAL_PLANNER_STEPS && Object.keys(formData).length > 0) {
      const plannerToSave: PlannerData = {
        userId: formData.userId || "defaultUser123", // Ensure userId, fallback if needed
        createdAt: formData.createdAt || new Date().toISOString(), // Ensure createdAt
        location: formData.location!, // Assert location is present, should be by this step
        space: formData.space!,
        sunlight: formData.sunlight!,
        purpose: formData.purpose!,
        experience: formData.experience!,
        timeCommitment: formData.timeCommitment!,
        ...formData, // Spread the rest of formData
      };

      // Validate before saving and calling AI
      // This is a basic check; individual step data should already be structured correctly.
      // A more robust validation (perhaps using Zod schema) would be better here.
      if (!plannerToSave.location || !plannerToSave.space || !plannerToSave.sunlight || !plannerToSave.purpose || !plannerToSave.experience || !plannerToSave.timeCommitment) {
        console.error("Planner data is incomplete, not calling AI flow.", plannerToSave);
        setRecommendationError("Your planner profile is incomplete. Please start over and fill all steps.");
        return;
      }

      savePlannerData(plannerToSave);
      console.log("Planner data saved. Calling AI recommendation flow with:", plannerToSave);

      const fetchRecommendations = async () => {
        setIsLoadingRecommendations(true);
        setRecommendationError(null);
        setRecommendations([]);
        try {
          // Ensure all required fields for the flow are present
          // The flow's inputSchema (PlannerDataSchema) will validate this,
          // but it's good practice to ensure critical parts are there.
          if (!plannerToSave.location?.climateZone) {
            throw new Error("Climate zone is missing from planner data.");
          }

          const result = await recommendPlantsFlow(plannerToSave as PlannerData); // Cast to PlannerData
          setRecommendations(result);
        } catch (error: any) {
          console.error('Error fetching recommendations:', error);
          setRecommendationError(error.message || 'Failed to fetch recommendations.');
        } finally {
          setIsLoadingRecommendations(false);
        }
      };

      fetchRecommendations();
    }
  }, [currentStep, formData]);


  const handleNext = (stepData: any) => {
    if (!isValidStepData(stepData)) {
      console.error("Problematic step data received. Not merging:", stepData);
      if (currentStep < TOTAL_PLANNER_STEPS) {
        setCurrentStep(prev => prev + 1);
      }
      return;
    }

    setFormData(prev => ({ ...prev, ...stepData }));
    if (currentStep < TOTAL_PLANNER_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStartOver = () => {
    clearPlannerData();
    setCurrentStep(0);
    setFormData({});
    setRecommendations([]);
    setIsLoadingRecommendations(false);
    setRecommendationError(null);
    setDisplayedStep(0);
    previousStepRef.current = -1;
    setAnimationClass('animate-fadeIn');
  };


  const renderStep = () => {
    switch (displayedStep) {
      case 0:
        return <LocationStep onNext={handleNext} data={formData} onBack={() => {}} />;
      case 1:
        return <GrowingSpaceStep onNext={handleNext} onBack={handleBack} data={formData} />;
      case 2:
        return <SunlightExposureStep onNext={handleNext} onBack={handleBack} data={formData} />;
      case 3:
        return <PurposeStep onNext={handleNext} onBack={handleBack} data={formData} />;
      case 4:
        return <TimeCommitmentStep onNext={handleNext} onBack={handleBack} data={formData} />;
      case 5:
        return <ExperienceLevelStep onNext={handleNext} onBack={handleBack} data={formData} />;
      default: // Summary screen with AI recommendations
        return (
          <ErrorBoundary fallbackMessage="There was an issue displaying the summary or recommendations. Please try starting over.">
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Planner Complete!</h2>

              {isLoadingRecommendations && (
                <div className="flex flex-col items-center justify-center my-6">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">Finding the best plants for you...</p>
                </div>
              )}

              {recommendationError && (
                <Alert variant="destructive" className="my-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{recommendationError}</AlertDescription>
                </Alert>
              )}

              {!isLoadingRecommendations && !recommendationError && recommendations.length > 0 && (
                <div className="my-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Recommended Plants For You:</h3>
                  <ul className="list-disc list-inside text-left text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    {recommendations.map(plantId => (
                      <li key={plantId} className="mb-1 capitalize">{plantId.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!isLoadingRecommendations && !recommendationError && recommendations.length === 0 && currentStep === TOTAL_PLANNER_STEPS && (
                 <Alert className="my-4">
                  <AlertTitle>No Recommendations Yet</AlertTitle>
                  <AlertDescription>
                    We couldn't find specific recommendations based on your current preferences, or the AI is still processing.
                    If this persists, try adjusting your preferences or check back later.
                  </AlertDescription>
                </Alert>
              )}

              <p className="text-gray-700 dark:text-gray-300 mb-2 mt-6">Summary of your preferences:</p>
              <pre className="text-left text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto min-h-[100px]">
                {JSON.stringify(formData, null, 2)}
              </pre>
              <Button onClick={handleStartOver} className="mt-6">
                Start Over
              </Button>
            </div>
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl mx-auto my-8 overflow-hidden">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center font-serif">
        Personalized Grow Planner
      </h1>
      {displayedStep < TOTAL_PLANNER_STEPS && (
        <ProgressBar currentStep={displayedStep} totalSteps={TOTAL_PLANNER_STEPS} />
      )}
      <div className={`min-h-[420px] ${animationClass}`}>
        {renderStep()}
      </div>
    </div>
  );
};

export default PersonalizedGrowPlanner;
