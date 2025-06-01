import React, { useState } from 'react';
import LocationStep from '../planner/LocationStep';
import GrowingSpaceStep from '../planner/GrowingSpaceStep';
import SunlightExposureStep from '../planner/SunlightExposureStep';
import PurposeStep from '../planner/PurposeStep';
import TimeCommitmentStep from '../planner/TimeCommitmentStep';
import ExperienceLevelStep from '../planner/ExperienceLevelStep';

const PersonalizedGrowPlanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleNext = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
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
      default:
        return <div>Thank you! Planner Complete.</div>; // Or a summary step
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Personalized Grow Planner</h1>
      {/* Add progress bar here later */}
      <div className="transition-all duration-500 ease-in-out">
        {renderStep()}
      </div>
    </div>
  );
};

export default PersonalizedGrowPlanner;
