import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Button is not used in the refactored version directly for nav
import { Carrot, Leaf, Grape, Flower2, HeartPulse, ShieldCheck } from 'lucide-react';
import type { PlannerData } from '@/types/planner';

const purposeOptions = [
  { id: 'vegetables', label: 'Vegetables', icon: Carrot, description: "Grow your own food like tomatoes, cucumbers, peppers, etc." },
  { id: 'herbs', label: 'Herbs', icon: Leaf, description: "Fresh herbs like basil, mint, rosemary for culinary or aromatic uses." },
  { id: 'fruits', label: 'Fruits', icon: Grape, description: "Enjoy homegrown fruits such as berries, melons, or even dwarf fruit trees." },
  { id: 'flowers', label: 'Flowers', icon: Flower2, description: "Beautify your space with ornamental flowers." },
  { id: 'medicinal', label: 'Medicinal', icon: HeartPulse, description: "Grow plants known for their traditional medicinal properties." },
  { id: 'pet_safe', label: 'Pet-Safe Plants', icon: ShieldCheck, description: "Choose plants that are non-toxic to your beloved pets." }, // Renamed for clarity
];

interface StepProps {
  plannerData: Partial<PlannerData>;
  onDataChange: (updatedData: Partial<PlannerData>) => void;
}

const PurposeStep: React.FC<StepProps> = ({ plannerData, onDataChange }) => {
  // Initialize from plannerData.purpose or default to an empty array
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(plannerData.purpose || []);

  useEffect(() => {
    if (Array.isArray(plannerData.purpose)) {
      setSelectedPurposes(plannerData.purpose);
    } else if (plannerData.purpose === undefined) { // If parent data explicitly clears it
        setSelectedPurposes([]);
    }
  }, [plannerData.purpose]);

  const handleTogglePurpose = (purposeId: string) => {
    const newSelectedPurposes = selectedPurposes.includes(purposeId)
      ? selectedPurposes.filter(id => id !== purposeId)
      : [...selectedPurposes, purposeId];
    setSelectedPurposes(newSelectedPurposes);
    onDataChange({ purpose: newSelectedPurposes });
  };

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        What are your gardening goals? 🎯
        <span className="block text-sm font-normal text-muted-foreground mt-1">(Select all that apply)</span>
      </h3>

      <div className="flex flex-wrap gap-3">
        {purposeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPurposes.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => handleTogglePurpose(option.id)}
              title={option.description}
              className={`p-3 border rounded-lg flex items-center space-x-2.5 transition-all min-w-[140px] justify-start hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-800
                          ${isSelected
                            ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-md'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-card dark:bg-card'
                          }
                          text-card-foreground`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
              <span className="font-medium text-sm">{option.label}</span>
            </button>
          );
        })}
      </div>
      {/* Navigation buttons are handled by the parent PlannerPage */}
    </div>
  );
};

export default PurposeStep;
