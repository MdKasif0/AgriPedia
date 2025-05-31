import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react'; // Using lucide-react for icons

export default function SmartCalendarReminders() {
  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center mb-3">
        <CalendarDays size={28} className="text-yellow-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Smart Calendar & Reminders</h3>
      </div>
      <p className="text-gray-600 mb-4 text-sm">
        Generates personalized planting and maintenance schedules. Enables notifications for tasks like watering, pruning, and harvesting.
      </p>
      <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
        View Calendar
      </Button>
    </div>
  );
}
