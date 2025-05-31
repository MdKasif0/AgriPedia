import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react'; // Using lucide-react for icons

export default function PlantGrowthTracker() {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center mb-3">
        <Camera size={28} className="text-purple-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Plant Growth Tracker / Journal</h3>
      </div>
      <p className="text-gray-600 mb-4 text-sm">
        Log photos, notes, and health conditions for your plants. Visualize progress in a timeline or gallery format.
      </p>
      <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
        Track Progress
      </Button>
    </div>
  );
}
