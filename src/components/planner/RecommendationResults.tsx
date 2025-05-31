'use client';

import React from 'react';
import { ProduceInfo } from '@/lib/produceData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, SunIcon, DropletsIcon } from 'lucide-react';
import Image from 'next/image';

interface RecommendationResultsProps {
  recommendations: ProduceInfo[];
  onBack: () => void;
}

const RecommendationResults: React.FC<RecommendationResultsProps> = ({ recommendations, onBack }) => {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-500">Your Personalized Recommendations</h1>
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Planner
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No plants currently match all your criteria.</p>
          <p className="text-md text-muted-foreground mt-2">Try adjusting your planner settings for a broader search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((plant, index) => (
            <Card
              key={plant.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0 relative h-48">
                <Image
                  src={plant.image || '/placeholder-plant.jpg'} // Provide a fallback placeholder image
                  alt={plant.commonName}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </CardHeader>
              <CardContent className="flex-grow p-4 space-y-2">
                <CardTitle className="text-xl text-green-700 dark:text-green-400">{plant.commonName}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground h-16 overflow-hidden">
                  {plant.description.length > 100 ? `${plant.description.substring(0, 100)}...` : plant.description}
                </CardDescription>

                <div>
                  <p className="text-xs text-muted-foreground"><strong>Planting:</strong> {plant.plantingMonths?.join(', ') || 'Varies'}</p>
                  <p className="text-xs text-muted-foreground"><strong>Harvest:</strong> {plant.growthDuration || 'N/A'}</p>
                </div>

                <div className="flex items-center space-x-4 pt-1">
                  {plant.sunlight && (
                    <div className="flex items-center text-xs text-muted-foreground" title={`Sunlight: ${plant.sunlight}`}>
                      <SunIcon className={`mr-1 h-4 w-4 ${
                        plant.sunlight === 'full' ? 'text-yellow-500' :
                        plant.sunlight === 'partial' ? 'text-yellow-400' :
                        'text-yellow-300'
                      }`} />
                       {plant.sunlight.charAt(0).toUpperCase() + plant.sunlight.slice(1)}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground" title="Water Needs (Placeholder)">
                     <DropletsIcon className="mr-1 h-4 w-4 text-blue-400" /> Moderate
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button variant="outline" className="w-full" disabled>
                  View Full Guide (Soon)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Basic CSS for animations (add to globals.css or a relevant CSS file)
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slideUp 0.4s ease-in-out forwards;
  opacity: 0; // Start hidden before animation
}
*/

export default RecommendationResults;
