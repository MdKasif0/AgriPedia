import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Baby, User, Award } from 'lucide-react';

const experienceOptions = [
  { id: 'beginner', label: 'Beginner', description: "New to gardening, looking for easy-to-grow plants and lots of guidance.", icon: Baby },
  { id: 'intermediate', label: 'Intermediate', description: "Some experience, comfortable with common gardening tasks and a wider variety of plants.", icon: User },
  { id: 'advanced', label: 'Advanced', description: "Experienced gardener, confident with complex techniques and challenging plants.", icon: Award },
];

interface ExperienceLevelStepProps {
  onNext: (data: { experienceLevel: string }) => void;
  onBack: () => void;
  data: { experienceLevel?: string };
}

const ExperienceLevelStep: React.FC<ExperienceLevelStepProps> = ({ onNext, onBack, data }) => {
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(data.experienceLevel);

  useEffect(() => {
    if (data.experienceLevel) {
      setSelectedLevel(data.experienceLevel);
    }
  }, [data.experienceLevel]);

  const handleSubmit = () => {
    if (selectedLevel) {
      onNext({ experienceLevel: selectedLevel });
    }
  };

  return (
    <div className="space-y-6 py-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white px-1">
        What's your gardening experience level? 🧑‍🌾
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
        {experienceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedLevel === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedLevel(option.id)}
              className={`p-6 border rounded-lg flex flex-col items-center justify-start text-center space-y-3 transition-all h-full hover:shadow-lg
                          ${isSelected
                            ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50 dark:bg-purple-900/40 shadow-xl'
                            : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 bg-white dark:bg-gray-800'
                          }
                           text-gray-800 dark:text-gray-200`}
            >
              <Icon className={`h-10 w-10 mb-2 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className="font-medium text-lg">{option.label}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow px-2">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4 px-1">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedLevel}>
          Finish
        </Button>
      </div>
    </div>
  );
};

export default ExperienceLevelStep;
