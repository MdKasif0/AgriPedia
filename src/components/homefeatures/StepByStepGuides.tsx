import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function StepByStepGuides() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif">Step-by-Step Growing Guides</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          Detailed instructions for planting, watering, spacing, fertilizing, and harvesting. Covers indoor, outdoor, hydroponic, and vertical methods.
        </p>
      </CardContent>
    </Card>
  );
}
