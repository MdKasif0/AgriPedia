import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Clock3, Zap } from 'lucide-react';
import type { PlannerData } from '@/types/planner';

// Note: PlannerData.timeCommitment is string. These values might need to map to string IDs.
// For now, assuming the component will store a number internally and convert if needed via onDataChange.
// Or, change PlannerData.timeCommitment to number if that's more appropriate system-wide.
// Let's assume for now that we'll pass the string label or a stringified number via onDataChange.
// The original component passed a number. The PlannerData type expects a string.
// I will make the internal state a number for the slider, but onDataChange will send a string.
const commitmentLevels = [
  { value: 1, id: 'minimal', label: 'Minimal', description: '~1-2 hours/week (e.g., very low maintenance herbs)' },
  { value: 2, id: 'low', label: 'Low', description: '~2-4 hours/week (e.g., some hardy vegetables)' },
  { value: 3, id: 'moderate', label: 'Moderate', description: '~4-6 hours/week (e.g., a small mixed garden)' },
  { value: 4, id: 'high', label: 'High', description: '~6-8 hours/week (e.g., a larger, more diverse garden)' },
  { value: 5, id: 'very_high', label: 'Very High', description: '8+ hours/week (e.g., intensive gardening, greenhouse)' },
];

// Helper to find level by string ID or default
const findLevelByStringId = (id?: string) => {
    return commitmentLevels.find(level => level.id === id) || commitmentLevels[2]; // Default to Moderate
}

interface StepProps {
  plannerData: Partial<PlannerData>;
  onDataChange: (updatedData: Partial<PlannerData>) => void;
}

const TimeCommitmentStep: React.FC<StepProps> = ({ plannerData, onDataChange }) => {
  const initialLevel = findLevelByStringId(plannerData.timeCommitment);
  const [commitmentValue, setCommitmentValue] = useState<number>(initialLevel.value);

  useEffect(() => {
    if (plannerData.timeCommitment !== undefined) {
      const currentSelectedLevel = findLevelByStringId(plannerData.timeCommitment);
      setCommitmentValue(currentSelectedLevel.value);
    }
  }, [plannerData.timeCommitment]);

  const handleSliderChange = (value: number[]) => {
    if (value.length > 0) {
      const newCommitmentValue = value[0];
      setCommitmentValue(newCommitmentValue);
      const selectedLevelObject = commitmentLevels.find(level => level.value === newCommitmentValue);
      if (selectedLevelObject) {
        onDataChange({ timeCommitment: selectedLevelObject.id }); // Pass the string ID
      }
    }
  };

  const currentLevelDetails = commitmentLevels.find(level => level.value === commitmentValue);

  return (
    <div className="space-y-8 py-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        How much time can you dedicate per week? 🕰️
      </h3>

      <div className="w-full px-1">
        <Slider
          value={[commitmentValue]}
          onValueChange={handleSliderChange}
          min={commitmentLevels[0].value}
          max={commitmentLevels[commitmentLevels.length - 1].value}
          step={1}
          className="w-full py-2 [&>span:first-child]:h-2 [&>span:first-child>span]:h-2 [&>span:first-child_button]:h-5 [&>span:first-child_button]:w-5 [&>span:first-child_button]:border-2" // More specific styling for slider parts
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
          <span className="flex items-center"><Clock3 className="inline h-3 w-3 mr-1"/>{commitmentLevels[0].label}</span>
          <span className="flex items-center">{commitmentLevels[commitmentLevels.length - 1].label}<Zap className="inline h-3 w-3 ml-1"/></span>
        </div>
      </div>

      {currentLevelDetails && (
        <div className="text-center p-4 bg-muted/50 dark:bg-muted/20 rounded-lg mx-1 border border-border">
          <p className="font-medium text-base text-foreground">{currentLevelDetails.label}</p>
          <p className="text-sm text-muted-foreground">{currentLevelDetails.description}</p>
        </div>
      )}
      {/* Navigation buttons are handled by the parent PlannerPage */}
    </div>
  );
};

export default TimeCommitmentStep;
