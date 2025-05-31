import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function MyPlantsOverview() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif flex items-center">
          <span className="mr-2 animate-leaf-sway">🌿</span>
          My Plants Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          A quick look at the plants you are currently growing, with basic care information. (Details from your Plant Library)
        </p>
      </CardContent>
    </Card>
  );
}
