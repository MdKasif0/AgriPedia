import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plant } from '@/types/plant';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PlantRecommendationsProps {
  plannerData: {
    location: {
      climateZone: string;
    };
    space: string;
    sunlight: string;
    purpose: string[];
    experience: string;
    timeCommitment: string;
  };
}

export default function PlantRecommendations({ plannerData }: PlantRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Call the AI recommendation API
        const response = await fetch('/api/plant-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plannerData),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (plannerData) {
      fetchRecommendations();
    }
  }, [plannerData]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Plant Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Plant Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recommended Plants</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground">No plants match your current preferences.</p>
        ) : (
          <div className="grid gap-4">
            {recommendations.map((plant) => (
              <div key={plant.id} className="flex items-start gap-4 p-4 rounded-lg border">
                {plant.image && (
                  <img
                    src={plant.image}
                    alt={plant.commonName}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{plant.commonName}</h3>
                  <p className="text-sm text-muted-foreground italic">{plant.scientificName}</p>
                  <p className="text-sm mt-2">{plant.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {plant.climaticRequirements && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {plant.climaticRequirements.temperature.split('.')[0]}
                      </span>
                    )}
                    {plant.soilPreferences && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {plant.soilPreferences.split('.')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 