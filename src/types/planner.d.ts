export interface PlannerData {
  userId: string;
  location: {
    lat: number | null; // Allow null if not available initially
    lon: number | null; // Allow null if not available initially
    address?: string; // Address might be optional if using lat/lon primarily
    climateZone: string;
    simplifiedClimate?: string; // Added for broader climate category
  };
  space: string; // e.g., "balcony", "garden", "indoor"
  sunlight: string; // e.g., "full", "partial", "shade"
  purpose: string[]; // e.g., ["herbs", "vegetables", "flowers"]
  experience: string; // e.g., "beginner", "intermediate", "expert"
  timeCommitment: string; // e.g., "low", "medium", "high"
  createdAt: string; // ISO date string
}

// Props for individual step components used in both PlannerPage and PersonalizedGrowPlanner
export interface StepProps {
  // `data` is the current accumulated state of the entire planner
  data: Partial<PlannerData>;
  // `onDataChange` is called by the step component to update parts of the PlannerData
  onDataChange: (updatedData: Partial<PlannerData>) => void;
  // Optional: if steps need to trigger full navigation themselves, not used by current step components
  // onNext?: () => void;
  // onBack?: () => void;
}
