// src/types/growPlanner.ts

export interface LocationData {
  lat?: number;
  lon?: number;
  address?: string; // For manually entered address
  climateZone?: string; // e.g., Temperate, Tropical, Arid, Continental, Polar
}

export interface GrowPlannerData {
  userId?: string; // Optional: if you have user accounts
  location: LocationData;
  space: 'indoor' | 'balcony' | 'small_yard' | 'large_garden' | 'greenhouse';
  spaceDimensions?: {
    length?: number;
    width?: number;
    unit?: 'meters' | 'feet';
  };
  sunlight: 'low' | 'partial' | 'full'; // low: <3 hrs, partial: 3-6 hrs, full: >6 hrs direct sun
  purpose: ('vegetables' | 'herbs' | 'fruits' | 'flowers' | 'medicinal' | 'pet_safe')[];
  timeCommitment: 'low' | 'medium' | 'high'; // low: <2 hrs/week, medium: 2-5 hrs/week, high: >5hrs/week
  experience: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string; // ISO date string
  planId?: string; // Optional: if multiple plans are stored
  customName?: string; // Optional: e.g., "My Summer Veggie Patch"
}

// Interface for individual plant data, extending existing fields if necessary
// This assumes you might have a base Plant type already.
// For now, defining key fields needed for the planner.
export interface PlantData {
  id: string;
  commonName: string;
  scientificName: string;
  image?: string;
  description?: string;
  origin?: string;
  localNames?: string[];
  regions?: string[]; // Regions where it's commonly grown
  seasons?: string[]; // Natural growing seasons

  // Fields crucial for the Grow Planner
  climateZone: string[]; // Array of compatible climate zones (e.g., ["Temperate", "Subtropical"])
  sunlightRequirement: 'low' | 'partial' | 'full'; // Plant's light needs
  waterNeeds?: 'low' | 'medium' | 'high'; // Added for care requirements
  soilType?: string[]; // E.g., ["loamy", "sandy", "clay"], "well-drained"
  spaceType: ('container_friendly' | 'ground_cover' | 'climber' | 'small_bush' | 'large_tree' | 'any')[]; // How/where it grows
  skillLevel: 'beginner' | 'intermediate' | 'advanced'; // Difficulty
  plantingMonths: { // Planting months by hemisphere
    north: number[]; // Array of month numbers (1-12) for Northern Hemisphere
    south: number[]; // Array of month numbers (1-12) for Southern Hemisphere
  } | number[]; // Or a single array if hemisphere distinction isn't critical initially
  growthDuration: string; // E.g., "60-90 days", "1 year"
  daysToHarvest?: { min: number, max: number }; // More structured alternative

  // Existing fields (ensure consistency with your actual data)
  nutrition?: any; // Define further if needed
  healthBenefits?: string[];
  potentialAllergies?: any[];
  cultivationProcess?: string;
  sustainabilityTips?: string[];
  carbonFootprintInfo?: string;
  staticRecipes?: any[];

  // Fields for UI display in recommendation cards
  shortSummary?: string; // A brief tagline or summary
  isPetSafe?: boolean; // Specifically for pet-safe filter
  isIndoorFriendly?: boolean; // Specifically for indoor filter
}

// For user's saved grow plans
export interface UserGrowPlan {
  planId: string;
  name: string;
  plannerDataSnapshot: GrowPlannerData; // Snapshot of the planner settings for this plan
  plantIds: string[]; // IDs of plants added to this plan
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  notes?: string; // User's personal notes for this plan
}

export interface StagedGrowPlan {
  planId: string; // Could be a default ID like 'currentStagingPlan'
  customName?: string; // Optional name for this selection
  plantIds: string[];
  lastUpdatedAt: string;
}
