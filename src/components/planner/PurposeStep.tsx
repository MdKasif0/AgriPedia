import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Carrot, Leaf, Grape, Flower2, HeartPulse, ShieldCheck } from 'lucide-react';

const purposeOptions = [
  { id: 'vegetables', label: 'Vegetables', icon: Carrot, description: "Grow your own food like tomatoes, cucumbers, peppers, etc." },
  { id: 'herbs', label: 'Herbs', icon: Leaf, description: "Fresh herbs like basil, mint, rosemary for culinary or aromatic uses." },
  { id: 'fruits', label: 'Fruits', icon: Grape, description: "Enjoy homegrown fruits such as berries, melons, or even dwarf fruit trees." },
  { id: 'flowers', label: 'Flowers', icon: Flower2, description: "Beautify your space with ornamental flowers." },
  { id: 'medicinal', label: 'Medicinal', icon: HeartPulse, description: "Grow plants known for their traditional medicinal properties." },
  { id: 'pet_safe', label: 'Pet-Safe', icon: ShieldCheck, description: "Choose plants that are non-toxic to your beloved pets." },
];

interface PurposeStepProps {
  onNext: (data: { purposes: string[] }) => void;
  onBack: () => void;
  data: { purposes?: string[] };
}

const PurposeStep: React.FC<PurposeStepProps> = ({ onNext, onBack, data }) => {
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);

  useEffect(() => {
    // Ensure data.purposes is an array before setting state
    if (Array.isArray(data.purposes)) {
      setSelectedPurposes(data.purposes);
    }
  }, [data.purposes]);

  const handleTogglePurpose = (purposeId: string) => {
    setSelectedPurposes(prev =>
      prev.includes(purposeId)
        ? prev.filter(id => id !== purposeId)
        : [...prev, purposeId]
    );
  };

  const handleSubmit = () => {
    if (selectedPurposes.length > 0) {
      onNext({ purposes: selectedPurposes });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        What are your gardening goals? 🎯 <span className="text-sm font-normal text-gray-600 dark:text-gray-400">(Select all that apply)</span>
      </h2>

      <div className="flex flex-wrap gap-3">
        {purposeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPurposes.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => handleTogglePurpose(option.id)}
              title={option.description} // Simple tooltip using title attribute
              className={`p-3 border rounded-lg flex items-center space-x-2.5 transition-all min-w-[130px] justify-start hover:shadow-md
                          ${isSelected
                            ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-100 dark:bg-blue-900/40 shadow-md'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800'
                          }
                          text-gray-800 dark:text-gray-200`}
            >
              <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={selectedPurposes.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default PurposeStep;
