import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Building, Trees, Sprout, Warehouse } from 'lucide-react';
import type { PlannerData } from '@/types/planner';

const spaceOptions = [
  { id: 'indoors', label: 'Indoor', icon: Home, description: "Growing inside your home, perhaps on a windowsill or with grow lights." },
  { id: 'balcony', label: 'Balcony', icon: Building, description: "Utilizing a balcony space for pots and containers." },
  { id: 'outdoors_small', label: 'Small Yard/Patio', icon: Trees, description: "A compact outdoor area, like a small backyard or patio." },
  { id: 'outdoors_large', label: 'Large Garden/Yard', icon: Sprout, description: "A spacious outdoor plot with ample room for various plants." },
  { id: 'greenhouse', label: 'Greenhouse', icon: Warehouse, description: "A dedicated structure for controlled environment growing." },
  // Consider adding "other" or more specific types if needed by customization rules
];

interface StepProps {
  plannerData: Partial<PlannerData>;
  onDataChange: (updatedData: Partial<PlannerData>) => void;
}

const GrowingSpaceStep: React.FC<StepProps> = ({ plannerData, onDataChange }) => {
  const [selectedSpace, setSelectedSpace] = useState<string | undefined>(plannerData.space);

  useEffect(() => {
    // Sync with parent data if it changes (e.g., user navigates back and data is reloaded)
    if (plannerData.space !== undefined) {
      setSelectedSpace(plannerData.space);
    }
  }, [plannerData.space]);

  const handleSelectSpace = (spaceId: string) => {
    setSelectedSpace(spaceId);
    onDataChange({ space: spaceId });
  };

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        What kind of space are you working with? 🌱
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {spaceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedSpace === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelectSpace(option.id)}
              className={`p-4 border rounded-lg flex flex-col items-center justify-start text-center space-y-2 transition-all h-full min-h-[180px]  // Added min-h for consistency
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 dark:focus-visible:ring-offset-gray-800
                          ${isSelected
                            ? 'ring-2 ring-green-500 border-green-500 bg-green-50 dark:bg-green-900/40 shadow-lg'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md bg-card dark:bg-card' // Use card bg for theme
                          }
                           text-card-foreground`} // Use card-foreground for theme
            >
              <Icon className={`h-10 w-10 mb-2 ${isSelected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} /> {/* Muted for non-selected icon */}
              <span className="font-medium text-base">{option.label}</span>
              <p className="text-xs text-muted-foreground flex-grow px-1">{option.description}</p>
            </button>
          );
        })}
      </div>
      {/* Navigation buttons are handled by the parent PlannerPage */}
    </div>
  );
};

export default GrowingSpaceStep;
