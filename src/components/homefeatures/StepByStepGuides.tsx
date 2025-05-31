'use client';

import React, { useState } from 'react';
import { allGuides, getGuideById, PlantGuide } from '@/lib/data/guides'; // Adjusted import path
import { ChevronLeft } from 'lucide-react';

export default function StepByStepGuides() {
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [currentGuide, setCurrentGuide] = useState<PlantGuide | null | undefined>(null);

  const handleSelectGuide = (id: string) => {
    setSelectedGuideId(id);
    setCurrentGuide(getGuideById(id));
  };

  const handleBackToList = () => {
    setSelectedGuideId(null);
    setCurrentGuide(null);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white h-full flex flex-col">
      {!currentGuide ? (
        <>
          <h3 className="text-xl font-semibold mb-1 text-gray-800">Step-by-Step Growing Guides</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select a plant to view its detailed growing guide.
          </p>
          <div className="space-y-2 overflow-y-auto">
            {allGuides.map(guide => (
              <button
                key={guide.id}
                onClick={() => handleSelectGuide(guide.id)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-green-100 border border-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <h4 className="font-medium text-green-700">{guide.plantName}</h4>
                <p className="text-xs text-gray-500 truncate">{guide.introduction}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <button
              onClick={handleBackToList}
              className="flex items-center text-sm text-green-600 hover:text-green-800 font-medium focus:outline-none"
            >
              <ChevronLeft size={20} className="mr-1" />
              Back to Guides List
            </button>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">{currentGuide.plantName} Guide</h3>
          <p className="text-sm text-gray-600 mb-4 italic">{currentGuide.introduction}</p>
          <div className="overflow-y-auto flex-grow pr-1 space-y-3">
            {currentGuide.sections.map(section => (
              <div key={section.title} className="pb-2">
                <h4 className="text-lg font-semibold text-green-700 mb-1">{section.title}</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
           <p className="mt-4 text-xs text-gray-500">
            Methods covered: {currentGuide.methodsCovered.join(', ') || 'General guide'}
          </p>
        </div>
      )}
    </div>
  );
}
