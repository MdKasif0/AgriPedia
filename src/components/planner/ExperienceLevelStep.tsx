import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Button is not used in the refactored version directly for nav
import { Baby, User, Award } from 'lucide-react';
import type { PlannerData } from '@/types/planner';

const experienceOptions = [
  { id: 'beginner', label: 'Beginner', icon: Baby, description: "New to gardening, looking for easy-to-grow plants and lots of guidance." },
  { id: 'intermediate', label: 'Intermediate', icon: User, description: "Some experience, comfortable with common gardening tasks and a wider variety of plants." },
  { id: 'advanced', label: 'Advanced', icon: Award, description: "Experienced gardener, confident with complex techniques and challenging plants." },
];

interface StepProps {
  plannerData: Partial<PlannerData>;
  onDataChange: (updatedData: Partial<PlannerData>) => void;
}

const ExperienceLevelStep: React.FC<StepProps> = ({ plannerData, onDataChange }) => {
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(plannerData.experience);

  useEffect(() => {
    if (plannerData.experience !== undefined) {
      setSelectedLevel(plannerData.experience);
    }
  }, [plannerData.experience]);

  const handleSelectLevel = (levelId: string) => {
    setSelectedLevel(levelId);
    onDataChange({ experience: levelId });
  };

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        What&apos;s your gardening experience level? 🧑‍🌾
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {experienceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedLevel === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelectLevel(option.id)}
              className={`p-4 border rounded-lg flex flex-col items-center justify-start text-center space-y-2 transition-all h-full min-h-[180px]
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 dark:focus-visible:ring-offset-gray-800
                          ${isSelected
                            ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50 dark:bg-purple-900/40 shadow-lg'
                            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md bg-card dark:bg-card'
                          }
                           text-card-foreground`}
            >
              <Icon className={`h-10 w-10 mb-2 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`} />
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

export default ExperienceLevelStep;
