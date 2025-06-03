import { Plant } from '@/types/plant';

// Import all plant data
import medicinalPlants from './data/medicinalAndAromaticPlants';
import herbsAndSpices from './data/herbsAndSpices';
import fruits from './data/fruits';
import vegetables from './data/vegetables';
import tuberAndRootCrops from './data/tuberAndRootCrops';
import cashCrops from './data/cashCrops';

// Combine all plant data
const allPlants: Plant[] = [
  ...Object.values(medicinalPlants),
  ...Object.values(herbsAndSpices),
  ...Object.values(fruits),
  ...Object.values(vegetables),
  ...Object.values(tuberAndRootCrops),
  ...Object.values(cashCrops),
];

export async function getAllPlants(): Promise<Plant[]> {
  return allPlants;
}

export async function getPlantsByClimate(climateZone: string): Promise<Plant[]> {
  return allPlants.filter(plant => 
    plant.climaticRequirements?.temperature.toLowerCase().includes(climateZone.toLowerCase())
  );
}

export async function getPlantsByLightRequirements(lightLevel: string): Promise<Plant[]> {
  return allPlants.filter(plant => 
    plant.climaticRequirements?.temperature.toLowerCase().includes(lightLevel.toLowerCase())
  );
}

export async function getPlantsBySpace(space: string): Promise<Plant[]> {
  return allPlants.filter(plant => 
    plant.climaticRequirements?.temperature.toLowerCase().includes(space.toLowerCase())
  );
}

export async function getPlantsByExperience(experience: string): Promise<Plant[]> {
  return allPlants.filter(plant => 
    plant.climaticRequirements?.temperature.toLowerCase().includes(experience.toLowerCase())
  );
}

export async function getPlantsByPurpose(purpose: string[]): Promise<Plant[]> {
  return allPlants.filter(plant =>
    purpose.some(p => plant.uses?.some(use => use.toLowerCase().includes(p.toLowerCase())))
  );
}

export async function getPlantsByTimeCommitment(timeCommitment: string): Promise<Plant[]> {
  return allPlants.filter(plant => 
    plant.climaticRequirements?.temperature.toLowerCase().includes(timeCommitment.toLowerCase())
  );
}

// Helper function to calculate plant compatibility score
export function calculatePlantCompatibilityScore(plant: Plant, preferences: any): number {
  let score = 0;

  // Climate compatibility
  if (plant.climaticRequirements?.temperature.toLowerCase().includes(preferences.location.climateZone.toLowerCase())) {
    score += 2;
  }

  // Light requirements
  if (plant.climaticRequirements?.temperature.toLowerCase().includes(preferences.sunlight.toLowerCase())) {
    score += 2;
  }

  // Space suitability
  if (plant.climaticRequirements?.temperature.toLowerCase().includes(preferences.space.toLowerCase())) {
    score += 2;
  }

  // Experience level
  if (plant.climaticRequirements?.temperature.toLowerCase().includes(preferences.experience.toLowerCase())) {
    score += 2;
  }

  // Purpose match
  const purposeMatches = preferences.purpose.filter((p: string) =>
    plant.uses?.some(use => use.toLowerCase().includes(p.toLowerCase()))
  );
  score += purposeMatches.length;

  // Time commitment
  if (plant.climaticRequirements?.temperature.toLowerCase().includes(preferences.timeCommitment.toLowerCase())) {
    score += 2;
  }

  return score;
} 