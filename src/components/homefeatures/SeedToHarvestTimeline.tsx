import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SeedToHarvestTimeline() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif">Seed-to-Harvest Timeline Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          Interactive bars showing each plant’s progress and milestones from seed to harvest.
        </p>
      </CardContent>
    </Card>
  );
}
