'use client';

import React from 'react';
import GrowPlanDashboard from '@/components/growplan/GrowPlanDashboard';
import { getAllPlants } from '@/lib/plantDataStore';

export default function GrowPlanPage() {
  const [savedPlants, setSavedPlants] = React.useState([]);

  React.useEffect(() => {
    const loadPlants = async () => {
      const plants = await getAllPlants();
      setSavedPlants(plants);
    };
    loadPlants();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Grow Plan</h1>
      <GrowPlanDashboard savedPlants={savedPlants} />
    </div>
  );
} 