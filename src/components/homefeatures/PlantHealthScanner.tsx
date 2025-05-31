import React from 'react';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react'; // Using lucide-react for icons

export default function PlantHealthScanner() {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center mb-3">
        <ScanLine size={28} className="text-red-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Camera-Based Plant Health Scanner</h3>
      </div>
      <p className="text-gray-600 mb-4 text-sm">
        Use image recognition to detect pests, diseases, or nutrient deficiencies. Offers diagnosis and treatment suggestions.
      </p>
      <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
        Scan Plant
      </Button>
    </div>
  );
}
