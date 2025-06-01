import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function SeedToHarvestTimeline() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="font-serif">Seed-to-Harvest Timeline Visualization</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Interactive bars showing each plant’s progress and milestones from seed to harvest.
        </p>
      </CardContent>
    </Card>
  );
}
