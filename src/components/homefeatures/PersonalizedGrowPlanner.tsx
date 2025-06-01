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
      default: // Summary screen
        let summaryContent = "Loading summary...";
        try {
          if (typeof formData !== 'object' || formData === null) {
            throw new Error("Form data is not a valid object.");
          }
          if (Object.keys(formData).length === 0 && displayedStep === TOTAL_PLANNER_STEPS) {
            summaryContent = "No preferences were recorded. Feel free to start over and select some options!";
          } else {
            // ** SIMPLIFICATION FOR DEBUGGING **
            // Comment out the original stringify:
            // summaryContent = JSON.stringify(formData, null, 2);

            // Replace with a simple message:
            summaryContent = "Summary display is simplified for debugging. All data collected.";

            // Or, try displaying only one simple, known field if confident:
            // if (formData.experienceLevel) {
            //   summaryContent = `Experience Level Selected: ${formData.experienceLevel}`;
            // } else if (Object.keys(formData).length > 0) {
            //   summaryContent = "Some data collected, but experience level not found.";
            // } else {
            //   summaryContent = "Experience Level not found, and no other data present.";
            // }
          }
        } catch (error: any) {
          console.error("Error preparing summary content:", error);
          summaryContent = `Error displaying summary: ${error.message}. Raw data might be incomplete or corrupted.`;
        }

        return (
          <ErrorBoundary fallbackMessage="There was an issue displaying the summary. Please try starting over.">
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Planner Complete!</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-2">Here&apos;s a summary of your preferences:</p>
              <pre className="text-left text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto min-h-[100px]">
                {summaryContent}
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
