export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  climateZones: string[];
  lightRequirements: 'full' | 'partial' | 'shade';
  difficultyLevel: 'beginner' | 'intermediate' | 'expert';
  growingSeason: {
    start: number; // Month (1-12)
    end: number; // Month (1-12)
  };
  spaceRequirements: {
    minHeight: number; // in cm
    minWidth: number; // in cm
    containerFriendly: boolean;
  };
  careInstructions: {
    watering: string;
    soil: string;
    temperature: string;
    humidity: string;
  };
  harvestTime: {
    min: number; // in days
    max: number; // in days
  };
  companionPlants: string[];
  imageUrl: string;
}

export interface PlantRecommendation {
  plant: Plant;
  matchScore: number;
  matchReasons: string[];
}

export interface PlantRecommendationFilters {
  climateZone: string;
  lightRequirements: string;
  experienceLevel: string;
  currentMonth: number;
  hemisphere: 'north' | 'south';
  spaceConstraints: {
    maxHeight?: number;
    maxWidth?: number;
    containerOnly?: boolean;
  };
} 