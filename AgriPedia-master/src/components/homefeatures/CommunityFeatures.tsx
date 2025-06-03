import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function CommunityFeatures() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader>
        <CardTitle className="font-serif">Community Features</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Connect with other gardeners. Share your gardens, tips, and progress.
        </p>
      </CardContent>
    </Card>
  );
}
