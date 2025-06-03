export interface GrowingStage {
  stage: 'Planting' | 'Germination' | 'Growing' | 'Harvesting';
  duration_days: number;
  instructions: string[];
  media?: {
    images?: string[];
    video?: string;
  };
  tools_needed?: string[];
  tips?: string[];
  reminders?: string[];
  warnings?: string[];
  trivia?: string[];
}

export interface GrowingGuide {
  plant_id: string;
  common_name: string;
  scientific_name: string;
  growing_guide: GrowingStage[];
  customizations?: {
    location?: string;
    space?: string;
    skill_level?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface StageProgress {
  stage: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  photos?: string[];
}

export interface PlantProgress {
  plant_id: string;
  start_date: string;
  current_stage: number;
  stages: StageProgress[];
  last_updated: string;
} 