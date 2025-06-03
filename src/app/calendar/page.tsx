import React from 'react';
import { Metadata } from 'next';
import { CalendarView } from '@/components/calendar/CalendarView';

export const metadata: Metadata = {
  title: 'Care Calendar - AgriPedia',
  description: 'Track your plant care schedule',
};

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8">Care Calendar</h1>
      <CalendarView />
    </div>
  );
} 