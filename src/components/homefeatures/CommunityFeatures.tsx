import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CommunityFeatures() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif">Community Features</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          Connect with other gardeners. Share your gardens, tips, and progress.
        </p>
      </CardContent>
    </Card>
  );
}
