'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming Checkbox component exists

interface PlantSuggestion {
  id: string;
  name: string;
  // Add other relevant plant properties later
}

interface PersonalizedGrowPlannerProps {
  // Props if any, to be defined later
}

const PersonalizedGrowPlanner: React.FC<PersonalizedGrowPlannerProps> = () => {
  const [location, setLocation] = useState<string>('');
  const [availableSpace, setAvailableSpace] = useState<string>('');
  const [sunlight, setSunlight] = useState<string>('');
  const [season, setSeason] = useState<string>('');
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [suggestedPlants, setSuggestedPlants] = useState<PlantSuggestion[]>([]);

  const goalsOptions = [
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'herbs', label: 'Herbs' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'flowers', label: 'Flowers' },
  ];

  const handleGoalChange = (goalId: string) => {
    setUserGoals(prevGoals =>
      prevGoals.includes(goalId)
        ? prevGoals.filter(g => g !== goalId)
        : [...prevGoals, goalId]
    );
  };

  const handleFindPlants = () => {
    // Placeholder for plant suggestion logic
    console.log({ location, availableSpace, sunlight, season, userGoals });
    // Example suggestion:
    setSuggestedPlants([{ id: 'tomato', name: 'Tomato' }]);
    // Actual logic will be implemented later
  };

  return (
    <div className="p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Personalized Grow Planner</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Input */}
        <div>
          <Label htmlFor="location" className="text-sm font-medium">Location (e.g., City, Zip Code)</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            className="mt-1"
          />
          {/* Future: Button to use browser location */}
        </div>

        {/* Available Space Dropdown */}
        <div>
          <Label htmlFor="availableSpace" className="text-sm font-medium">Available Space</Label>
          <Select value={availableSpace} onValueChange={setAvailableSpace}>
            <SelectTrigger id="availableSpace" className="mt-1">
              <SelectValue placeholder="Select your space" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balcony">Balcony</SelectItem>
              <SelectItem value="small_yard">Small Yard</SelectItem>
              <SelectItem value="large_yard">Large Yard</SelectItem>
              <SelectItem value="indoor_pots">Indoor Pots</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sunlight Dropdown */}
        <div>
          <Label htmlFor="sunlight" className="text-sm font-medium">Sunlight Exposure</Label>
          <Select value={sunlight} onValueChange={setSunlight}>
            <SelectTrigger id="sunlight" className="mt-1">
              <SelectValue placeholder="Select sunlight conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_sun">Full Sun (6+ hours direct)</SelectItem>
              <SelectItem value="partial_shade">Partial Shade (4-6 hours direct)</SelectItem>
              <SelectItem value="full_shade">Full Shade (less than 4 hours direct)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Season Dropdown */}
        <div>
          <Label htmlFor="season" className="text-sm font-medium">Current Season</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger id="season" className="mt-1">
              <SelectValue placeholder="Select the current season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="autumn">Autumn</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
          {/* Future: Auto-detect season */}
        </div>
      </div>

      {/* User Goals Checkboxes */}
      <div>
        <Label className="text-sm font-medium">What do you want to grow?</Label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {goalsOptions.map(goal => (
            <div key={goal.id} className="flex items-center space-x-2">
              <Checkbox
                id={`goal-${goal.id}`}
                checked={userGoals.includes(goal.id)}
                onCheckedChange={() => handleGoalChange(goal.id)}
              />
              <Label htmlFor={`goal-${goal.id}`} className="text-sm font-normal">
                {goal.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={handleFindPlants} size="lg" className="w-full md:w-auto">
          Find Plants for Me
        </Button>
      </div>

      {/* Suggested Plants Area */}
      {suggestedPlants.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-xl font-semibold mb-4">Suggested Plants:</h3>
          <ul className="space-y-3">
            {suggestedPlants.map(plant => (
              <li key={plant.id} className="p-3 bg-muted rounded-md shadow-sm">
                <p className="font-medium text-muted-foreground">{plant.name}</p>
                {/* More plant details can be displayed here */}
              </li>
            ))}
          </ul>
        </div>
      )}
       {suggestedPlants.length === 0 && (
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground">Enter your preferences above to see plant suggestions.</p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedGrowPlanner;
