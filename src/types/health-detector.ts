export type HealthStatus = 'healthy' | 'warning' | 'urgent';

export type HealthIssue = 
  | 'nutrient_deficiency'
  | 'pest_infestation'
  | 'fungal_disease'
  | 'bacterial_disease'
  | 'drought_stress'
  | 'other';

export interface HealthDetection {
  status: HealthStatus;
  issue: HealthIssue;
  confidence: number;
  description: string;
  affectedAreas: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  recommendations: {
    immediate: string[];
    preventive: string[];
  };
  relatedArticles?: string[];
}

export interface ScanResult {
  id: string;
  timestamp: string;
  imageUrl: string;
  plantId?: string;
  detection: HealthDetection;
  userFeedback?: {
    isCorrect: boolean;
    suggestedIssue?: HealthIssue;
    notes?: string;
  };
  isQueued?: boolean;
  isProcessed?: boolean;
}

export interface CameraSettings {
  mode: 'leaf' | 'whole_plant';
  flash: boolean;
  camera: 'front' | 'rear';
  autoCrop: boolean;
} 