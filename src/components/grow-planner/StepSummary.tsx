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
    <div className="mb-3 p-3 bg-background/50 dark:bg-card/50 rounded-lg shadow-sm border border-border/50">
      <h3 className="text-md font-semibold text-muted-foreground mb-1">{title}</h3>
      <div className="text-sm text-foreground">{children || <span className="text-muted-foreground/80">Not specified</span>}</div>
    </div>
  );

  return (
    <div className="p-4 border border-border rounded-lg bg-card shadow-xl"> {/* Enhanced shadow */}
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        Step 7: Your Personalized Plan Summary
      </h2>

      <div className="space-y-4"> {/* Increased spacing */}
        <Section title="Location">
          Lat: {formData.latitude || <span className="text-muted-foreground/80">N/A</span>}, Lon: {formData.longitude || <span className="text-muted-foreground/80">N/A</span>}
          {formData.climateZone && `, Zone: ${formData.climateZone}`}
        </Section>

        <Section title="Growing Space">
          {formData.growingSpace ? formData.growingSpace.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : <span className="text-muted-foreground/80">Not specified</span>}
        </Section>

        <Section title="Sunlight Exposure">
          {formData.sunlightExposure ? formData.sunlightExposure.charAt(0).toUpperCase() + formData.sunlightExposure.slice(1) : <span className="text-muted-foreground/80">Not specified</span>}
        </Section>

        <Section title="I want to grow...">
          {formData.purpose && formData.purpose.length > 0
            ? formData.purpose.map(p => p.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
            : <span className="text-muted-foreground/80">Not specified</span>}
        </Section>

        <Section title="Time Commitment">
          {formData.timeCommitment !== undefined ? `~${formData.timeCommitment} hour${formData.timeCommitment === 1 ? '' : 's'} per week` : <span className="text-muted-foreground/80">Not specified</span>}
        </Section>

        <Section title="Experience Level">
          {formData.experienceLevel ? formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1) : <span className="text-muted-foreground/80">Not specified</span>}
        </Section>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleGetRecommendations}
          size="lg" // Using predefined button sizes if available
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" // Ensure it uses Button's own styling primarily
        >
          Get My Recommendations!
        </Button>
      </div>
    </div>
  );
};

export default StepSummary;
