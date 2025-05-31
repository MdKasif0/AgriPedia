import React, { useState } from 'react';

const PersonalizedGrowPlanner: React.FC = () => {
import { getPlantSuggestions } from '@/app/actions/gardeningActions';
import * as z from 'zod'; // For types
import { SuggestPlantsInputSchema } from '@/ai/flows/suggest-plants-flow'; // For types

const PersonalizedGrowPlanner: React.FC = () => {
  const [location, setLocation] = useState('');
  const [space, setSpace] = useState<'Balcony' | 'Yard' | 'Indoor'>('Balcony');
  const [sunlight, setSunlight] = useState<'Full Sun' | 'Partial Shade' | 'Full Shade'>('Full Sun');
  const [goals, setGoals] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPlants, setSuggestedPlants] = useState<string[]>([]);
  const [flowMessage, setFlowMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuggestedPlants([]);
    setFlowMessage(null);
    setErrorMessage(null);

    const inputData: z.infer<typeof SuggestPlantsInputSchema> = {
      location,
      space,
      sunlight,
      goals,
    };

    try {
      const result = await getPlantSuggestions(inputData);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuggestedPlants(result.suggestions);
        if (result.message) {
          setFlowMessage(result.message);
        }
      }
    } catch (error: any) {
      console.error("Error calling getPlantSuggestions action:", error);
      setErrorMessage(error.message || 'An unexpected error occurred on the client.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-serif font-semibold text-primary">Personalized Grow Planner</h3>
        {/* Simple Leaf SVG Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-primary ml-2 animate-leaf-sway origin-bottom-left">
          <path d="M10 3.5c0-1.383-2.239-2.5-5-2.5S0 2.117 0 3.5C0 4.883 2.239 6 5 6s5-1.117 5-2.5zM10 3.5c0 .83.672 1.5 1.5 1.5h.007c.209 0 .413-.04.603-.116.73-.288 1.566-.384 2.39-.384 1.381 0 2.5.671 2.5 1.5s-1.119 1.5-2.5 1.5c-.824 0-1.66-.096-2.39-.384a1.494 1.494 0 00-.603-.116H11.5C10.672 5 10 4.33 10 3.5zm-.5 6.5c.25-.4.582-.734.97-1H5.5A2.5 2.5 0 003 11.5v.063c.902.366 1.89.613 2.936.73.66.075 1.334.107 2.014.107.68 0 1.354-.032 2.015-.107a5.99 5.99 0 002.935-.73V11.5A2.5 2.5 0 0013 9h-2.03c.388.266.72.6.97 1H10a.5.5 0 00-.5.5zM5 13c-1.657 0-3 .895-3 2s1.343 2 3 2c1.093 0 2.065-.408 2.596-1H4.5a.5.5 0 010-1h3.096C7.065 13.408 6.093 13 5 13zm10 0c-1.093 0-2.065.408-2.596 1H15.5a.5.5 0 010 1h-3.096c.531.592 1.503 1 2.596 1 1.657 0 3-.895 3-2s-1.343-2-3-2z" />
        </svg>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-primary bg-input text-foreground placeholder:text-muted-foreground"
            placeholder="e.g., New York, USA or your climate zone"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="space" className="block text-sm font-medium text-muted-foreground mb-1">
            Available Space
          </label>
          <select
            id="space"
            value={space}
            onChange={(e) => setSpace(e.target.value as 'Balcony' | 'Yard' | 'Indoor')}
            className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-primary bg-input text-foreground"
          >
            <option value="Balcony">Balcony</option>
            <option value="Yard">Yard</option>
            <option value="Indoor">Indoor</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="sunlight" className="block text-sm font-medium text-muted-foreground mb-1">
            Sunlight Exposure
          </label>
          <select
            id="sunlight"
            value={sunlight}
            onChange={(e) => setSunlight(e.target.value as 'Full Sun' | 'Partial Shade' | 'Full Shade')}
            className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-primary bg-input text-foreground"
          >
            <option value="Full Sun">Full Sun</option>
            <option value="Partial Shade">Partial Shade</option>
            <option value="Full Shade">Full Shade</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="goals" className="block text-sm font-medium text-muted-foreground mb-1">
            Gardening Goals
          </label>
          <textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-primary bg-input text-foreground placeholder:text-muted-foreground"
            placeholder="e.g., Grow vegetables for cooking, attract pollinators, create a relaxing green space"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.02] active:animate-click-pulse disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Getting Suggestions...' : 'Get Suggestions'}
        </button>
      </form>

      {isLoading && (
        <div className="mt-6 text-center">
          <p className="text-primary animate-pulse">Fetching recommendations for you...</p>
          {/* Optional: add a spinner SVG here */}
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive-foreground">
          <h4 className="font-semibold font-serif">Error</h4>
          <p>{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && suggestedPlants.length > 0 && (
        <div className="mt-6 p-4 bg-accent/10 dark:bg-accent/20 border border-accent/30 rounded-md">
          <h4 className="text-lg font-serif font-semibold text-accent-foreground mb-2">Plant Suggestions:</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            {suggestedPlants.map((plant, index) => (
              <li key={index}>{plant}</li>
            ))}
          </ul>
          {flowMessage && (
            <p className="text-sm text-muted-foreground/80 mt-3">{flowMessage}</p>
          )}
        </div>
      )}

      {!isLoading && !errorMessage && suggestedPlants.length === 0 && flowMessage && (
         <div className="mt-6 p-4 bg-muted/50 border border-border rounded-md">
           <p className="text-muted-foreground">{flowMessage}</p>
         </div>
      )}
    </div>
  );
};

export default PersonalizedGrowPlanner;
