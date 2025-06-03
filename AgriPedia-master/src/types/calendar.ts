export type TaskType = 'water' | 'fertilize' | 'harvest' | 'prune' | 'check' | 'other';
export type TaskImportance = 'low' | 'medium' | 'high' | 'critical';
export type ReminderTime = 'morning' | 'afternoon' | 'evening' | 'custom';
export type ReminderTone = 'friendly' | 'strict' | 'scientific';

export interface GrowTask {
  id: string;
  plantId: string;
  plantName: string;
  taskType: TaskType;
  date: string;
  repeat?: string;
  importance: TaskImportance;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  stage?: string;
}

export interface ReminderSettings {
  reminderTime: ReminderTime;
  customTime?: string;
  tone: ReminderTone;
  enabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  disabledTasks: TaskType[];
}

export interface TaskStreak {
  plantId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompleted: string;
  badges: string[];
}

export interface CalendarState {
  tasks: GrowTask[];
  settings: ReminderSettings;
  streaks: Record<string, TaskStreak>;
  lastSynced: string;
} 