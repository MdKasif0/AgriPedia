export type GrowthStage = 
  | 'Germination'
  | 'Seedling'
  | 'Vegetative'
  | 'Flowering'
  | 'Fruiting'
  | 'Harvest'
  | 'Dormant';

export type PlantMood = 
  | 'Thriving'
  | 'Growing'
  | 'Struggling'
  | 'Wilting'
  | 'Recovering';

export type UserMood = 
  | 'Excited'
  | 'Happy'
  | 'Hopeful'
  | 'Concerned'
  | 'Frustrated';

export interface WeatherInfo {
  temperature: string;
  humidity: string;
  condition: string;
}

export interface JournalEntry {
  entry_id: string;
  user_id: string;
  plant_id: string;
  date: string;
  growth_stage: GrowthStage;
  note: string;
  photos: string[];
  weather_info: WeatherInfo;
  task_summary: string[];
  user_mood: UserMood;
  plant_mood: PlantMood;
  health_status: string;
  next_action_suggestion?: string;
  plant_nickname?: string;
  height?: number;
  sunlight_hours?: number;
  is_offline?: boolean;
  is_pending_upload?: boolean;
}

export interface GrowthAnalytics {
  days_per_stage: Record<GrowthStage, number>;
  watering_frequency: number;
  height_progress: { date: string; height: number }[];
  sunlight_log: { date: string; hours: number }[];
}

export interface AIInsight {
  summary: string;
  growth_rate: 'ahead' | 'normal' | 'behind';
  health_assessment: string;
  suggestions: string[];
} 