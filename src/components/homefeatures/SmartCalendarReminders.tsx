import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SmartCalendarReminders() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif">Smart Calendar & Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          Generates personalized planting and maintenance schedules. Enables notifications for tasks like watering, pruning, and harvesting.
        </p>
      </CardContent>
    </Card>
  );
}
