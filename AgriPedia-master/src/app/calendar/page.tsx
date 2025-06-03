'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GrowCalendar from '@/components/calendar/GrowCalendar';
import ReminderSettings from '@/components/calendar/ReminderSettings';
import TaskStreak from '@/components/calendar/TaskStreak';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Settings, Trophy } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-8 py-6">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Grow Calendar</h1>
        <p className="text-muted-foreground">
          Stay on track with your plants' care schedule
        </p>
      </motion.header>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <GrowCalendar />
        </TabsContent>

        <TabsContent value="streaks" className="mt-6">
          <div className="grid gap-6">
            <TaskStreak
              streak={{
                plantId: 'current',
                currentStreak: 5,
                longestStreak: 10,
                lastCompleted: new Date().toISOString(),
                badges: ['Early Bird', 'Consistent Care'],
              }}
              plantName="All Plants"
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ReminderSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
} 