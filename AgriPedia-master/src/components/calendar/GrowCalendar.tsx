import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { GrowTask, TaskType } from '@/types/calendar';
import { getTasksForDate, getUpcomingTasks, updateTask } from '@/services/calendarService';
import { motion } from 'framer-motion';
import { FiWater, FiScissors, FiCheck, FiAlertCircle } from 'react-icons/fi';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const taskTypeIcons: Record<TaskType, React.ReactNode> = {
  water: <FiWater className="text-blue-500" />,
  fertilize: <FiWater className="text-green-500" />,
  harvest: <FiScissors className="text-yellow-500" />,
  prune: <FiScissors className="text-purple-500" />,
  check: <FiCheck className="text-gray-500" />,
  other: <FiAlertCircle className="text-gray-500" />,
};

const taskTypeColors: Record<TaskType, string> = {
  water: 'bg-blue-100 border-blue-500',
  fertilize: 'bg-green-100 border-green-500',
  harvest: 'bg-yellow-100 border-yellow-500',
  prune: 'bg-purple-100 border-purple-500',
  check: 'bg-gray-100 border-gray-500',
  other: 'bg-gray-100 border-gray-500',
};

export default function GrowCalendar() {
  const [tasks, setTasks] = useState<GrowTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filter, setFilter] = useState<TaskType | 'all'>('all');

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  const loadTasks = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const tasksForDate = getTasksForDate(dateStr);
    setTasks(tasksForDate);
  };

  const handleTaskComplete = (taskId: string) => {
    updateTask(taskId, { completed: true, completedAt: new Date().toISOString() });
    loadTasks();
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.taskType === filter);

  const events = filteredTasks.map(task => ({
    id: task.id,
    title: `${task.plantName} - ${task.taskType}`,
    start: new Date(task.date),
    end: new Date(task.date),
    resource: task,
  }));

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Grow Calendar</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskType | 'all')}
            className="p-2 border rounded"
          >
            <option value="all">All Tasks</option>
            <option value="water">Watering</option>
            <option value="fertilize">Fertilizing</option>
            <option value="harvest">Harvesting</option>
            <option value="prune">Pruning</option>
            <option value="check">Checks</option>
            <option value="other">Other</option>
          </select>
          <select
            value={view}
            onChange={(e) => setView(e.target.value as 'month' | 'week' | 'day')}
            className="p-2 border rounded"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectEvent={(event) => {
            const task = event.resource as GrowTask;
            handleTaskComplete(task.id);
          }}
          eventPropGetter={(event) => {
            const task = event.resource as GrowTask;
            return {
              className: `border-l-4 ${taskTypeColors[task.taskType]}`,
            };
          }}
          components={{
            event: ({ event }) => {
              const task = event.resource as GrowTask;
              return (
                <div className="p-1">
                  <div className="flex items-center gap-1">
                    {taskTypeIcons[task.taskType]}
                    <span className="text-sm font-medium">{task.plantName}</span>
                  </div>
                  <div className="text-xs text-gray-600">{task.taskType}</div>
                </div>
              );
            },
          }}
        />
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Today's Tasks</h3>
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border-l-4 ${taskTypeColors[task.taskType]} ${
                task.completed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {taskTypeIcons[task.taskType]}
                  <div>
                    <div className="font-medium">{task.plantName}</div>
                    <div className="text-sm text-gray-600">{task.taskType}</div>
                  </div>
                </div>
                {!task.completed && (
                  <button
                    onClick={() => handleTaskComplete(task.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Complete
                  </button>
                )}
              </div>
              {task.notes && (
                <div className="mt-2 text-sm text-gray-600">{task.notes}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 