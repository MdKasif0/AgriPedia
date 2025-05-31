import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Assuming a Button component exists
import { Input } from '@/components/ui/input'; // Assuming an Input component exists
import { Label } from '@/components/ui/label'; // Assuming a Label component exists
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming a Select component exists
import { runFlow } from '@genkit-ai/next/client';
import { generatePlantRecommendationsFlow, PlantRecommendationsOutputSchema, PlantRecommendationSchema } from '@/ai/flows/generate-plant-recommendations-flow'; // Adjust path as needed
import { Loader2 } from 'lucide-react'; // For loading spinner

type Recommendation = Zod.infer<typeof PlantRecommendationSchema>;

export default function PersonalizedGrowPlanner() {
  const [location, setLocation] = useState('');
  const [space, setSpace] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [goals, setGoals] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring'; // Mar-May
    if (month >= 5 && month <= 7) return 'Summer'; // Jun-Aug
    if (month >= 8 && month <= 10) return 'Autumn'; // Sep-Nov
    return 'Winter'; // Dec-Feb
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    const currentSeason = getSeason();

    try {
      const result = await runFlow(generatePlantRecommendationsFlow, {
        location,
        space,
        sunlight,
        goals,
        season: currentSeason,
      });
      if (result.recommendations) {
        setRecommendations(result.recommendations);
      } else {
        setError("No recommendations received from the AI.");
      }
    } catch (err: any) {
      console.error("Error running flow:", err);
      setError(err.message || "Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl w-full max-w-2xl mx-auto"> {/* Added w-full, max-w-2xl, mx-auto for better layout */}
      <CardHeader>
        <CardTitle className="font-serif text-center">Personalized Grow Planner</CardTitle> {/* Centered title */}
      </CardHeader>
      <CardContent>
        <p className="text-center mb-6">
          Enter your preferences below to get personalized plant suggestions from our AI gardening expert!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="location" className="block text-sm font-medium mb-1">Your Location (e.g., City, State, Climate Zone)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Austin, TX or Zone 9b"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="space" className="block text-sm font-medium mb-1">Available Space</Label>
            <Select onValueChange={setSpace} value={space} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your growing space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small balcony">Small Balcony</SelectItem>
                <SelectItem value="large yard">Large Yard</SelectItem>
                <SelectItem value="indoor windowsill">Indoor Windowsill</SelectItem>
                <SelectItem value="patio containers">Patio Containers</SelectItem>
                <SelectItem value="community garden plot">Community Garden Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sunlight" className="block text-sm font-medium mb-1">Sunlight Exposure</Label>
            <Select onValueChange={setSunlight} value={sunlight} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sunlight conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full sun">Full Sun (6+ hours direct)</SelectItem>
                <SelectItem value="partial shade">Partial Shade (4-6 hours direct)</SelectItem>
                <SelectItem value="full shade">Full Shade (less than 4 hours direct)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="goals" className="block text-sm font-medium mb-1">Gardening Goals</Label>
            <Input
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., Grow vegetables, attract pollinators, low maintenance"
              required
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </Button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-serif text-center">AI Gardener's Suggestions:</h3>
            {recommendations.map((rec, index) => (
              <Card key={index} className="rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="font-serif">{rec.plantName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong className="font-medium">Why it's a good fit:</strong> {rec.reason}</p>
                  <p><strong className="font-medium">Care Highlights:</strong> {rec.careHighlights}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
