import React from 'react';
import { Slider } from '@/components/ui/slider'; // Assuming ShadCN UI structure

interface Step5TimeCommitmentProps {
  formData: {
    timeCommitment?: number; // Storing as a number (hours)
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step5TimeCommitment: React.FC<Step5TimeCommitmentProps> = ({ formData, setFormData }) => {
  const timeValue = formData.timeCommitment !== undefined ? [formData.timeCommitment] : [3]; // Default to 3 hours if undefined

  const handleSliderChange = (value: number[]) => {
    setFormData((prevData: any) => ({
      ...prevData,
      timeCommitment: value[0],
    }));
  };

  const getCommitmentLabel = (value: number | undefined): string => {
    if (value === undefined) return "Medium: ~3 hours/week";
    if (value <= 2) return `Low: ~${value} hour${value === 1 ? '' : 's'}/week`;
    if (value <= 6) return `Medium: ~${value} hours/week`;
    return `High: ~${value} hours/week`;
  };

  const commitmentDescription = (value: number | undefined): string => {
    if (value === undefined) return "About 3 hours per week, good for many common plants.";
    if (value <=2) return "Suitable for very low-maintenance plants or small setups.";
    if (value <=6) return "Allows for a wider variety of plants and regular care.";
    return "You're ready for a significant garden or demanding plants!";
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Step 5: How much time can you commit per week?
      </h2>
      <div className="my-8 px-2">
        <Slider
          defaultValue={timeValue}
          value={timeValue}
          onValueChange={handleSliderChange}
          min={1}
          max={10}
          step={1}
          className="w-3/4 mx-auto"
        />
      </div>
      <div className="text-center mt-4">
        <p className="text-lg font-medium text-blue-600">
          {getCommitmentLabel(formData.timeCommitment)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {commitmentDescription(formData.timeCommitment)}
        </p>
      </div>
    </div>
  );
};

export default Step5TimeCommitment;
