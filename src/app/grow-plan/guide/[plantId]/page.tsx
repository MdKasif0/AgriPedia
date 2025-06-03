'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GrowingGuide from '@/components/planner/GrowingGuide';
import { growingGuides } from '@/data/growingGuides';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PlantGuidePage() {
  const params = useParams();
  const [userPreferences, setUserPreferences] = useState({
    location: '',
    space: '',
    experience: '',
  });

  useEffect(() => {
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const plantId = params.plantId as string;
  const plantGuide = growingGuides[plantId];

  if (!plantGuide) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Plant Guide Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find a growing guide for this plant.
            </p>
            <Link href="/grow-plan/plans">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Grow Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/grow-plan/plans">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Grow Plans
          </Button>
        </Link>
      </div>
      <GrowingGuide
        plantId={plantGuide.plant_id}
        commonName={plantGuide.common_name}
        scientificName={plantGuide.scientific_name}
        growingGuide={plantGuide.growing_guide}
        startDate={new Date()} // This should come from the user's plan
        userPreferences={userPreferences}
      />
    </div>
  );
} 