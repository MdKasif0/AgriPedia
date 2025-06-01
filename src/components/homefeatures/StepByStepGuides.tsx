import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function StepByStepGuides() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="font-serif">Step-by-Step Growing Guides</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Detailed instructions for planting, watering, spacing, fertilizing, and harvesting. Covers indoor, outdoor, hydroponic, and vertical methods.
        </p>
      </CardContent>
    </Card>
  );
}
