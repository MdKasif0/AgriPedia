import React from 'react';
import { Carrot, Leaf, Apple, Cherry, Sparkles, ShieldCheck, PawPrint } from 'lucide-react'; // Example icons

interface Step4PurposeProps {
  formData: {
    purpose?: string[]; // Array to store multiple selections
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const purposeOptions = [
  { name: 'Vegetables', icon: <Carrot size={32} />, value: 'vegetables' },
  { name: 'Herbs', icon: <Leaf size={32} />, value: 'herbs' },
  { name: 'Fruits', icon: <Apple size={32} />, value: 'fruits' },
  { name: 'Flowers', icon: <Sparkles size={32} />, value: 'flowers' }, // Using Sparkles for Flowers
  { name: 'Medicinal', icon: <ShieldCheck size={32} />, value: 'medicinal' },
  { name: 'Pet-Safe', icon: <PawPrint size={32} />, value: 'pet_safe' },
];

const Step4Purpose: React.FC<Step4PurposeProps> = ({ formData, setFormData }) => {
  const handleSelectPurpose = (purposeValue: string) => {
    setFormData((prevData: any) => {
      const currentPurposes = prevData.purpose || [];
      const newPurposes = currentPurposes.includes(purposeValue)
        ? currentPurposes.filter((p: string) => p !== purposeValue) // Deselect if already selected
        : [...currentPurposes, purposeValue]; // Select if not selected
      return {
        ...prevData,
        purpose: newPurposes,
      };
    });
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card shadow-md">
      <h2 className="text-xl font-semibold mb-2 text-center text-foreground">
        Step 4: What do you want to grow?
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">(Select all that apply)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {purposeOptions.map((option) => {
          const isSelected = formData.purpose?.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleSelectPurpose(option.value)}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                          ${isSelected
                            ? 'border-accent-blue bg-accent-blue/10 dark:bg-accent-blue/20 shadow-lg scale-105'
                            : 'border-border bg-background dark:bg-card hover:border-accent-blue/70 hover:shadow-md'}`}
            >
              <div className={`mb-2 ${isSelected ? 'text-accent-blue' : 'text-muted-foreground'}`}>
                {option.icon}
              </div>
              <span className={`text-sm font-medium ${isSelected ? 'text-accent-blue' : 'text-foreground'}`}>
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step4Purpose;
