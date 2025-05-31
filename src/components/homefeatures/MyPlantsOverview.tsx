import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming Button component exists
import { Leaf } from 'lucide-react'; // Using lucide-react for icons

export default function MyPlantsOverview() {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center mb-3">
        <Leaf size={28} className="text-green-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">My Plants Overview</h3>
      </div>
      <p className="text-gray-600 mb-4 text-sm">
        A quick look at the plants you are currently growing, with basic care information.
      </p>
      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
        View My Garden
      </Button>
    </div>
  );
}
