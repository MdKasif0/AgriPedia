import React from 'react';

interface Reminder {
  id: number;
  task: string;
  timeframe: string;
  color: string; // For visual distinction
}

const remindersData: Reminder[] = [
  { id: 1, task: 'Water Tomatoes', timeframe: 'Today', color: 'blue' },
  { id: 2, task: 'Fertilize Basil', timeframe: 'Tomorrow', color: 'green' },
  { id: 3, task: 'Prune Lettuce', timeframe: 'In 3 days', color: 'yellow' },
  { id: 4, task: 'Check for Pests - Indoor Herbs', timeframe: 'Today', color: 'red' },
];

const SmartCalendarReminders: React.FC = () => {
  const getReminderStyles = (color: string): string => {
    switch (color) {
      case 'blue':
        return 'border-accent bg-accent/10 text-accent-foreground';
      case 'green':
        return 'border-primary bg-primary/10 text-primary'; // Using text-primary as foreground might be too light on primary/10
      case 'yellow':
        return 'border-secondary bg-secondary/10 text-secondary'; // Using text-secondary
      case 'red':
        return 'border-destructive bg-destructive/10 text-destructive-foreground';
      default:
        return 'border-muted bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-serif font-semibold mb-4 text-primary">Smart Calendar & Reminders</h3>

      {/* Calendar Placeholder */}
      <div className="mb-6">
        <div className="bg-muted/30 dark:bg-muted/10 border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground font-medium">Calendar Placeholder</p>
          <p className="text-sm text-muted-foreground/80 mt-1">A visual calendar will be displayed here.</p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="mb-6">
        <h4 className="text-lg font-serif font-medium text-card-foreground mb-3">Upcoming Tasks:</h4>
        <ul className="space-y-3">
          {remindersData.map((reminder) => (
            <li
              key={reminder.id}
              className={`p-3 rounded-lg flex items-center justify-between shadow-sm border-l-4 ${getReminderStyles(reminder.color)}`}
            >
              <span className="text-card-foreground">{reminder.task}</span>
              <span className={`text-sm font-medium text-inherit`}> {/* Inherit color from parent li */}
                {reminder.timeframe}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sync Button */}
      <div>
        <button
          // onClick={() => alert('Sync functionality to be implemented')} TODO: Implement actual sync
          className="w-full bg-accent text-accent-foreground py-2 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.02]"
        >
          Sync with Google Calendar
        </button>
        <p className="text-xs text-muted-foreground/80 mt-2 text-center">
          (This feature is currently under development)
        </p>
      </div>
    </div>
  );
};

export default SmartCalendarReminders;
