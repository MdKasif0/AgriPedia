import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Leaf } from 'lucide-react';

export default function MyPlantsOverview() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader className="flex flex-row items-center gap-3">
        <Leaf size={28} className="text-primary group-hover:animate-sprout origin-bottom transition-transform duration-300" />
        <CardTitle className="font-serif">My Plants Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          A quick look at the plants you are currently growing, with basic care information.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          View My Garden
        </Button>
      </CardFooter>
    </Card>
  );
}
