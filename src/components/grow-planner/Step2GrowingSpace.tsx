import React from 'react';
import { Home, Sun, TreePine, Fence, Building } from 'lucide-react'; // Example icons

interface Step2GrowingSpaceProps {
  formData: {
    growingSpace?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const spaceOptions = [
  { name: 'Indoor', icon: <Home size={32} />, value: 'indoor' },
  { name: 'Balcony', icon: <Sun size={32} />, value: 'balcony' }, // Using Sun as a placeholder for balcony
  { name: 'Small Yard', icon: <TreePine size={32} />, value: 'small_yard' },
  { name: 'Large Garden', icon: <Fence size={32} />, value: 'large_garden' }, // Using Fence as a placeholder
  { name: 'Greenhouse', icon: <Building size={32} />, value: 'greenhouse' }, // Using Building as a placeholder
];

const Step2GrowingSpace: React.FC<Step2GrowingSpaceProps> = ({ formData, setFormData }) => {
  const handleSelectSpace = (spaceValue: string) => {
    setFormData((prevData: any) => ({
      ...prevData,
      growingSpace: spaceValue,
    }));
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
        Step 2: What type of growing space do you have?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {spaceOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectSpace(option.value)}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                        ${formData.growingSpace === option.value
                          ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                          : 'border-gray-300 hover:border-green-400 hover:shadow-md'}`}
          >
            <div className={`mb-2 ${formData.growingSpace === option.value ? 'text-green-600' : 'text-gray-600'}`}>
              {option.icon}
            </div>
            <span className={`text-sm font-medium ${formData.growingSpace === option.value ? 'text-green-700' : 'text-gray-700'}`}>
              {option.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step2GrowingSpace;
