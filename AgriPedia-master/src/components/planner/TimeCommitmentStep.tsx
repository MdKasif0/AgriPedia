import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Clock3, Zap } from 'lucide-react';

const commitmentLevels = [
  { value: 1, label: 'Minimal', description: '~1-2 hours/week (e.g., very low maintenance herbs)' },
  { value: 2, label: 'Low', description: '~2-4 hours/week (e.g., some hardy vegetables)' },
  { value: 3, label: 'Moderate', description: '~4-6 hours/week (e.g., a small mixed garden)' },
  { value: 4, label: 'High', description: '~6-8 hours/week (e.g., a larger, more diverse garden)' },
  { value: 5, label: 'Very High', description: '8+ hours/week (e.g., intensive gardening, greenhouse)' },
];

interface TimeCommitmentStepProps {
  onNext: (data: { timeCommitment: number }) => void;
  onBack: () => void;
  data: { timeCommitment?: number };
}

const TimeCommitmentStep: React.FC<TimeCommitmentStepProps> = ({ onNext, onBack, data }) => {
  const initialCommitment = data.timeCommitment !== undefined
    ? data.timeCommitment
    : commitmentLevels[2].value; // Default to Moderate
  const [commitment, setCommitment] = useState<number>(initialCommitment);

  useEffect(() => {
    if (data.timeCommitment !== undefined) {
      setCommitment(data.timeCommitment);
    }
  }, [data.timeCommitment]);

  const handleSubmit = () => {
    onNext({ timeCommitment: commitment });
  };

  const handleSliderChange = (value: number[]) => {
    if (value.length > 0) {
      setCommitment(value[0]);
    }
  };

  const currentLevel = commitmentLevels.find(level => level.value === commitment);

  return (
    <div className="space-y-8 py-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white px-1">
        How much time can you dedicate per week? 🕰️
      </h2>

      <div className="w-full px-1">
        <Slider
          value={[commitment]} // Slider component expects an array
          onValueChange={handleSliderChange}
          min={commitmentLevels[0].value}
          max={commitmentLevels[commitmentLevels.length - 1].value}
          step={1}
          className="w-full py-2"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
          <span className="flex items-center"><Clock3 className="inline h-4 w-4 mr-1"/>{commitmentLevels[0].label}</span>
          <span className="flex items-center">{commitmentLevels[commitmentLevels.length - 1].label}<Zap className="inline h-4 w-4 ml-1"/></span>
        </div>
      </div>

      {currentLevel && (
        <div className="text-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg mx-1">
          <p className="font-medium text-lg text-gray-800 dark:text-gray-100">{currentLevel.label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{currentLevel.description}</p>
        </div>
      )}

      <div className="flex justify-between pt-4 px-1">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default TimeCommitmentStep;
