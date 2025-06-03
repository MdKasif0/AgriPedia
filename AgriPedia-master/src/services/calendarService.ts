import { addDays, format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { GrowTask, TaskType, CalendarState, ReminderSettings } from '@/types/calendar';
import { GrowingGuide } from '@/types/growingGuide';
import { getGrowSuggestions } from './aiService';

const STORAGE_KEY = 'ecogrow_calendar';

// Default reminder settings
const defaultSettings: ReminderSettings = {
  reminderTime: 'morning',
  tone: 'friendly',
  enabled: true,
  pushNotifications: true,
  emailNotifications: false,
  disabledTasks: [],
};

// Task type configurations
const taskConfigs: Record<TaskType, { repeat: string; importance: 'low' | 'medium' | 'high' | 'critical' }> = {
  water: { repeat: 'every 3 days', importance: 'high' },
  fertilize: { repeat: 'every 7 days', importance: 'medium' },
  harvest: { repeat: 'once', importance: 'critical' },
  prune: { repeat: 'every 14 days', importance: 'medium' },
  check: { repeat: 'every 2 days', importance: 'low' },
  other: { repeat: 'once', importance: 'low' },
};

export function initializeCalendar(): CalendarState {
  return {
    tasks: [],
    settings: defaultSettings,
    streaks: {},
    lastSynced: new Date().toISOString(),
  };
}

export function loadCalendar(): CalendarState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return initializeCalendar();
  }
  return JSON.parse(stored);
}

export function saveCalendar(state: CalendarState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function generateTasks(
  plantId: string,
  plantName: string,
  guide: GrowingGuide,
  startDate: Date
): Promise<GrowTask[]> {
  const tasks: GrowTask[] = [];
  let currentDate = startDate;

  // Generate tasks for each stage
  for (const stage of guide.growing_guide) {
    const stageEndDate = addDays(currentDate, stage.duration_days);

    // Add stage-specific tasks
    if (stage.stage === 'Planting') {
      tasks.push({
        id: uuidv4(),
        plantId,
        plantName,
        taskType: 'water',
        date: format(currentDate, 'yyyy-MM-dd'),
        repeat: taskConfigs.water.repeat,
        importance: taskConfigs.water.importance,
        notes: 'Initial watering after planting',
        completed: false,
        stage: stage.stage,
      });
    }

    // Add regular maintenance tasks
    while (currentDate < stageEndDate) {
      // Watering task
      tasks.push({
        id: uuidv4(),
        plantId,
        plantName,
        taskType: 'water',
        date: format(currentDate, 'yyyy-MM-dd'),
        repeat: taskConfigs.water.repeat,
        importance: taskConfigs.water.importance,
        completed: false,
        stage: stage.stage,
      });

      // Fertilizing task (every 7 days)
      if (currentDate.getDate() % 7 === 0) {
        tasks.push({
          id: uuidv4(),
          plantId,
          plantName,
          taskType: 'fertilize',
          date: format(currentDate, 'yyyy-MM-dd'),
          repeat: taskConfigs.fertilize.repeat,
          importance: taskConfigs.fertilize.importance,
          completed: false,
          stage: stage.stage,
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    // Add stage completion check
    tasks.push({
      id: uuidv4(),
      plantId,
      plantName,
      taskType: 'check',
      date: format(stageEndDate, 'yyyy-MM-dd'),
      importance: 'high',
      notes: `Check ${stage.stage} stage completion`,
      completed: false,
      stage: stage.stage,
    });
  }

  // Add harvesting task if applicable
  if (guide.growing_guide.some(stage => stage.stage === 'Harvesting')) {
    const harvestStage = guide.growing_guide.find(stage => stage.stage === 'Harvesting');
    if (harvestStage) {
      tasks.push({
        id: uuidv4(),
        plantId,
        plantName,
        taskType: 'harvest',
        date: format(addDays(startDate, harvestStage.duration_days), 'yyyy-MM-dd'),
        importance: 'critical',
        notes: 'Harvest your plant',
        completed: false,
        stage: 'Harvesting',
      });
    }
  }

  // Get AI suggestions for task adjustments
  try {
    const suggestions = await getGrowSuggestions(
      'current location',
      'beginner',
      'indoor',
      `Generate care schedule for ${plantName}`
    );

    // Apply AI suggestions to tasks
    // This is a placeholder for actual AI integration
    console.log('AI suggestions:', suggestions);
  } catch (error) {
    console.error('Failed to get AI suggestions:', error);
  }

  return tasks;
}

export function updateTask(taskId: string, updates: Partial<GrowTask>): void {
  const state = loadCalendar();
  const taskIndex = state.tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex !== -1) {
    state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
    saveCalendar(state);
  }
}

export function getTasksForDate(date: string): GrowTask[] {
  const state = loadCalendar();
  return state.tasks.filter(task => task.date === date);
}

export function getUpcomingTasks(days: number = 7): GrowTask[] {
  const state = loadCalendar();
  const today = new Date();
  const endDate = addDays(today, days);
  
  return state.tasks.filter(task => {
    const taskDate = parseISO(task.date);
    return taskDate >= today && taskDate <= endDate && !task.completed;
  });
}

export function getOverdueTasks(): GrowTask[] {
  const state = loadCalendar();
  const today = new Date();
  
  return state.tasks.filter(task => {
    const taskDate = parseISO(task.date);
    return taskDate < today && !task.completed;
  });
}

export function updateReminderSettings(settings: Partial<ReminderSettings>): void {
  const state = loadCalendar();
  state.settings = { ...state.settings, ...settings };
  saveCalendar(state);
}

export function getTaskStreak(plantId: string): number {
  const state = loadCalendar();
  return state.streaks[plantId]?.currentStreak || 0;
}

export function updateTaskStreak(plantId: string, completed: boolean): void {
  const state = loadCalendar();
  const streak = state.streaks[plantId] || {
    plantId,
    currentStreak: 0,
    longestStreak: 0,
    lastCompleted: '',
    badges: [],
  };

  if (completed) {
    streak.currentStreak++;
    streak.lastCompleted = new Date().toISOString();
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  } else {
    streak.currentStreak = 0;
  }

  state.streaks[plantId] = streak;
  saveCalendar(state);
} 