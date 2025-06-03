import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Building, Trees, Sprout, Warehouse } from 'lucide-react'; // Example icons

// Define outside component or import if centralized
const spaceOptions = [
  { id: 'indoor', label: 'Indoor', icon: Home, description: "Growing inside your home, perhaps on a windowsill or with grow lights." },
  { id: 'balcony', label: 'Balcony', icon: Building, description: "Utilizing a balcony space for pots and containers." },
  { id: 'small_yard', label: 'Small Yard', icon: Trees, description: "A compact outdoor area, like a small backyard or patio." },
  { id: 'large_garden', label: 'Large Garden', icon: Sprout, description: "A spacious outdoor plot with ample room for various plants." },
  { id: 'greenhouse', label: 'Greenhouse', icon: Warehouse, description: "A dedicated structure for controlled environment growing." },
];

interface GrowingSpaceStepProps {
  onNext: (data: { growingSpace: string }) => void;
  onBack: () => void;
  data: { growingSpace?: string };
}

const GrowingSpaceStep: React.FC<GrowingSpaceStepProps> = ({ onNext, onBack, data }) => {
  const [selectedSpace, setSelectedSpace] = useState<string | undefined>(data.growingSpace);

  useEffect(() => {
    if (data.growingSpace) {
      setSelectedSpace(data.growingSpace);
    }
  }, [data.growingSpace]);

  const handleSubmit = () => {
    if (selectedSpace) {
      onNext({ growingSpace: selectedSpace });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        What kind of space are you working with? 🌱
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {spaceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedSpace === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedSpace(option.id)}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center space-y-2 transition-all h-full
                          ${isSelected
                            ? 'ring-2 ring-green-500 border-green-500 bg-green-50 dark:bg-green-900/30 shadow-lg'
                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md bg-white dark:bg-gray-800'
                          }
                           text-gray-800 dark:text-gray-200`}
            >
              <Icon className={`h-10 w-10 mb-2 ${isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className="font-medium">{option.label}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 px-2">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedSpace}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default GrowingSpaceStep;
