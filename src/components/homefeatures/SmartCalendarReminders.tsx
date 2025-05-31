'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea is available
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Assuming Dialog components
import { PlusCircle, Trash2 } from 'lucide-react';
// For date manipulation, a library like date-fns would be ideal, but for simplicity, using native Date
// import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isEqual, parseISO } from 'date-fns';

// Basic date utilities (can be replaced with date-fns later)
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
const formatDateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
const parseYYYYMMDDToDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Interface now imported from userDataStore
import type { CalendarEvent } from '@/lib/userDataStore';
import { getCalendarEvents, addCalendarEvent, removeCalendarEvent, updateCalendarEvent } from '@/lib/userDataStore';


const SmartCalendarReminders: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState(formatDateToYYYYMMDD(new Date()));

  // Load events on mount
  useEffect(() => {
    setEvents(getCalendarEvents());
  }, []);

  // Update newEventDate when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setNewEventDate(formatDateToYYYYMMDD(selectedDate));
    }
  }, [selectedDate]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-11

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 (Sun) - 6 (Sat)

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border p-2 h-24 opacity-50"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateToYYYYMMDD(date);
    const dayEvents = events.filter(e => e.date === dateStr);
    calendarDays.push(
      <div
        key={day}
        className={`border p-2 h-24 cursor-pointer hover:bg-muted/50 ${selectedDate && formatDateToYYYYMMDD(selectedDate) === dateStr ? 'bg-primary/20 ring-2 ring-primary' : ''}`}
        onClick={() => {
          setSelectedDate(date);
          setNewEventDate(dateStr);
        }}
      >
        <span className="font-medium">{day}</span>
        <div className="mt-1 space-y-0.5 overflow-y-auto max-h-16 text-xs">
          {dayEvents.map(event => (
            <div key={event.id} className="bg-blue-500/20 text-blue-700 p-0.5 rounded-sm truncate" title={event.title}>
              {event.title}
            </div>
          ))}
          {/* Placeholder for auto-generated events */}
        </div>
      </div>
    );
  }

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !newEventDate.trim()) return;
    const newEvent: Omit<CalendarEvent, 'id'> = {
      date: newEventDate,
      title: newEventTitle,
      description: newEventDescription,
      type: 'custom', // Default type
    };
    const addedEvent = addCalendarEvent(newEvent);
    setEvents(prevEvents => [...prevEvents, addedEvent]);
    setIsModalOpen(false);
    setNewEventTitle('');
    setNewEventDescription('');
    // No need to reset newEventDate here if we want it to stick to the selectedDate
  };

  const handleDeleteEvent = (eventId: string) => {
    removeCalendarEvent(eventId);
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
  };

  // Memoize selectedDateEvents to avoid re-filtering on every render if events or selectedDate haven't changed.
  // This is a micro-optimization, but good practice.
  const selectedDateEvents = React.useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = formatDateToYYYYMMDD(selectedDate);
    return events.filter(e => e.date === dateStr);
  }, [events, selectedDate]);

  return (
    <div className="p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6 text-primary">Smart Calendar & Reminders</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar View */}
        <div className="flex-grow md:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>Previous</Button>
            <h3 className="text-xl font-medium">
              {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <Button variant="outline" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>Next</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-semibold text-center p-2 border-b">{day}</div>
            ))}
            {calendarDays}
          </div>
           <p className="text-xs text-muted-foreground mt-2">Note: This is a basic calendar display. Full functionality and styling will be improved.</p>
        </div>

        {/* Selected Date's Reminders & Add New */}
        <div className="md:w-1/3 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Tasks for: {selectedDate ? formatDateToYYYYMMDD(selectedDate) : 'Select a date'}
            </h3>
            {selectedDateEvents.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {selectedDateEvents.map(event => (
                  <li key={event.id} className="p-3 bg-muted/50 rounded-md text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                        <p className="text-xs text-gray-500 capitalize">Type: {event.type} {event.plantId ? `(Plant: ${event.plantId})` : ''}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks for this date.</p>
            )}
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full">
            <PlusCircle size={18} className="mr-2" /> Add New Reminder
          </Button>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-700 text-sm">Upcoming Feature:</h4>
            <p className="text-xs text-blue-600">Automatically generated schedules based on your plants and local conditions will appear here and on the calendar.</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="eventDate">Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="eventTitle">Title</Label>
              <Input
                id="eventTitle"
                placeholder="e.g., Water the tomatoes"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="eventDescription">Description (Optional)</Label>
              <Textarea
                id="eventDescription"
                placeholder="e.g., Check soil moisture, add nutrients"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddEvent}>Add Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartCalendarReminders;
