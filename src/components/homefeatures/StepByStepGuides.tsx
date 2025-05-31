import React, { useState } from 'react';

interface Guide {
  id: number;
  title: string;
  details: {
    plantingTime: string;
    spacing: string;
    watering: string;
    indoorOutdoor: string;
    organicHydroponic: string;
  };
}

const guidesData: Guide[] = [
  {
    id: 1,
    title: 'Tomato Growing Guide',
    details: {
      plantingTime: 'Spring',
      spacing: '12-24 inches',
      watering: 'Daily, keep soil moist',
      indoorOutdoor: 'Suitable for both outdoor beds and large indoor containers. Ensure good airflow indoors.',
      organicHydroponic: 'Thrives with organic compost. Can be adapted for hydroponic systems with nutrient solutions.',
    },
  },
  {
    id: 2,
    title: 'Basil Care Instructions',
    details: {
      plantingTime: 'Late Spring / Early Summer',
      spacing: '6-12 inches',
      watering: 'When top inch of soil is dry',
      indoorOutdoor: 'Excellent for sunny windowsills (indoor) or warm garden spots (outdoor).',
      organicHydroponic: 'Prefers rich organic soil. Easily grown hydroponically using NFT or DWC systems.',
    },
  },
  {
    id: 3,
    title: 'Lettuce Hydroponics',
    details: {
      plantingTime: 'Year-round (indoor)',
      spacing: '6-10 inches',
      watering: 'N/A (hydroponic system)',
      indoorOutdoor: 'Primarily designed for indoor hydroponic setups, but principles can apply to outdoor soil-less systems.',
      organicHydroponic: 'Hydroponic by nature, using specific nutrient solutions. Organic nutrient options are available.',
    },
  },
];

import { getPlantTip } from '@/app/actions/gardeningActions'; // Import the server action

const StepByStepGuides: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [tipLoading, setTipLoading] = useState(false);
  const [generatedTip, setGeneratedTip] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);

  const handleSelectGuide = async (guide: Guide | null) => {
    setSelectedGuide(guide);
    setGeneratedTip(null);
    setTipError(null);

    if (guide) {
      setTipLoading(true);
      try {
        const result = await getPlantTip({ plantName: guide.title });
        if (result.error) {
          setTipError(result.error);
        } else {
          setGeneratedTip(result.tip);
        }
      } catch (error: any) {
        console.error("Error calling getPlantTip action:", error);
        setTipError(error.message || "Failed to fetch tip.");
      } finally {
        setTipLoading(false);
      }
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-serif font-semibold mb-4 text-primary">Step-by-Step Growing Guides</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {guidesData.map((guide) => (
          <button
            key={guide.id}
            onClick={() => handleSelectGuide(guide)}
            className={`p-4 border rounded-lg text-left transition-all duration-150 ease-in-out hover:scale-[1.03] hover:shadow-lg ${
              selectedGuide?.id === guide.id
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-muted/30 dark:bg-muted/10 border-border hover:bg-muted/50 dark:hover:bg-muted/20 hover:border-primary/70'
            }`}
          >
            <h4 className="font-medium font-serif text-current">{guide.title}</h4>
            {/* text-current will inherit from button's text color */}
          </button>
        ))}
      </div>

      {selectedGuide && (
        <div className="bg-muted/20 dark:bg-muted/10 border-border p-4 rounded-lg border">
          <h4 className="text-lg font-serif font-semibold text-primary mb-3">{selectedGuide.title} - Details</h4>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="font-semibold text-card-foreground">Planting Time:</strong> {selectedGuide.details.plantingTime}</p>
            <p><strong className="font-semibold text-card-foreground">Spacing:</strong> {selectedGuide.details.spacing}</p>
            <p><strong className="font-semibold text-card-foreground">Watering:</strong> {selectedGuide.details.watering}</p>
          </div>

          <div className="mt-4">
            <h5 className="font-serif font-semibold text-md text-card-foreground mb-1">Indoor & Outdoor Methods</h5>
            <p className="text-sm text-muted-foreground">{selectedGuide.details.indoorOutdoor}</p>
          </div>

          <div className="mt-4">
            <h5 className="font-serif font-semibold text-md text-card-foreground mb-1">Organic and Hydroponic Methods</h5>
            <p className="text-sm text-muted-foreground">{selectedGuide.details.organicHydroponic}</p>
          </div>

          {/* AI Generated Tip Section */}
          <div className="mt-6 pt-4 border-t border-border">
            <h5 className="font-serif font-semibold text-md text-primary mb-2">✨ AI Generated Tip:</h5>
            {tipLoading && (
              <p className="text-muted-foreground animate-pulse">Fetching tip...</p>
            )}
            {tipError && (
              <p className="text-destructive">{tipError}</p>
            )}
            {generatedTip && !tipLoading && !tipError && (
              <p className="text-sm text-card-foreground bg-primary/10 p-3 rounded-md">{generatedTip}</p>
            )}
          </div>

          <button
            onClick={() => handleSelectGuide(null)} // Use handleSelectGuide to also clear tip states
            className="mt-6 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/90 text-sm transition-all duration-150 ease-in-out hover:scale-[1.03]"
          >
            Close Guide
          </button>
        </div>
      )}

      {!selectedGuide && (
        <p className="text-muted-foreground text-center py-4">Select a guide above to see the details.</p>
      )}
    </div>
  );
};

export default StepByStepGuides;
