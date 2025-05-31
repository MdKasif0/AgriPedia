import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function PersonalizedGrowPlanner() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center gap-3">
        <MapPin size={28} className="text-primary group-hover:animate-sprout origin-bottom transition-transform duration-300" />
        <CardTitle className="font-serif">Personalized Grow Planner</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Suggests plants based on your location, space, sunlight, season, and goals. Integrates local weather data to optimize planting times.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          Get Recommendations
        </Button>
      </CardFooter>
    </Card>
  );
}
