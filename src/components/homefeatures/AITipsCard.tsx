'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getGardeningProfile, GardeningProfile } from '@/lib/userDataStore'; // For user context
import { aiTipsFlow } from '@/ai/flows/ai-tips-flow'; // Path to your flow
import { runFlow } from 'genkit';

interface AiTip {
  tip: string;
  category?: string;
  relevanceScore?: number;
}

const AITipsCard: React.FC = () => {
  const [tip, setTip] = useState<AiTip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTip = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userProfile: GardeningProfile = getGardeningProfile();
      // Construct context for the AI tip flow
      const flowContext = {
        plants: userProfile.plantLogs?.map(log => ({ name: log.plantName, stage: undefined, health: log.status })) || [],
        location: userProfile.location,
        // recentInteractions: [], // Could be added if we track these
        // tipPreferences: [], // Could be added from user settings
      };

      const result = await runFlow(aiTipsFlow, flowContext);
      if (result && result.tip) {
        setTip(result);
      } else {
        setError('Could not fetch a helpful tip right now. Try again later.');
        setTip({ tip: "Keep your garden tidy by removing weeds regularly. This helps your plants get all the nutrients they need!", category: "Maintenance" }); // Fallback
      }
    } catch (e: any) {
      console.error('Error fetching AI tip:', e);
      setError('An error occurred while generating a tip.');
      setTip({ tip: "Don't forget to water your plants according to their needs. Check soil moisture before watering!", category: "Watering" }); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTip();
  }, [fetchTip]);

  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg flex items-center">
            <Lightbulb size={22} className="mr-2 text-primary group-hover:animate-pulse-bright" />
            AI Gardener's Tip
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchTip} title="Get new tip" disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''}/>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        {isLoading && (
          <div className="flex items-center text-muted-foreground">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="ml-2">Generating your tip...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="text-center text-red-500">
            <AlertTriangle size={24} className="mx-auto mb-2" />
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && tip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-md leading-relaxed">{tip.tip}</p>
            {tip.category && (
              <p className="text-xs text-muted-foreground mt-2">(Category: {tip.category})</p>
            )}
          </motion.div>
        )}
      </CardContent>
      {tip?.relevanceScore && !isLoading && !error && (
        <CardFooter className="text-xs text-muted-foreground justify-end">
            Relevance: {(tip.relevanceScore * 100).toFixed(0)}%
        </CardFooter>
      )}
    </Card>
  );
};

export default AITipsCard;
