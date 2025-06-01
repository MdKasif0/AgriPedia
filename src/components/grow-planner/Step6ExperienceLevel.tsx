import React from 'react';
import { Baby, Sprout, Award } from 'lucide-react'; // Example icons

interface Step6ExperienceLevelProps {
  formData: {
    experienceLevel?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const experienceOptions = [
  { name: 'Beginner', icon: <Baby size={32} />, value: 'beginner', description: "Just starting out, need lots of guidance." },
  { name: 'Intermediate', icon: <Sprout size={32} />, value: 'intermediate', description: "Some experience, comfortable with basics." },
  { name: 'Advanced', icon: <Award size={32} />, value: 'advanced', description: "Very experienced, can handle complex plants." },
];

const Step6ExperienceLevel: React.FC<Step6ExperienceLevelProps> = ({ formData, setFormData }) => {
  const handleSelectExperience = (experienceValue: string) => {
    setFormData((prevData: any) => ({
      ...prevData,
      experienceLevel: experienceValue,
    }));
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
        Step 6: What's your gardening experience level?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {experienceOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectExperience(option.value)}
            className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out h-full
                        ${formData.experienceLevel === option.value
                          ? 'border-teal-500 bg-teal-50 shadow-lg scale-105'
                          : 'border-gray-300 hover:border-teal-400 hover:shadow-md'}`}
          >
            <div className={`mb-3 ${formData.experienceLevel === option.value ? 'text-teal-600' : 'text-gray-600'}`}>
              {option.icon}
            </div>
            <span className={`text-base font-medium mb-1 ${formData.experienceLevel === option.value ? 'text-teal-700' : 'text-gray-700'}`}>
              {option.name}
            </span>
            <p className="text-xs text-center text-gray-500 px-1">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step6ExperienceLevel;
