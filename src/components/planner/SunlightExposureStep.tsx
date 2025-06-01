import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sun, SunMedium, CloudSun } from 'lucide-react';

const sunlightOptions = [
  { id: 'low', label: 'Low Light', description: 'Minimal direct sun (2-4 hours)', icon: CloudSun, detailedGuide: 'Ideal for shade-tolerant plants like leafy greens (e.g., lettuce, spinach) or many indoor houseplants.' },
  { id: 'partial', label: 'Partial Sun', description: 'Some direct sun (4-6 hours)', icon: SunMedium, detailedGuide: 'Suitable for root vegetables (e.g., carrots, beets) and brassicas (e.g., broccoli, kale) that benefit from some afternoon shade in hot climates.' },
  { id: 'full', label: 'Full Sun', description: 'Plenty of direct sun (6+ hours)', icon: Sun, detailedGuide: 'Perfect for sun-loving, fruit-bearing plants like tomatoes, peppers, cucumbers, and squash, as well as herbs like basil and rosemary.' },
];

interface SunlightExposureStepProps {
  onNext: (data: { sunlightExposure: string }) => void;
  onBack: () => void;
  data: { sunlightExposure?: string };
}

const SunlightExposureStep: React.FC<SunlightExposureStepProps> = ({ onNext, onBack, data }) => {
  const [selectedExposure, setSelectedExposure] = useState<string | undefined>(data.sunlightExposure);

  useEffect(() => {
    if (data.sunlightExposure) {
      setSelectedExposure(data.sunlightExposure);
    }
  }, [data.sunlightExposure]);

  const handleSubmit = () => {
    if (selectedExposure) {
      onNext({ sunlightExposure: selectedExposure });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        How much sunlight does the area get? ☀️
      </h2>

      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sunlightOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedExposure === option.id;
            return (
              <Tooltip key={option.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedExposure(option.id)}
                    className={`p-6 border rounded-lg flex flex-col items-center justify-start text-center space-y-3 transition-all h-full
                                ${isSelected
                                  ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-900/30 shadow-lg'
                                  : 'border-gray-300 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md bg-white dark:bg-gray-800'
                                }
                                text-gray-800 dark:text-gray-200`}
                  >
                    <Icon className={`h-10 w-10 mb-2 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="font-medium text-lg">{option.label}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{option.description}</p>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg max-w-xs">
                  <p>{option.detailedGuide}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedExposure}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default SunlightExposureStep;
