import React, { useState, useEffect, useRef } from 'react';
import LocationStep from '../planner/LocationStep';
import GrowingSpaceStep from '../planner/GrowingSpaceStep';
import SunlightExposureStep from '../planner/SunlightExposureStep';
import PurposeStep from '../planner/PurposeStep';
import TimeCommitmentStep from '../planner/TimeCommitmentStep';
import ExperienceLevelStep from '../planner/ExperienceLevelStep';
import PlantRecommendationResults from '../planner/PlantRecommendationResults';
import ProgressBar from '../planner/ProgressBar';
import ErrorBoundary from '../ErrorBoundary';
import { Button } from '@/components/ui/button';
import { savePlannerData, getPlannerData, clearPlannerData } from '@/lib/userDataStore';
import { getPlantRecommendations, getCurrentGrowingContext } from '@/lib/plantRecommendationService';
import type { PlannerData } from '@/types/planner';
import type { PlantRecommendation } from '@/types/plant';

const TOTAL_PLANNER_STEPS = 6; // Location to Experience Level

// Simple validation function
const isValidStepData = (data: any): boolean => {
  if (typeof data !== 'object' || data === null) {
    console.error("Validation Error: Step data is not an object.", data);
    return false;
  }
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) { // Check if key is own property
      if (typeof data[key] === 'function') {
        console.error(`Validation Error: Step data for key '${key}' is a function.`, data);
        return false;
      }
      // Example: Check for excessively deep objects (potential performance issue or circular ref)
      if (typeof data[key] === 'object' && data[key] !== null) {
        try {
          // A simple way to check for circular references or too complex objects for JSON
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
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const [formData, setFormData] = useState({});
  const [animationClass, setAnimationClass] = useState('animate-fadeIn'); // Initial animation
  const [displayedStep, setDisplayedStep] = useState(currentStep);
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const previousStepRef = useRef<number>(currentStep);

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

  // Load existing planner data from local storage on component mount
  useEffect(() => {
    const loadedData = getPlannerData();
    if (loadedData) {
      console.log("Loaded planner data from local storage:", loadedData);
      // The loadedData includes userId and createdAt, which are not typically part of the
      // step-by-step formData accumulation but are fine to include when setting the initial state.
      // The step components will pick the fields they are responsible for (e.g., data.location, data.space).
      setFormData(loadedData);
    }
  }, []); // Empty dependency array ensures this runs only on mount

  useEffect(() => {
    if (currentStep === TOTAL_PLANNER_STEPS && Object.keys(formData).length > 0) {
      // Ensure all expected fields are present before trying to save.
      // This is a basic check; individual step data should already be structured correctly.
      const plannerToSave: Partial<PlannerData> = {
        ...formData, // Spread the collected form data
        userId: "defaultUser123", // Placeholder userId
        createdAt: new Date().toISOString(),
      };

      // Log the data being saved for debugging
      console.log("Attempting to save planner data:", plannerToSave);

      // Type assertion is used here assuming formData has been correctly populated by the steps
      // and matches the structure of PlannerData fields.
      // The isValidPlannerData function within savePlannerData will perform the final validation.
      savePlannerData(plannerToSave as PlannerData);
    }
  }, [currentStep, formData]); // Trigger when currentStep or formData changes

  // Generate recommendations when planner is complete
  useEffect(() => {
    if (currentStep === TOTAL_PLANNER_STEPS && Object.keys(formData).length > 0) {
      const generateRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
          const { month, hemisphere } = getCurrentGrowingContext();
          const recommendations = await getPlantRecommendations({
            climateZone: formData.location?.climateZone || '',
            lightRequirements: formData.sunlight || '',
            experienceLevel: formData.experience || '',
            currentMonth: month,
            hemisphere,
            spaceConstraints: {
              containerOnly: formData.space === 'container',
              maxHeight: formData.space === 'balcony' ? 100 : undefined,
              maxWidth: formData.space === 'balcony' ? 50 : undefined,
            },
          });
          setRecommendations(recommendations);
        } catch (error) {
          console.error('Error generating recommendations:', error);
        } finally {
          setIsLoadingRecommendations(false);
        }
      };

      generateRecommendations();
    }
  }, [currentStep, formData]);

  const handleNext = (stepData: any) => {
    if (!isValidStepData(stepData)) {
      console.error("Problematic step data received. Not merging:", stepData);
      // Still advance the step, but without merging the problematic data.
      // This prevents the user from getting stuck but flags the issue.
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
    clearPlannerData(); // Clear data from local storage
    setCurrentStep(0);
    setFormData({});
    // Set displayedStep to 0 to ensure UI updates immediately before animation kicks in.
    // Set previousStepRef to -1 (or any value != 0) to ensure animation effect condition is met.
    setDisplayedStep(0);
    previousStepRef.current = -1;
    // Animation class for reset can be set here or handled by useEffect.
    // If useEffect handles it based on displayedStep !== currentStep initially,
    // then just setting currentStep & displayedStep to 0 and previousStepRef to -1 should work.
    setAnimationClass('animate-fadeIn'); // Explicitly set fade-in for reset
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
      default: // Summary screen with recommendations
        return (
          <ErrorBoundary fallbackMessage="There was an issue displaying the recommendations. Please try starting over.">
            <div className="space-y-6">
              <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Planner Complete!</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Based on your preferences, here are some plants that would be perfect for your garden:
                </p>
              </div>
              
              <PlantRecommendationResults
                recommendations={recommendations}
                isLoading={isLoadingRecommendations}
              />

              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={handleStartOver} variant="outline">
                Start Over
              </Button>
                <Button onClick={() => window.print()}>
                  Save Recommendations
                </Button>
              </div>
            </div>
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-2xl max-w-2xl mx-auto my-8 overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-transparent">
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
