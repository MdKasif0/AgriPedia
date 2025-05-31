import { StoredPlannerData } from './userDataStore';
import { ProduceInfo } from './produceData';

// Helper function to get current month name
const getCurrentMonthName = (): string => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const d = new Date();
  return monthNames[d.getMonth()];
};

export const getPlantRecommendations = (
  plannerData: StoredPlannerData,
  allPlants: ProduceInfo[]
): ProduceInfo[] => {
  if (!plannerData || !allPlants) {
    return [];
  }

  const currentMonth = getCurrentMonthName();

  // Define skill level hierarchy for filtering
  const skillHierarchy: { [key: string]: number } = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  const userSkillLevel = skillHierarchy[plannerData.experience] || 0;

  const recommendations = allPlants.filter(plant => {
    // 1. Climate Zone Filter
    // For now, simple string match. Assumes plannerData.location.climateZone is populated.
    // Making it case-insensitive and handling undefined.
    const plantClimateZone = plant.climateZone?.toLowerCase();
    const plannerClimateZone = plannerData.location.climateZone?.toLowerCase();
    if (plannerClimateZone && plantClimateZone && plantClimateZone !== plannerClimateZone) {
      // If planner has a climate zone and plant has one, and they don't match, filter out.
      // If plant has no climate zone specified, it might be adaptable, so we don't filter it out here.
      // This could be refined: if plannerClimateZone is set, then plant.climateZone MUST match or be undefined (or a "universal" zone).
      // For now, if plannerClimateZone is set, plant.climateZone must also be set and match.
      return false;
    }
    // A more robust approach would be to check if plant.regions contains a region compatible with plannerClimateZone

    // 2. Sunlight Filter
    if (plannerData.sunlight && plant.sunlight && plant.sunlight !== plannerData.sunlight) {
      return false;
    }

    // 3. Skill Level Filter (Experience)
    // User can handle plants at or below their skill level.
    // For this iteration, we do a direct match as requested initially for simplicity.
    // The prompt said: "For now, let's do a direct match: plant.skillLevel === plannerData.experience"
    // However, the note "Growth difficulty <= beginner" implies a hierarchy.
    // I will implement the direct match for now as per the specific instruction for this step.
    if (plannerData.experience && plant.skillLevel && plant.skillLevel !== plannerData.experience) {
       return false;
    }
    // Refined hierarchical filtering (can be enabled later):
    // const plantSkill = skillHierarchy[plant.skillLevel || ''] || 4; // Default to higher if undefined
    // if (userSkillLevel < plantSkill) {
    //  return false;
    // }


    // 4. Space Type Filter
    if (plannerData.space && plant.spaceTypes && !plant.spaceTypes.includes(plannerData.space)) {
      return false;
    }

    // 5. Current Planting Window Filter
    // Only apply this filter if the plant has plantingMonths defined.
    // If plant.plantingMonths is undefined, we assume it's not strictly seasonal or data is missing, so we don't filter it out.
    if (plant.plantingMonths && plant.plantingMonths.length > 0) {
      if (!plant.plantingMonths.includes(currentMonth)) {
        return false;
      }
    }

    return true;
  });

  return recommendations;
};
