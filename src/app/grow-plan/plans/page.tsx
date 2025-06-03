import React from 'react';
import GrowPlanManager from '@/components/planner/GrowPlanManager';

export default function GrowPlansPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Grow Plans</h1>
      <GrowPlanManager />
    </div>
  );
} 