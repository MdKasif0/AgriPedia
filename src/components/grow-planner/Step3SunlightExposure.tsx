import React from 'react';
import { Sun, CloudSun, Cloud, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Assuming ShadCN UI structure

interface Step3SunlightExposureProps {
  formData: {
    sunlightExposure?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const sunlightOptions = [
  { name: 'Low', icon: <Cloud size={32} />, value: 'low', description: 'Less than 4 hours of direct sun.' },
  { name: 'Partial', icon: <CloudSun size={32} />, value: 'partial', description: '4-6 hours of direct sun.' },
  { name: 'Full', icon: <Sun size={32} />, value: 'full', description: 'More than 6 hours of direct sun.' },
];

const Step3SunlightExposure: React.FC<Step3SunlightExposureProps> = ({ formData, setFormData }) => {
  const handleSelectExposure = (exposureValue: string) => {
    setFormData((prevData: any) => ({
      ...prevData,
      sunlightExposure: exposureValue,
    }));
  };

  return (
    <TooltipProvider>
      <div className="p-4 border rounded-lg bg-white shadow-md">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700 text-center">
            Step 3: How much sunlight does your space get?
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                <HelpCircle size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="w-64 p-2 bg-gray-800 text-white rounded-md shadow-lg text-sm">
              <ul className="list-disc list-inside space-y-1">
                {sunlightOptions.map(opt => <li key={opt.value}><strong>{opt.name}:</strong> {opt.description}</li>)}
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sunlightOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectExposure(option.value)}
              className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                          ${formData.sunlightExposure === option.value
                            ? 'border-yellow-500 bg-yellow-50 shadow-lg scale-105'
                            : 'border-gray-300 hover:border-yellow-400 hover:shadow-md'}`}
            >
              <div className={`mb-2 ${formData.sunlightExposure === option.value ? 'text-yellow-600' : 'text-gray-600'}`}>
                {option.icon}
              </div>
              <span className={`text-base font-medium ${formData.sunlightExposure === option.value ? 'text-yellow-700' : 'text-gray-700'}`}>
                {option.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Step3SunlightExposure;
