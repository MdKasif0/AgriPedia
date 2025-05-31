import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, MapPin, Sprout, Home, Search } from 'lucide-react';

type GrowGoal = "Grow food" | "Beautify space" | "Learn gardening" | "";
type Space = "Indoor" | "Balcony" | "Yard" | "";

const OnboardingRecap: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [growGoal, setGrowGoal] = useState<GrowGoal>("");
  const [location, setLocation] = useState("");
  const [space, setSpace] = useState<Space>("");

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="growGoal" className="text-lg">What's your primary gardening goal?</Label>
              <Select onValueChange={(value: GrowGoal) => setGrowGoal(value)} value={growGoal}>
                <SelectTrigger id="growGoal">
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grow food">
                    <div className="flex items-center">
                      <Sprout className="mr-2 h-5 w-5" /> Grow food
                    </div>
                  </SelectItem>
                  <SelectItem value="Beautify space">
                    <div className="flex items-center">
                      <Home className="mr-2 h-5 w-5" /> Beautify space
                    </div>
                  </SelectItem>
                  <SelectItem value="Learn gardening">
                    <div className="flex items-center">
                      <Search className="mr-2 h-5 w-5" /> Learn gardening
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        );
      case 2:
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-lg">Where are you gardening?</Label>
              <p className="text-sm text-muted-foreground">This helps us determine your climate zone for better plant suggestions.</p>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <Input
                  id="location"
                  placeholder="Enter ZIP code or city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              {/* TODO: Integrate OpenWeatherMap API for climate data */}
            </div>
          </CardContent>
        );
      case 3:
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="space" className="text-lg">What kind of space are you working with?</Label>
              <Select onValueChange={(value: Space) => setSpace(value)} value={space}>
                <SelectTrigger id="space">
                  <SelectValue placeholder="Select your space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indoor">
                     <div className="flex items-center">
                        <Home className="mr-2 h-5 w-5" /> Indoor
                    </div>
                  </SelectItem>
                  <SelectItem value="Balcony">
                    <div className="flex items-center">
                        <Sprout className="mr-2 h-5 w-5" /> Balcony
                    </div>
                  </SelectItem>
                  <SelectItem value="Yard">
                    <div className="flex items-center">
                        <Search className="mr-2 h-5 w-5" /> Yard
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        );
      case 4:
        return (
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Plant Suggestions</h3>
            <p className="text-sm text-muted-foreground">Based on your selections, here are some plants you might like:</p>
            {/* TODO: Integrate Gemini API for plant suggestions */}
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
              <p className="text-center text-gray-500 dark:text-gray-400">Plant suggestions will appear here.</p>
            </div>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Gardening Setup</CardTitle>
          <CardDescription className="text-center">
            Let's get some information to help you start your gardening journey! (Step {currentStep} of 4)
          </CardDescription>
        </CardHeader>
        {renderStep()}
        <CardFooter className="flex justify-between pt-6">
          {currentStep > 1 && (
            <Button onClick={prevStep} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}
          {currentStep < 4 ? (
            <Button onClick={nextStep} disabled={
              (currentStep === 1 && !growGoal) ||
              (currentStep === 2 && !location) ||
              (currentStep === 3 && !space)
            }>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => alert("Onboarding Complete! Data: " + JSON.stringify({ growGoal, location, space }))}>
              Finish
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingRecap;
