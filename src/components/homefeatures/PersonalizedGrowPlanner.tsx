import React, { useState } from 'react';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Sun, Leaf, Clock, Users, ArrowLeft, ArrowRight, Search, Info } from 'lucide-react';
import { setPlannerData, StoredPlannerData } from '@/lib/userDataStore';
import { ProduceInfo, getAllProduce } from '@/lib/produceData';
import { getPlantRecommendations } from '@/lib/recommendationEngine';
import RecommendationResults from '@/components/planner/RecommendationResults';

interface PlannerData {
  location: {
    manualAddress: string;
    lat?: number;
    lon?: number;
    climateZone?: string;
  };
  space: 'indoor' | 'balcony' | 'small_yard' | 'large_garden' | 'greenhouse' | '';
  spaceDimensions?: { width?: string; length?: string }; // Changed to string for input compatibility
  sunlight: 'low' | 'partial' | 'full' | '';
  purpose: string[];
  timeCommitment: number;
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
}

const initialFormData: PlannerData = {
  location: {
    manualAddress: '',
  },
  space: '',
  sunlight: '',
  purpose: [],
  timeCommitment: 50,
  experience: '',
};

const PersonalizedGrowPlanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PlannerData>(initialFormData);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState<ProduceInfo[]>([]);

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setSlideDirection('right');
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setSlideDirection('left');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else if (name.startsWith("spaceDimensions.")) {
      const dimensionField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        spaceDimensions: {
          ...prev.spaceDimensions,
          [dimensionField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleRadioChange = (name: keyof PlannerData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => {
      const newPurpose = prev.purpose.includes(value)
        ? prev.purpose.filter(item => item !== value)
        : [...prev.purpose, value];
      return { ...prev, purpose: newPurpose };
    });
  };

  const handleSliderChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      timeCommitment: value[0],
    }));
  };

  const handleSubmit = () => {
    // Construct the final data object to be saved
    const finalData: StoredPlannerData = {
      userId: `guestUser-${Date.now().toString()}`, // Simple unique ID
      location: {
        manualAddress: formData.location.manualAddress,
        // lat, lon, climateZone will be populated later if available
        lat: formData.location.lat,
        lon: formData.location.lon,
        climateZone: formData.location.climateZone,
      },
      space: formData.space,
      spaceDimensions: {
        width: formData.spaceDimensions?.width ? parseFloat(formData.spaceDimensions.width) : undefined,
        length: formData.spaceDimensions?.length ? parseFloat(formData.spaceDimensions.length) : undefined,
      },
      sunlight: formData.sunlight,
      purpose: formData.purpose,
      experience: formData.experience,
      timeCommitment: formData.timeCommitment,
      createdAt: new Date().toISOString(),
    };

    // Clean up undefined dimension fields
    if (finalData.spaceDimensions?.width === undefined || isNaN(finalData.spaceDimensions.width)) {
      delete finalData.spaceDimensions.width;
    }
    if (finalData.spaceDimensions?.length === undefined || isNaN(finalData.spaceDimensions.length)) {
      delete finalData.spaceDimensions.length;
    }
    if (finalData.spaceDimensions && Object.keys(finalData.spaceDimensions).length === 0) {
      delete finalData.spaceDimensions;
    }

    // Clean up undefined location fields
    if (finalData.location.lat === undefined) delete finalData.location.lat;
    if (finalData.location.lon === undefined) delete finalData.location.lon;
    if (finalData.location.climateZone === undefined || finalData.location.climateZone === '') delete finalData.location.climateZone;

    // Hardcode climateZone for testing recommendation engine as per subtask instructions
    finalData.location.climateZone = 'Temperate';

    setPlannerData(finalData);
    console.log("Final Form Data Saved for Recommendations:", finalData);

    const allPlants = getAllProduce();
    const plants = getPlantRecommendations(finalData, allPlants);
    setRecommendedPlants(plants);
    setShowResults(true);

    // Alert can be removed or changed to a success message for recommendations
    // alert("Planner data saved! Fetching recommendations...");
  };

  if (showResults) {
    return (
      <RecommendationResults
        recommendations={recommendedPlants}
        onBack={() => {
          setShowResults(false);
          // Optional: Reset currentStep to 1 if you want the planner to start from the beginning
          // setCurrentStep(1);
        }}
      />
    );
  }

  const renderStep = () => {
    const stepTransitionClass = slideDirection === 'right' ? 'animate-slide-in-from-right' : 'animate-slide-in-from-left';

    switch (currentStep) {
      case 1:
        return <StepLocation formData={formData} handleChange={handleChange} />;
      case 2:
        return <StepGrowingSpace formData={formData} handleChange={handleChange} handleRadioChange={handleRadioChange} />;
      case 3:
        return <StepSunlightExposure formData={formData} handleRadioChange={handleRadioChange} />;
      case 4:
        return <StepPurpose formData={formData} handleCheckboxChange={handleCheckboxChange} />;
      case 5:
        return <StepTimeCommitment formData={formData} handleSliderChange={handleSliderChange} />;
      case 6:
        return <StepExperienceLevel formData={formData} handleRadioChange={handleRadioChange} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  // Placeholder Step Components
  const StepLocation: React.FC<{formData: PlannerData, handleChange: any}> = ({ formData, handleChange }) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center"><MapPin className="mr-2 h-6 w-6 text-green-600" /> Location</CardTitle>
        <CardDescription>Tell us where you'll be growing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manualAddress">Search for your address</Label>
          <div className="flex space-x-2">
            <Input
              id="manualAddress"
              name="location.manualAddress"
              placeholder="Enter your city, state, or zip code"
              value={formData.location.manualAddress}
              onChange={handleChange}
            />
            <Button variant="outline" size="icon" type="button" disabled> {/* Search button functionality to be added later */}
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" className="w-full" type="button" disabled>Auto-detect My Location (Coming Soon)</Button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" name="location.lat" type="number" value={formData.location.lat ?? ''} onChange={handleChange} disabled placeholder="e.g., 34.0522" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lon">Longitude</Label>
            <Input id="lon" name="location.lon" type="number" value={formData.location.lon ?? ''} onChange={handleChange} disabled placeholder="e.g., -118.2437" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="climateZone">Climate Zone</Label>
            <Input id="climateZone" name="location.climateZone" value={formData.location.climateZone ?? ''} onChange={handleChange} disabled placeholder="e.g., USDA Zone 10a" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StepGrowingSpace: React.FC<{formData: PlannerData, handleChange: any, handleRadioChange: any}> = ({ formData, handleChange, handleRadioChange }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Leaf className="mr-2 h-6 w-6 text-green-600" /> Growing Space</CardTitle>
        <CardDescription>Where will your plants live?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          name="space"
          value={formData.space}
          onValueChange={(value) => handleRadioChange('space', value)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="indoor" id="indoor" />
            <Label htmlFor="indoor">Indoor (windowsill, grow lights)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="balcony" id="balcony" />
            <Label htmlFor="balcony">Balcony / Patio</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small_yard" id="small_yard" />
            <Label htmlFor="small_yard">Small Yard (raised beds, containers)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large_garden" id="large_garden" />
            <Label htmlFor="large_garden">Large Garden / Allotment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="greenhouse" id="greenhouse" />
            <Label htmlFor="greenhouse">Greenhouse</Label>
          </div>
        </RadioGroup>
        <div className="space-y-2 pt-4">
            <Label>Optional: Dimensions (e.g., for beds or pots)</Label>
            <div className="flex space-x-2">
                <Input
                    name="spaceDimensions.width"
                    type="text" // Keep as text to allow "ft" or "m", parsing happens at submission
                    placeholder="Width (e.g., 4ft or 1.2m)"
                    value={formData.spaceDimensions?.width || ''}
                    onChange={handleChange}
                />
                <Input
                    name="spaceDimensions.length"
                    type="text" // Keep as text for same reason
                    placeholder="Length (e.g., 8ft or 2.4m)"
                    value={formData.spaceDimensions?.length || ''}
                    onChange={handleChange}
                />
            </div>
        </div>
      </CardContent>
    </Card>
  );

  const StepSunlightExposure: React.FC<{formData: PlannerData, handleRadioChange: any}> = ({ formData, handleRadioChange }) => (
     <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Sun className="mr-2 h-6 w-6 text-yellow-500" /> Sunlight Exposure</CardTitle>
        <CardDescription>How much direct sun does the area get per day?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          <RadioGroup
            name="sunlight"
            value={formData.sunlight}
            onValueChange={(value) => handleRadioChange('sunlight', value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low_sun" />
              <Label htmlFor="low_sun">Low Sunlight</Label>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 -ml-1"><Info className="h-4 w-4 opacity-50" /></Button></TooltipTrigger>
                <TooltipContent><p>e.g., less than 4 hours of direct sun</p></TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partial" id="partial_sun" />
              <Label htmlFor="partial_sun">Partial Sunlight</Label>
               <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 -ml-1"><Info className="h-4 w-4 opacity-50" /></Button></TooltipTrigger>
                <TooltipContent><p>e.g., 4-6 hours of direct sun</p></TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="full_sun" />
              <Label htmlFor="full_sun">Full Sunlight</Label>
               <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5 -ml-1"><Info className="h-4 w-4 opacity-50" /></Button></TooltipTrigger>
                <TooltipContent><p>e.g., more than 6 hours of direct sun</p></TooltipContent>
              </Tooltip>
            </div>
          </RadioGroup>
        </TooltipProvider>
      </CardContent>
    </Card>
  );

  const StepPurpose: React.FC<{formData: PlannerData, handleCheckboxChange: any}> = ({ formData, handleCheckboxChange }) => {
    const purposes = [
      { id: "vegetables", label: "Vegetables (for eating)" },
      { id: "herbs", label: "Herbs (culinary or aromatic)" },
      { id: "fruits", label: "Fruits (berries, trees, vines)" },
      { id: "flowers", label: "Flowers (ornamental, cut flowers)" },
      { id: "medicinal", label: "Medicinal Plants" },
      { id: "pet_safe", label: "Pet-Safe Plants" },
    ];
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Leaf className="mr-2 h-6 w-6 text-lime-600" /> Purpose of Growing</CardTitle>
          <CardDescription>What do you want to grow? (Select all that apply)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {purposes.map(purpose => (
            <div key={purpose.id} className="flex items-center space-x-2">
              <Checkbox
                id={purpose.id}
                checked={formData.purpose.includes(purpose.id)}
                onCheckedChange={() => handleCheckboxChange(purpose.id)}
              />
              <Label htmlFor={purpose.id} className="font-normal">{purpose.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const StepTimeCommitment: React.FC<{formData: PlannerData, handleSliderChange: any}> = ({ formData, handleSliderChange }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Clock className="mr-2 h-6 w-6 text-blue-600" /> Time Commitment</CardTitle>
        <CardDescription>How much time can you dedicate to plant care?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-8">
        <Slider
          name="timeCommitment"
          min={0}
          max={100}
          step={10}
          value={[formData.timeCommitment]}
          onValueChange={handleSliderChange}
        />
        <div className="text-sm text-center text-muted-foreground pt-2">
          {formData.timeCommitment <= 10 ? "Low Maintenance (minimal weekly check-ins)" :
           formData.timeCommitment <= 40 ? "Occasional Care (a few times a week)" :
           formData.timeCommitment <= 70 ? "Regular Attention (daily/every other day)" :
           "Daily Care Okay (love to be hands-on)"}
        </div>
      </CardContent>
    </Card>
  );

  const StepExperienceLevel: React.FC<{formData: PlannerData, handleRadioChange: any}> = ({ formData, handleRadioChange }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Users className="mr-2 h-6 w-6 text-purple-600" /> Gardening Experience</CardTitle>
        <CardDescription>What's your current experience level with gardening?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          name="experience"
          value={formData.experience}
          onValueChange={(value) => handleRadioChange('experience', value)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner">Beginner (Just starting out, need lots of guidance)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate">Intermediate (Some successes and failures, know the basics)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced">Advanced (Comfortable with a wide range of plants and techniques)</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );

  const progress = Math.max(10, (currentStep / totalSteps) * 100); // Ensure minimum width for visibility at step 1

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-2xl">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>Personalized Grow Planner</CardTitle>
          <CardDescription>Let's find the perfect plants for your space and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-2 w-full bg-muted">
            <div
              className="h-2 bg-green-600 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="p-6 min-h-[450px] overflow-hidden"> {/* Ensure consistent height */}
            {/* The key forces a re-render on step change, allowing animations to play */}
            <div key={currentStep} className={slideDirection === 'right' ? 'animate-slide-in-from-right' : 'animate-slide-in-from-left'}>
                 {renderStep()}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
          <div>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Get Recommendations
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PersonalizedGrowPlanner;
