import React from 'react';

interface ProgressBarProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  // currentStep is 0-indexed, so add 1 for calculation if steps are 1-indexed for display
  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
