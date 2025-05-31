import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react'; // Using lucide-react for icons

export default function PersonalizedGrowPlanner() {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center mb-3">
        <MapPin size={28} className="text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Personalized Grow Planner</h3>
      </div>
      <p className="text-gray-600 mb-4 text-sm">
        Suggests plants based on your location, space, sunlight, season, and goals. Integrates local weather data to optimize planting times.
      </p>
      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
        Get Recommendations
      </Button>
    </div>
  );
}
