import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming Button component is available

interface StepSummaryProps {
  formData: {
    latitude?: string;
    longitude?: string;
    climateZone?: string;
    growingSpace?: string;
    sunlightExposure?: string;
    purpose?: string[];
    timeCommitment?: number;
    experienceLevel?: string;
  };
}

const StepSummary: React.FC<StepSummaryProps> = ({ formData }) => {
  const handleGetRecommendations = () => {
    console.log("Form Data Submitted:", formData);
    // Placeholder for future API call or further processing
    alert("Recommendations feature coming soon! Check console for your data.");
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4 p-3 bg-gray-50 rounded-md shadow-sm">
      <h3 className="text-md font-semibold text-gray-600 mb-1">{title}</h3>
      <div className="text-sm text-gray-800">{children || <span className="text-gray-400">Not specified</span>}</div>
    </div>
  );

  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        Step 7: Your Personalized Plan Summary
      </h2>

      <div className="space-y-3">
        <Section title="Location">
          Lat: {formData.latitude || 'N/A'}, Lon: {formData.longitude || 'N/A'}
          {formData.climateZone && `, Zone: ${formData.climateZone}`}
        </Section>

        <Section title="Growing Space">
          {formData.growingSpace ? formData.growingSpace.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null}
        </Section>

        <Section title="Sunlight Exposure">
          {formData.sunlightExposure ? formData.sunlightExposure.charAt(0).toUpperCase() + formData.sunlightExposure.slice(1) : null}
        </Section>

        <Section title="I want to grow...">
          {formData.purpose && formData.purpose.length > 0
            ? formData.purpose.map(p => p.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
            : null}
        </Section>

        <Section title="Time Commitment">
          {formData.timeCommitment !== undefined ? `~${formData.timeCommitment} hour${formData.timeCommitment === 1 ? '' : 's'} per week` : null}
        </Section>

        <Section title="Experience Level">
          {formData.experienceLevel ? formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1) : null}
        </Section>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleGetRecommendations}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-base font-semibold"
        >
          Get My Recommendations!
        </Button>
      </div>
    </div>
  );
};

export default StepSummary;
