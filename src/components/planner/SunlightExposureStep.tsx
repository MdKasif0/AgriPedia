import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sun, SunMedium, CloudSun } from 'lucide-react';
import type { PlannerData } from '@/types/planner';

const sunlightOptions = [
  { id: 'shade', label: 'Shade', description: 'Minimal direct sun (less than 4 hours)', icon: CloudSun, detailedGuide: 'Ideal for shade-tolerant plants like leafy greens (e.g., lettuce, spinach) or many indoor houseplants.' }, // Changed 'low' to 'shade'
  { id: 'partial', label: 'Partial Sun', description: 'Some direct sun (4-6 hours)', icon: SunMedium, detailedGuide: 'Suitable for root vegetables (e.g., carrots, beets) and brassicas (e.g., broccoli, kale) that benefit from some afternoon shade in hot climates.' },
  { id: 'full', label: 'Full Sun', description: 'Plenty of direct sun (6+ hours)', icon: Sun, detailedGuide: 'Perfect for sun-loving, fruit-bearing plants like tomatoes, peppers, cucumbers, and squash, as well as herbs like basil and rosemary.' },
];

interface StepProps {
  plannerData: Partial<PlannerData>;
  onDataChange: (updatedData: Partial<PlannerData>) => void;
}

const SunlightExposureStep: React.FC<StepProps> = ({ plannerData, onDataChange }) => {
  const [selectedExposure, setSelectedExposure] = useState<string | undefined>(plannerData.sunlight);

  useEffect(() => {
    if (plannerData.sunlight !== undefined) {
      setSelectedExposure(plannerData.sunlight);
    }
  }, [plannerData.sunlight]);

  const handleSelectExposure = (exposureId: string) => {
    setSelectedExposure(exposureId);
    onDataChange({ sunlight: exposureId });
  };

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        How much sunlight does the area get? ☀️
      </h3>

      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sunlightOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedExposure === option.id;
            return (
              <Tooltip key={option.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSelectExposure(option.id)}
                    className={`p-4 border rounded-lg flex flex-col items-center justify-start text-center space-y-2 transition-all h-full min-h-[180px]
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-gray-800
                                ${isSelected
                                  ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-900/40 shadow-lg'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md bg-card dark:bg-card'
                                }
                                text-card-foreground`}
                  >
                    <Icon className={`h-10 w-10 mb-2 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
                    <span className="font-medium text-base">{option.label}</span>
                    <p className="text-xs text-muted-foreground flex-grow px-1">{option.description}</p>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground p-2 rounded shadow-lg max-w-xs border border-border">
                  <p>{option.detailedGuide}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      {/* Navigation buttons are handled by the parent PlannerPage */}
    </div>
  );
};

export default SunlightExposureStep;
