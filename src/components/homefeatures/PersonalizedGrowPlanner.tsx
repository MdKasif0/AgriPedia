'use client';

import React, { useState } from 'react';
import plantSuggestions from '@/lib/data/plantSuggestions.json';

interface Plant {
  id: string;
  name: string;
  suitability: {
    location: string[];
    space: string[];
    sunlight: string[];
    season: string[];
    goals: string[];
  };
  basicCare: string;
}

const allGoals = [
  { id: 'beginner_friendly', name: 'Beginner Friendly' },
  { id: 'quick_harvest', name: 'Quick Harvest' },
  { id: 'continuous_yield', name: 'Continuous Yield' },
  { id: 'herbs', name: 'Herbs' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
];

export default function PersonalizedGrowPlanner() {
  const [location, setLocation] = useState('outdoor');
  const [space, setSpace] = useState('large_pot');
  const [sunlight, setSunlight] = useState('full_sun');
  const [season, setSeason] = useState('spring');
  const [userGoals, setUserGoals] = useState<string[]>(['beginner_friendly']);
  const [suggestedPlantsList, setSuggestedPlantsList] = useState<Plant[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleGoalChange = (goalId: string) => {
    setUserGoals(prevGoals =>
      prevGoals.includes(goalId)
        ? prevGoals.filter(g => g !== goalId)
        : [...prevGoals, goalId]
    );
  };

  const handleFindPlants = () => {
    setSubmitted(true);
    const filtered = plantSuggestions.filter(plant => {
      const p = plant as Plant; // Type assertion
      const matchesLocation = p.suitability.location.includes(location);
      const matchesSpace = p.suitability.space.includes(space);
      const matchesSunlight = p.suitability.sunlight.includes(sunlight);
      const matchesSeason = p.suitability.season.includes(season) || p.suitability.season.includes('any');
      const matchesGoals = userGoals.length === 0 || userGoals.some(goal => p.suitability.goals.includes(goal));

      return matchesLocation && matchesSpace && matchesSunlight && matchesSeason && matchesGoals;
    });
    setSuggestedPlantsList(filtered);
  };

  const SelectField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {value: string, label: string}[], id: string}> =
    ({label, value, onChange, options, id}) => (
    <div className="mb-3">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-1 text-gray-800">Personalized Grow Planner</h3>
      <p className="text-sm text-gray-600 mb-4">
        Find plants based on your location, space, sunlight, season, and goals.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 text-sm">
        <SelectField
          label="Location"
          id="location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          options={[
            { value: 'outdoor', label: 'Outdoor' },
            { value: 'indoor', label: 'Indoor' },
            { value: 'balcony', label: 'Balcony' },
          ]}
        />
        <SelectField
          label="Space Available"
          id="space"
          value={space}
          onChange={e => setSpace(e.target.value)}
          options={[
            { value: 'small_pot', label: 'Small Pot (herbs, small plants)' },
            { value: 'large_pot', label: 'Large Pot (tomatoes, peppers)' },
            { value: 'garden_bed', label: 'Garden Bed' },
            { value: 'vertical_planter', label: 'Vertical Planter' },
          ]}
        />
        <SelectField
          label="Sunlight"
          id="sunlight"
          value={sunlight}
          onChange={e => setSunlight(e.target.value)}
          options={[
            { value: 'full_sun', label: 'Full Sun (6+ hours)' },
            { value: 'partial_shade', label: 'Partial Shade (4-6 hours)' },
            { value: 'shade', label: 'Shade (<4 hours)' },
          ]}
        />
        <SelectField
          label="Season"
          id="season"
          value={season}
          onChange={e => setSeason(e.target.value)}
          options={[
            { value: 'spring', label: 'Spring' },
            { value: 'summer', label: 'Summer' },
            { value: 'autumn', label: 'Autumn' },
            { value: 'winter', label: 'Winter' },
            { value: 'any', label: 'Any (Indoors/Greenhouse)' },
          ]}
        />
      </div>

      <div className="mb-3 mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Goals (select one or more):</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {allGoals.map(goal => (
            <label key={goal.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={userGoals.includes(goal.id)}
                onChange={() => handleGoalChange(goal.id)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span>{goal.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={handleFindPlants}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
      >
        Find Plants
      </Button>

      {submitted && (
        <div className="mt-4 flex-grow overflow-y-auto min-h-[100px]">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Suggested Plants:</h4>
          {suggestedPlantsList.length === 0 ? (
            <p className="text-sm text-gray-500">No plants match your exact criteria. Try broadening your selections.</p>
          ) : (
            <ul className="space-y-3">
              {suggestedPlantsList.map(plant => (
                <li key={plant.id} className="p-3 border border-gray-200 rounded-md bg-gray-50 text-sm">
                  <h5 className="font-semibold text-gray-800">{plant.name}</h5>
                  <p className="text-gray-600 text-xs mt-0.5">{plant.basicCare}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
