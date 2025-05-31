import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import React, { useState, useEffect } from 'react'; // useEffect imported
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { setGrowPlannerData, getGrowPlannerData, clearGrowPlannerData, GrowPlannerFormData, GrowPlannerData } from "@/lib/userDataStore"; // getGrowPlannerData, clearGrowPlannerData, GrowPlannerData added
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Alert components added
import { MapPin, Sun, Leaf, Flower, Clock, User, Loader2, Home, Building, Trees, Warehouse, Sprout, Cloudy, SunMedium, Carrot, Apple, Dog, HeartPulse, Flower2, Coffee, Zap, GraduationCap, Award, CheckCircle, Trash2 } from 'lucide-react'; // Trash2 added

const TOTAL_STEPS = 6;

// Define step names for dynamic titles
const stepNames = [
  "Location",
  "Growing Space",
  "Sunlight Exposure",
  "Purpose",
  "Time Commitment",
  "Experience Level",
];

export default function PersonalizedGrowPlanner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const [savedData, setSavedData] = useState<GrowPlannerData | null>(null);
  const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);

  const initialFormData: GrowPlannerFormData = {
    location: { lat: null, lon: null, climateZone: '', address: '' },
    growingSpace: '', // Default, will be updated by user
    spaceDimensions: { length: '', width: '', unit: 'feet' },
    sunlight: '', // Default, will be updated by user
    purpose: [],
    timeCommitment: 'low-maintenance',
    experience: 'beginner',
  };

  const [formData, setFormData] = useState<GrowPlannerFormData>(initialFormData);

  useEffect(() => {
    const data = getGrowPlannerData();
    setSavedData(data);
    setIsLoadingSavedData(false);
  }, []);

  // Options for Growing Space (Step 2)
  // This section had a merge artifact in the previous plan, cleaning it up.
  const growingSpaceOptions = [
    { id: 'indoor', value: 'indoor', label: 'Indoor (e.g., windowsill, grow tent)', icon: <Home className="mr-2 h-5 w-5" /> },
    { id: 'balcony', value: 'balcony', label: 'Balcony or Patio', icon: <Building className="mr-2 h-5 w-5" /> },
    { id: 'small-yard', value: 'small-yard', label: 'Small Yard / Garden Bed', icon: <Sprout className="mr-2 h-5 w-5" /> },
    { id: 'large-garden', value: 'large-garden', label: 'Large Garden / Allotment', icon: <Trees className="mr-2 h-5 w-5" /> },
    { id: 'greenhouse', value: 'greenhouse', label: 'Greenhouse', icon: <Warehouse className="mr-2 h-5 w-5" /> },
  ];

  // Options for Sunlight Exposure (Step 3)
  const sunlightOptions = [
    { id: 'low', value: 'low', label: 'Low / Shade', description: 'Mostly shady, less than 4 hours of direct sun.', icon: <Cloudy className="mr-2 h-5 w-5" /> },
    { id: 'partial', value: 'partial', label: 'Partial Sun', description: '4-6 hours of direct sun, can be morning or afternoon.', icon: <SunMedium className="mr-2 h-5 w-5" /> },
    { id: 'full', value: 'full', label: 'Full Sun', description: '6+ hours of direct sun per day.', icon: <Sun className="mr-2 h-5 w-5" /> },
  ];

  // Options for Purpose (Step 4)
  const purposeOptions = [
    { id: 'vegetables', value: 'vegetables', label: 'Vegetables', icon: <Carrot className="mr-2 h-5 w-5" /> },
    { id: 'herbs', value: 'herbs', label: 'Herbs', icon: <Leaf className="mr-2 h-5 w-5" /> },
    { id: 'fruits', value: 'fruits', label: 'Fruits', icon: <Apple className="mr-2 h-5 w-5" /> },
    { id: 'flowers', value: 'flowers', label: 'Flowers', icon: <Flower2 className="mr-2 h-5 w-5" /> }, // Using Flower2
    { id: 'medicinal', value: 'medicinal', label: 'Medicinal Plants', icon: <HeartPulse className="mr-2 h-5 w-5" /> },
    { id: 'pet-safe', value: 'pet-safe', label: 'Pet-Safe Plants', icon: <Dog className="mr-2 h-5 w-5" /> },
  ];

  // Definitions for Time Commitment (Step 5)
  const timeCommitmentLevels = [
    { value: 0, label: "Low Maintenance", description: "A few times a week (e.g., watering, occasional check-up).", icon: <Coffee className="h-5 w-5" /> },
    { value: 1, label: "Moderate", description: "Regular attention (e.g., every other day for watering, pruning).", icon: <Clock className="h-5 w-5" /> },
    { value: 2, label: "High / Daily Care", description: "Daily care needed (e.g., watering, misting, specific needs).", icon: <Zap className="h-5 w-5" /> },
  ];

  // Options for Experience Level (Step 6)
  const experienceOptions = [
    { id: 'beginner', value: 'beginner', label: 'Beginner', description: "New to gardening, looking for easy-to-care-for plants.", icon: <User className="mr-2 h-5 w-5" /> }, // User icon for beginner
    { id: 'intermediate', value: 'intermediate', label: 'Intermediate', description: "Some experience, comfortable with more variety.", icon: <GraduationCap className="mr-2 h-5 w-5" /> },
    { id: 'advanced', value: 'advanced', label: 'Advanced', description: "Experienced gardener, up for a challenge!", icon: <Award className="mr-2 h-5 w-5" /> },
  ];

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, address: e.target.value },
    }));
    setLocationError(null); // Clear error when user types
  };

  const handleGrowingSpaceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, growingSpace: value }));
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      spaceDimensions: { ...prev.spaceDimensions, [name]: value },
    }));
  };

  const handleUnitChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      spaceDimensions: { ...prev.spaceDimensions, unit: value },
    }));
  };

  const handleSunlightChange = (value: string) => {
    setFormData((prev) => ({ ...prev, sunlight: value }));
  };

  const handlePurposeChange = (purposeValue: string) => {
    setFormData((prev) => {
      const currentPurposes = prev.purpose as string[];
      const newPurposes = currentPurposes.includes(purposeValue)
        ? currentPurposes.filter((p) => p !== purposeValue)
        : [...currentPurposes, purposeValue];
      return { ...prev, purpose: newPurposes };
    });
  };

  const handleTimeCommitmentChange = (value: number[]) => {
    const numericValue = value[0];
    const commitmentLevel = timeCommitmentLevels.find(level => level.value === numericValue);
    if (commitmentLevel) {
      setFormData((prev) => ({ ...prev, timeCommitment: commitmentLevel.label.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-') })); // e.g. "low-maintenance"
    }
  };

  const handleExperienceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, experience: value }));
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              lat: latitude,
              lon: longitude,
              address: `Current Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            },
          }));
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(`Could not fetch location: ${error.message}. Please enter manually.`);
          setIsLocating(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    try {
      setGrowPlannerData(formData);
      const updatedSavedData = getGrowPlannerData(); // Re-fetch to include userId and createdAt
      setSavedData(updatedSavedData);
      // Reset form to first step and initial data, as user has now "submitted" and is viewing summary.
      setCurrentStep(1);
      setFormData(initialFormData);
      toast({
        title: "Preferences Saved!",
        description: "Your personalized grow plan settings have been saved.",
        action: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    } catch (error) {
      console.error("Failed to save grow planner data:", error);
      toast({
        title: "Error",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Where are you planning to grow?</h3>
            <div>
              <Label htmlFor="address" className="text-sm font-medium">Enter your address or general location</Label>
              <Input
                id="address"
                type="text"
                placeholder="E.g., 123 Main St, Anytown, USA or "
                value={formData.location.address}
                onChange={handleLocationInputChange}
                className="mt-1"
              />
            </div>
            <div className="text-center my-2 text-sm text-muted-foreground">OR</div>
            <Button
              onClick={handleGeolocate}
              disabled={isLocating}
              className="w-full flex items-center justify-center"
              variant="outline"
            >
              {isLocating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Use My Current Location
            </Button>
            {locationError && <p className="text-red-500 text-sm mt-2">{locationError}</p>}
            {formData.location.lat && formData.location.lon && !locationError && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Selected Location:</span> {formData.location.address}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Climate zone will be determined automatically.
                </p>
              </div>
            )}
             {!formData.location.lat && !formData.location.lon && !locationError && formData.location.address && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Entered Address:</span> {formData.location.address}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                  Climate zone will be determined automatically based on this address.
                </p>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">What kind of space are you working with?</h3>

            <RadioGroup
              value={formData.growingSpace}
              onValueChange={handleGrowingSpaceChange}
              className="space-y-2"
            >
              {growingSpaceOptions.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent ${
                    formData.growingSpace === option.value ? 'bg-accent border-primary ring-2 ring-primary' : 'border-muted'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.id} className="sr-only" />
                  {option.icon}
                  <span>{option.label}</span>
                </Label>
              ))}
            </RadioGroup>

            <div>
              <h4 className="text-lg font-medium mt-6 mb-2">Optional: Space Dimensions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="length" className="text-sm">Length</Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.spaceDimensions.length}
                    onChange={handleDimensionChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="width" className="text-sm">Width</Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.spaceDimensions.width}
                    onChange={handleDimensionChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-sm">Unit</Label>
                  <Select
                    name="unit"
                    value={formData.spaceDimensions.unit}
                    onValueChange={handleUnitChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feet">Feet</SelectItem>
                      <SelectItem value="meters">Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <TooltipProvider>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">How much sunlight does the space get?</h3>
              <RadioGroup
                value={formData.sunlight}
                onValueChange={handleSunlightChange}
                className="space-y-2"
              >
                {sunlightOptions.map((option) => (
                  <Tooltip key={option.id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor={option.id}
                        className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent ${
                          formData.sunlight === option.value ? 'bg-accent border-primary ring-2 ring-primary' : 'border-muted'
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.id} className="sr-only" />
                        {option.icon}
                        <span>{option.label}</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </RadioGroup>
            </div>
          </TooltipProvider>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">What do you want to grow?</h3>
            <p className="text-sm text-muted-foreground">Select all that apply.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {purposeOptions.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-accent ${
                    (formData.purpose as string[]).includes(option.value) ? 'bg-accent border-primary ring-2 ring-primary' : 'border-muted'
                  }`}
                >
                  <Checkbox
                    id={option.id}
                    checked={(formData.purpose as string[]).includes(option.value)}
                    onCheckedChange={() => handlePurposeChange(option.value)}
                    className="h-5 w-5"
                  />
                  {option.icon}
                  <span>{option.label}</span>
                </Label>
              ))}
            </div>
          </div>
        );
      case 5:
        const currentTimeCommitmentValue = timeCommitmentLevels.find(
          level => level.label.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-') === formData.timeCommitment
        )?.value ?? 0;
        const currentDescription = timeCommitmentLevels.find(level => level.value === currentTimeCommitmentValue)?.description;
        const currentIcon = timeCommitmentLevels.find(level => level.value === currentTimeCommitmentValue)?.icon;

        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">How much time can you dedicate?</h3>
            <div className="space-y-4">
              <Slider
                defaultValue={[currentTimeCommitmentValue]}
                min={0}
                max={timeCommitmentLevels.length - 1}
                step={1}
                onValueChange={handleTimeCommitmentChange}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                {timeCommitmentLevels.map(level => (
                  <span key={level.value} className="flex flex-col items-center text-center w-1/3">
                     {level.icon && React.cloneElement(level.icon, {
                      className: `h-6 w-6 mb-1 ${currentTimeCommitmentValue === level.value ? 'text-primary' : ''}`
                    })}
                    <span className={`${currentTimeCommitmentValue === level.value ? 'font-semibold text-primary' : ''}`}>
                      {level.label}
                    </span>
                  </span>
                ))}
              </div>
              {currentDescription && (
                <div className="mt-4 p-3 bg-accent/50 border border-border rounded-md flex items-center space-x-3">
                   {currentIcon && React.cloneElement(currentIcon, { className: "h-5 w-5 text-primary"})}
                  <p className="text-sm text-foreground">{currentDescription}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">What's your gardening experience level?</h3>
            <RadioGroup
              value={formData.experience}
              onValueChange={handleExperienceChange}
              className="space-y-2"
            >
              {experienceOptions.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-accent ${
                    formData.experience === option.value ? 'bg-accent border-primary ring-2 ring-primary' : 'border-muted'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.id} className="sr-only" />
                  {option.icon}
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && <span className="text-xs text-muted-foreground font-normal">{option.description}</span>}
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  const handleClearPreferences = () => {
    clearGrowPlannerData();
    setSavedData(null);
    toast({
      title: "Preferences Cleared",
      description: "Your saved grow plan settings have been cleared.",
    });
    // Reset form to initial state and first step
    setCurrentStep(1);
    setFormData(initialFormData);
  };

  if (isLoadingSavedData) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading saved preferences...</p>
      </div>
    );
  }

  if (savedData) {
    return (
      <Alert variant="default" className="h-full flex flex-col">
        <AlertTitle className="text-xl font-serif flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-primary" /> Your Saved Grow Plan Preferences
        </AlertTitle>
        <AlertDescription className="flex-grow mt-4 space-y-2 text-sm">
          <p><strong>Location:</strong> {savedData.location.address || 'Not specified'}</p>
          <p><strong>Growing Space:</strong> {savedData.growingSpace || 'Not specified'}</p>
          {savedData.spaceDimensions && (savedData.spaceDimensions.length || savedData.spaceDimensions.width) && (
            <p><strong>Dimensions:</strong> {savedData.spaceDimensions.length} x {savedData.spaceDimensions.width} {savedData.spaceDimensions.unit}</p>
          )}
          <p><strong>Sunlight:</strong> {savedData.sunlight || 'Not specified'}</p>
          <p><strong>Purpose:</strong> {savedData.purpose.join(', ') || 'Not specified'}</p>
          <p><strong>Time Commitment:</strong> {savedData.timeCommitment || 'Not specified'}</p>
          <p><strong>Experience:</strong> {savedData.experience || 'Not specified'}</p>
          <p className="text-xs text-muted-foreground pt-2">
            Saved on: {new Date(savedData.createdAt).toLocaleDateString()} by User ID: {savedData.userId.substring(0,8)}...
          </p>
        </AlertDescription>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleClearPreferences} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Preferences & Start Over
          </Button>
        </div>
      </Alert>
    );
  }

  // If no saved data, render the form
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          Step {currentStep} of {TOTAL_STEPS}: {stepNames[currentStep - 1]}
        </CardTitle>
        <CardDescription>
          Please fill out the details to get personalized plant recommendations.
        </CardDescription>
        <Progress value={(currentStep / TOTAL_STEPS) * 100} className="mt-2" />
      </CardHeader>
      <CardContent className="flex-grow p-6">
        {renderStepContent()}
      </CardContent>
      <CardFooter className="flex justify-between p-6">
        <Button onClick={prevStep} disabled={currentStep === 1} variant="outline">
          Previous
        </Button>
        {currentStep === TOTAL_STEPS ? (
          <Button onClick={handleSubmit} className="w-auto">
            Submit
          </Button>
        ) : (
          <Button onClick={nextStep} className="w-auto">
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
