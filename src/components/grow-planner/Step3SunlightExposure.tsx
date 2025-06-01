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
      <div className="p-4 border border-border rounded-lg bg-card shadow-md">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-xl font-semibold text-foreground text-center">
            Step 3: How much sunlight does your space get?
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-2 text-muted-foreground hover:text-foreground/80">
                <HelpCircle size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="w-64 p-3 bg-popover text-popover-foreground rounded-md shadow-lg text-sm border border-border">
              {/* Assuming TooltipContent is styled by the ui component, but adding some structure if not */}
              <ul className="space-y-1">
                {sunlightOptions.map(opt => (
                  <li key={opt.value}>
                    <strong className="font-medium">{opt.name}:</strong> {opt.description}
                  </li>
                ))}
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
                            ? 'border-accent-amber bg-accent-amber/10 dark:bg-accent-amber/20 shadow-lg scale-105'
                            : 'border-border bg-background dark:bg-card hover:border-accent-amber/70 hover:shadow-md'}`}
            >
              <div className={`mb-2 ${formData.sunlightExposure === option.value ? 'text-accent-amber' : 'text-muted-foreground'}`}>
                {option.icon}
              </div>
              <span className={`text-base font-medium ${formData.sunlightExposure === option.value ? 'text-accent-amber' : 'text-foreground'}`}>
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
