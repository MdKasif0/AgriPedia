import React, { useState, useEffect, useRef } from 'react';
import LocationStep from '../planner/LocationStep';
import GrowingSpaceStep from '../planner/GrowingSpaceStep';
import SunlightExposureStep from '../planner/SunlightExposureStep';
import PurposeStep from '../planner/PurposeStep';
import TimeCommitmentStep from '../planner/TimeCommitmentStep';
import ExperienceLevelStep from '../planner/ExperienceLevelStep';
import ProgressBar from '../planner/ProgressBar'; // Import ProgressBar

const TOTAL_PLANNER_STEPS = 6; // Location to Experience Level

const PersonalizedGrowPlanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const [formData, setFormData] = useState({});
  const [animationClass, setAnimationClass] = useState('animate-fadeIn'); // Initial animation
  const [displayedStep, setDisplayedStep] = useState(currentStep);
  const previousStepRef = useRef<number>(currentStep);

  useEffect(() => {
    // This effect handles the animation logic when currentStep changes
    if (previousStepRef.current < currentStep) { // Going forward
      setAnimationClass('animate-slideOutToLeft');
      setTimeout(() => {
        setDisplayedStep(currentStep);
        setAnimationClass('animate-slideInFromRight');
        previousStepRef.current = currentStep;
      }, 300); // Duration of slide-out animation (must match CSS)
    } else if (previousStepRef.current > currentStep) { // Going backward
      setAnimationClass('animate-slideOutToRight');
      setTimeout(() => {
        setDisplayedStep(currentStep);
        setAnimationClass('animate-slideInFromLeft');
        previousStepRef.current = currentStep;
      }, 300); // Duration of slide-out animation
    } else if (previousStepRef.current === currentStep && displayedStep !== currentStep) {
      // This case can happen if currentStep is set back to the same value displayedStep is already on
      // or during initial load if displayedStep isn't currentStep yet.
      // For initial load, we want a specific animation.
      setDisplayedStep(currentStep);
      setAnimationClass('animate-fadeIn'); // Default initial animation
    }
    // No change if previousStepRef.current === currentStep and displayedStep === currentStep
  }, [currentStep, displayedStep]);


  const handleNext = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (currentStep < TOTAL_PLANNER_STEPS) { // Only advance if not past the last data entry step
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    // Render based on displayedStep for smoother animation
    switch (displayedStep) {
      case 0:
        return <LocationStep onNext={handleNext} data={formData} onBack={() => {}} />; // No back on first step
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
      default: // Summary screen (currentStep would be TOTAL_PLANNER_STEPS)
        return (
          <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Planner Complete!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Here's a summary of your preferences:</p>
            <pre className="text-left text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
            <Button onClick={() => { setCurrentStep(0); setFormData({}); /* Reset */ }} className="mt-6">
              Start Over
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl mx-auto my-8 overflow-hidden">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center font-serif">
        Personalized Grow Planner
      </h1>
      {/* Render ProgressBar only for actual steps, not for summary screen */}
      {displayedStep < TOTAL_PLANNER_STEPS && (
        <ProgressBar currentStep={displayedStep} totalSteps={TOTAL_PLANNER_STEPS} />
      )}
      {/* Ensure container has a defined height or step contents are similar height for best effect, or use a min-height */}
      <div className={`min-h-[420px] ${animationClass}`}> {/* Apply animation class, ensure min-height */}
        {renderStep()}
      </div>
    </div>
  );
};

export default PersonalizedGrowPlanner;
