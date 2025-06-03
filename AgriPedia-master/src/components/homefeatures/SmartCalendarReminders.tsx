import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function SmartCalendarReminders() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader className="flex flex-row items-center gap-3">
        <CalendarDays size={28} className="text-primary group-hover:animate-sprout origin-bottom transition-transform duration-300" />
        <CardTitle className="font-serif">Smart Calendar & Reminders</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Generates personalized planting and maintenance schedules. Enables notifications for tasks like watering, pruning, and harvesting.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          View Calendar
        </Button>
      </CardFooter>
    </Card>
  );
}
