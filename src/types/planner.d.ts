export interface PlannerData {
  userId: string;
  location: {
    lat: number | null; // Allow null if not available initially
    lon: number | null; // Allow null if not available initially
    address?: string; // Address might be optional if using lat/lon primarily
    climateZone: string;
  };
  space: string; // e.g., "balcony", "garden", "indoor"
  sunlight: string; // e.g., "full", "partial", "shade"
  purpose: string[]; // e.g., ["herbs", "vegetables", "flowers"]
  experience: string; // e.g., "beginner", "intermediate", "expert"
  timeCommitment: string; // e.g., "low", "medium", "high"
  createdAt: string; // ISO date string
}
