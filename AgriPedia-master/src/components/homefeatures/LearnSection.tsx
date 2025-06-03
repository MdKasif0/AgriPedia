import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LearnSection() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="font-serif">Learn Section</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          A rich resource library with a glossary, beginner tips, composting guides, and seasonal planting strategies. Tutorials on DIY projects.
        </p>
      </CardContent>
    </Card>
  );
}
