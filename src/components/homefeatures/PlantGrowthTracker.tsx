import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming a Textarea component exists
import { Label } from '@/components/ui/label';
import { runFlow } from '@genkit-ai/next/client';
import { generatePersonalizedPlantTipFlow, PersonalizedPlantTipOutputSchema } from '@/ai/flows/generate-personalized-plant-tip-flow'; // Adjust path
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react'; // Icons

type PersonalizedTipResult = Zod.infer<typeof PersonalizedPlantTipOutputSchema>;

export default function PlantGrowthTracker() {
  const [plantType, setPlantType] = useState('');
  const [currentObservation, setCurrentObservation] = useState('');
  const [personalizedTip, setPersonalizedTip] = useState<PersonalizedTipResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetTip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPersonalizedTip(null);

    try {
      const result = await runFlow(generatePersonalizedPlantTipFlow, {
        plantType,
        recentLogs: currentObservation,
      });
      setPersonalizedTip(result);
    } catch (err: any) {
      console.error("Error running personalized tip flow:", err);
      setError(err.message || "Failed to get a personalized tip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-serif text-center">Plant Growth Tracker / Journal</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center mb-6">
          Log photos, notes, and health conditions for your plants. Get AI-powered tips based on your observations!
        </p>

        <form onSubmit={handleGetTip} className="space-y-6 mb-8">
          <div>
            <Label htmlFor="plantType" className="block text-sm font-medium mb-1">What plant are you observing?</Label>
            <Input
              id="plantType"
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              placeholder="e.g., Tomato, Basil, Fiddle Leaf Fig"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="currentObservation" className="block text-sm font-medium mb-1">Your recent observation or note:</Label>
            <Textarea
              id="currentObservation"
              value={currentObservation}
              onChange={(e) => setCurrentObservation(e.target.value)}
              placeholder="e.g., Leaves are yellowing slightly, noticed some small bugs, new flower buds appearing."
              required
              className="w-full min-h-[100px]"
            />
          </div>

          <Button type="submit" disabled={loading || !plantType || !currentObservation} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
            {loading ? 'Getting Your Tip...' : 'Get Personalized Tip'}
          </Button>
        </form>

        {error && (
          <div className="mt-6 p-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error Getting Tip</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {personalizedTip && (
          <div className="mt-6 p-4 bg-primary/10 text-primary-foreground border border-primary/30 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-6 h-6 mr-2 text-primary" />
              <h4 className="text-lg font-semibold font-serif text-primary">Your Personalized Tip:</h4>
            </div>
            <p className="text-foreground">{personalizedTip.tip}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-8 text-center">
          Full tracking features including photo uploads and historical logs will be available soon.
        </p>
      </CardContent>
    </Card>
  );
}
