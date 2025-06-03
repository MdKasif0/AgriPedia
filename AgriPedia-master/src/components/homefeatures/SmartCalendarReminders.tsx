import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUpcomingTasks, getOverdueTasks } from '@/services/calendarService';

export default function SmartCalendarReminders() {
  const router = useRouter();
  const upcomingTasks = getUpcomingTasks(3); // Get next 3 days of tasks
  const overdueTasks = getOverdueTasks();

  const handleViewCalendar = () => {
    router.push('/calendar');
  };

  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <CardHeader className="flex flex-row items-center gap-3">
        <CalendarDays size={28} className="text-primary group-hover:animate-sprout origin-bottom transition-transform duration-300" />
        <div>
          <CardTitle className="font-serif">Smart Calendar & Reminders</CardTitle>
          <CardDescription className="text-sm">
            {upcomingTasks.length} upcoming tasks, {overdueTasks.length} overdue
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          {overdueTasks.length > 0 && (
            <div className="text-sm text-destructive">
              ⚠️ {overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} overdue
            </div>
          )}
          {upcomingTasks.slice(0, 2).map(task => (
            <div key={task.id} className="text-sm text-muted-foreground">
              • {task.plantName}: {task.taskType} ({new Date(task.date).toLocaleDateString()})
            </div>
          ))}
          {upcomingTasks.length > 2 && (
            <div className="text-sm text-muted-foreground">
              +{upcomingTasks.length - 2} more tasks
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleViewCalendar}>
          View Calendar
        </Button>
      </CardFooter>
    </Card>
  );
}
