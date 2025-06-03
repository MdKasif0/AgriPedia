import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mic, MicOff, Share2, Download, Copy, Trash2, Edit2 } from 'lucide-react';
import { getGrowSuggestions } from '@/services/aiService';
import { getWeatherData, getPlantingRecommendations } from '@/services/weatherService';
import { saveGrowPlan, getGrowPlans, deleteGrowPlan, duplicateGrowPlan, GrowPlan } from '@/services/planService';
import PlantRecommendationResults from './PlantRecommendationResults';

interface PlannerFormData {
  location: string;
  experience: string;
  space: string;
  goals: string;
}

export default function PersonalizedGrowPlanner() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState<PlannerFormData>({
    location: '',
    experience: '',
    space: '',
    goals: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [savedPlans, setSavedPlans] = useState<GrowPlan[]>([]);
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    loadSavedPlans();
    getLocationAndWeather();
  }, []);

  const loadSavedPlans = () => {
    const plans = getGrowPlans();
    setSavedPlans(plans);
  };

  const getLocationAndWeather = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const weather = await getWeatherData(position.coords.latitude, position.coords.longitude);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error getting location/weather:', error);
    }
  };

  const startVoiceInput = async () => {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        setFormData(prev => ({
          ...prev,
          [activeTab]: transcript,
        }));
      };

      recognition.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Voice input is not supported in your browser',
        variant: 'destructive',
      });
    }
  };

  const stopVoiceInput = () => {
    setIsRecording(false);
    // Stop recognition
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const suggestions = await getGrowSuggestions(
        formData.location,
        formData.experience,
        formData.space,
        formData.goals
      );

      setRecommendations(suggestions.plants.map(plant => ({
        plant,
        matchScore: 85, // This would be calculated based on the AI response
        matchReasons: [suggestions.explanation],
      })));

      // Save the plan
      const newPlan = saveGrowPlan({
        name: `Grow Plan - ${new Date().toLocaleDateString()}`,
        description: suggestions.explanation,
        plants: suggestions.plants,
        season: new Date().toLocaleDateString(),
        location: formData.location,
        notes: suggestions.tips.join('\n'),
      });

      setSavedPlans(prev => [...prev, newPlan]);
      toast({
        title: 'Success',
        description: 'Your grow plan has been created!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (plan: GrowPlan) => {
    const link = generateShareableLink(plan);
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: 'Shareable link has been copied to clipboard',
    });
  };

  const handleDelete = (planId: string) => {
    deleteGrowPlan(planId);
    setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
    toast({
      title: 'Plan Deleted',
      description: 'Your grow plan has been deleted',
    });
  };

  const handleDuplicate = (planId: string) => {
    const newPlan = duplicateGrowPlan(planId);
    setSavedPlans(prev => [...prev, newPlan]);
    toast({
      title: 'Plan Duplicated',
      description: 'A copy of your grow plan has been created',
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">New Plan</TabsTrigger>
          <TabsTrigger value="saved">Saved Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Grow Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={value}
                        onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={`Enter your ${key}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={isRecording ? stopVoiceInput : startVoiceInput}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}

                {weatherData && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Local Weather</h3>
                    <p>Temperature: {weatherData.temperature}°C</p>
                    <p>Humidity: {weatherData.humidity}%</p>
                    <p>Conditions: {weatherData.description}</p>
                    <div className="mt-2">
                      <h4 className="font-medium">Planting Recommendations:</h4>
                      <ul className="list-disc list-inside">
                        {getPlantingRecommendations(weatherData).map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Generating Recommendations...' : 'Get Recommendations'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <PlantRecommendationResults
              recommendations={recommendations}
              isLoading={isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="saved">
          <div className="grid gap-4">
            {savedPlans.map(plan => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare(plan)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(plan.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{plan.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{plan.location}</p>
                    </div>
                    <div>
                      <p className="font-medium">Season</p>
                      <p className="text-muted-foreground">{plan.season}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium mb-2">Plants</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.plants.map((plant, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {plant}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 