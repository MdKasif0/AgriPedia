import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScanLine } from 'lucide-react';

export default function PlantHealthScanner() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader className="flex flex-row items-center gap-3">
        <ScanLine size={28} className="text-destructive group-hover:animate-sprout origin-bottom transition-transform duration-300" />
        <CardTitle className="font-serif">Camera-Based Plant Health Scanner</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Use image recognition to detect pests, diseases, or nutrient deficiencies. Offers diagnosis and treatment suggestions.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" className="w-full">
          Scan Plant
        </Button>
      </CardFooter>
    </Card>
  );
}
