import React, { useState, useEffect, useRef } from 'react';
import LocationStep from '../planner/LocationStep';
import GrowingSpaceStep from '../planner/GrowingSpaceStep';
import SunlightExposureStep from '../planner/SunlightExposureStep';
import PurposeStep from '../planner/PurposeStep';
import TimeCommitmentStep from '../planner/TimeCommitmentStep';
import ExperienceLevelStep from '../planner/ExperienceLevelStep';
import PlantRecommendations from '../planner/PlantRecommendations';
import ProgressBar from '../planner/ProgressBar';
import ErrorBoundary from '../ErrorBoundary';
import { Button } from '@/components/ui/button';
import { savePlannerData, getPlannerData, clearPlannerData } from '@/lib/userDataStore';
import type { PlannerData } from '@/types/planner';

const PersonalizedGrowPlanner: React.FC = () => {
  // ... existing state and refs ...

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
          <ErrorBoundary fallbackMessage="There was an issue displaying the summary. Please try starting over.">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Planner Complete!</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-2">Here's a summary of your preferences:</p>
                <pre className="text-left text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto min-h-[100px]">
                  {JSON.stringify(formData, null, 2)}
                </pre>
                <Button onClick={handleStartOver} className="mt-6">
                  Start Over
                </Button>
              </div>
              
              <div className="mt-8">
                <PlantRecommendations plannerData={formData} />
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