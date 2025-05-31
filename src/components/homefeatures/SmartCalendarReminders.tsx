'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import {
  getReminders,
  addReminder,
  deleteReminder,
  toggleReminderComplete,
  type Reminder
} from '@/lib/userDataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have a Checkbox component
import { Trash2, PlusCircle, CalendarDays, ListChecks, ListX } from 'lucide-react';

export default function SmartCalendarReminders() {
  const [remindersList, setRemindersList] = useState<Reminder[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    setRemindersList(getReminders());
  }, []);

  const handleAddReminder = (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !newDate) {
      alert('Please enter a task and select a date.');
      return;
    }
    const newReminder = addReminder({ task: newTask, date: newDate });
    setRemindersList(prev => [...prev, newReminder].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewTask('');
    setNewDate('');
  };

  const handleToggleComplete = (reminderId: string) => {
    toggleReminderComplete(reminderId);
    setRemindersList(getReminders());
  };

  const handleDeleteReminder = (reminderId: string) => {
    deleteReminder(reminderId);
    setRemindersList(getReminders());
  };

  const filteredReminders = remindersList.filter(reminder =>
    showCompleted ? true : !reminder.isComplete
  );

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-1 text-gray-800">Smart Calendar & Reminders</h3>
      <p className="text-sm text-gray-600 mb-4">
        Manage your gardening tasks and get timely reminders.
      </p>

      <form onSubmit={handleAddReminder} className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="New task (e.g., Water Tomatoes)"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-grow text-sm"
            aria-label="New task description"
          />
          <Input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="text-sm sm:w-auto"
            aria-label="Task due date"
          />
        </div>
        <Button type="submit" className="mt-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3">
          <PlusCircle size={16} className="mr-1.5" /> Add Reminder
        </Button>
      </form>

      <div className="mb-3 flex justify-end items-center">
        <label htmlFor="showCompletedToggle" className="text-sm text-gray-600 mr-2 select-none">
          Show Completed:
        </label>
        <Checkbox
          id="showCompletedToggle"
          checked={showCompleted}
          onCheckedChange={() => setShowCompleted(!showCompleted)}
          aria-label="Toggle visibility of completed tasks"
        />
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 min-h-[150px] pr-1">
        {filteredReminders.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            {remindersList.length > 0 ? "All tasks hidden or completed!" : "No reminders yet. Add some tasks!"}
          </p>
        ) : (
          filteredReminders.map(reminder => (
            <div
              key={reminder.id}
              className={`p-2.5 border rounded-md flex items-center justify-between transition-all ${
                reminder.isComplete ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Checkbox
                  id={`reminder-${reminder.id}`}
                  checked={reminder.isComplete}
                  onCheckedChange={() => handleToggleComplete(reminder.id)}
                  className="mr-3"
                  aria-labelledby={`task-desc-${reminder.id}`}
                />
                <div>
                  <p
                    id={`task-desc-${reminder.id}`}
                    className={`text-sm font-medium ${
                      reminder.isComplete ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {reminder.task}
                  </p>
                  <p className={`text-xs ${reminder.isComplete ? 'text-gray-400' : 'text-gray-600'}`}>
                    <CalendarDays size={12} className="inline mr-1" />
                    Due: {new Date(reminder.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteReminder(reminder.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5"
                aria-label={`Delete task: ${reminder.task}`}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
      {remindersList.length > 0 && (
         <p className="mt-2 text-xs text-gray-400 text-center">
            {remindersList.filter(r => !r.isComplete).length} pending tasks.
        </p>
      )}
    </div>
  );
}
