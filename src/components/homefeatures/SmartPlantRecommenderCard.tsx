'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Leaf, AlertTriangle, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGardeningProfile, GardeningProfile } from '@/lib/userDataStore'; // Assuming GardeningProfile type is exported
import { smartPlantRecommenderFlow } from '@/ai/flows/smart-plant-recommender-flow'; // Path to your flow
import { runFlow } from 'genkit';

// Define output schema: Recommended plants (matching the flow's output)
interface RecommendedPlant {
  plantName: string;
  reasoning: string;
  careDifficulty?: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

const SmartPlantRecommenderCard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendedPlant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GardeningProfile | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const userProfile = getGardeningProfile();
    setProfile(userProfile);

    if (!userProfile.location || !userProfile.goals || userProfile.goals.length === 0) {
      setError('Please set your location and gardening goals in your profile to get recommendations.');
      setIsLoading(false);
      setRecommendations([]);
      return;
    }

    try {
      // Construct the input for the flow based on the userProfile
      // Ensure all required fields by GardeningProfileSchema in the flow are met.
      const flowInput = {
        location: userProfile.location || 'default location', // Provide a fallback or handle more gracefully
        goals: userProfile.goals || [],
        plantLogs: userProfile.plantLogs || [],
        preferences: userProfile.preferences || [],
      };
      const result = await runFlow(smartPlantRecommenderFlow, flowInput);
      setRecommendations(result || []);
    } catch (e: any) {
      console.error('Error fetching plant recommendations:', e);
      setError('Could not fetch recommendations. Please try again later.');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleManageProfile = () => {
    // TODO: Implement navigation or modal to manage gardening profile
    // For now, this could re-trigger fetching if profile might have changed elsewhere,
    // or simply be a placeholder.
    alert('Navigation to profile management page/modal not yet implemented.');
    // Optionally, re-fetch if profile could have been updated by another component/tab
    // fetchRecommendations();
  };

  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg flex items-center">
            <Leaf size={22} className="mr-2 text-primary group-hover:animate-sway-slight" />
            Smart Plant Recommender
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleManageProfile} title="Manage Profile">
            <Settings2 size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="ml-2">Finding best plants for you...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="text-center text-red-500 flex flex-col items-center justify-center h-full">
            <AlertTriangle size={24} className="mb-2" />
            <p>{error}</p>
            {error.includes('profile') && (
                 <Button onClick={handleManageProfile} variant="link" className="mt-2">
                Update Profile
              </Button>
            )}
          </div>
        )}
        {!isLoading && !error && recommendations.length === 0 && (
          <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
            <Leaf size={24} className="mb-2" />
            <p>No recommendations available at this time, or your profile might be too general.</p>
            <p className="text-sm">Try adding more specific goals or logs to your profile!</p>
             <Button onClick={handleManageProfile} variant="link" className="mt-2">
                Update Profile
              </Button>
          </div>
        )}
        {!isLoading && !error && recommendations.length > 0 && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {recommendations.map((plant, index) => (
                <motion.div
                  key={plant.plantName + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-3 border rounded-lg bg-background/50"
                >
                  <h4 className="font-semibold text-md text-primary">{plant.plantName}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{plant.reasoning}</p>
                  {plant.careDifficulty && (
                    <Badge variant="outline" className="text-xs">
                      {plant.careDifficulty.charAt(0).toUpperCase() + plant.careDifficulty.slice(1)}
                    </Badge>
                  )}
                  {plant.notes && <p className="text-xs mt-1 italic">Note: {plant.notes}</p>}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Recommendations improve as you add more to your profile and logs.</p>
      </CardFooter>
    </Card>
  );
};

export default SmartPlantRecommenderCard;
