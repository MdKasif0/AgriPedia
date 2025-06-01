import { defineFlow } from '@genkit-ai/flow';
import * as z from 'zod';
import { PlannerDataSchema } from '@/types/planner.schema';
import { promises as fs } from 'fs';
import path from 'path';
import { PlantDataSchema, PlantData } from '@/types/plant.schema'; // Import PlantData type

const PLANT_DATA_DIR = path.join(process.cwd(), 'src', 'lib', 'data');

async function getAllPlantData(): Promise<PlantData[]> { // Return type PlantData[]
  const allPlants: PlantData[] = [];
  const categories = await fs.readdir(PLANT_DATA_DIR);

  for (const category of categories) {
    const categoryPath = path.join(PLANT_DATA_DIR, category);
    if (!category.startsWith('.')) { // Ignore hidden folders like .DS_Store
        const stats = await fs.stat(categoryPath);
        if (stats.isDirectory()) {
            const files = await fs.readdir(categoryPath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(categoryPath, file);
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    try {
                        const plantJson = JSON.parse(fileContent);
                        const validationResult = PlantDataSchema.safeParse(plantJson);
                        if (validationResult.success) {
                            allPlants.push(validationResult.data);
                        } else {
                            console.warn(`Warning: Invalid plant data structure in ${file}:`, validationResult.error.issues);
                        }
                    } catch (e) {
                        console.error(`Error parsing JSON from ${file}:`, e);
                    }
                }
            }
        }
    }
  }
  return allPlants;
}

export const recommendPlantsFlow = defineFlow(
  {
    name: 'recommendPlantsFlow',
    inputSchema: PlannerDataSchema,
    outputSchema: z.array(z.string()), // Array of plant IDs
  },
  async (plannerData) => {
    console.log('Received planner data for recommendation:', plannerData);
    const allPlants = await getAllPlantData();
    const recommendedPlantIds: string[] = [];

    const currentMonth = new Date().getMonth() + 1; // 1-12 for Jan-Dec
    let hemisphere = 'N'; // Default to Northern
    if (plannerData.location?.lat && plannerData.location.lat < 0) {
      hemisphere = 'S';
    }

    console.log(`Filtering for: Month ${currentMonth}, Hemisphere ${hemisphere}, Climate: ${plannerData.location?.climateZone}, Sunlight: ${plannerData.sunlight}, Experience: ${plannerData.experience}, Space: ${plannerData.space}`);

    for (const plant of allPlants) {
      let meetsAllHardCriteria = true;

      // 1. Climate Zone Compatibility (Hard Filter)
      if (plannerData.location?.climateZone && plant.climaticRequirements?.temperature) {
        if (!plant.climaticRequirements.temperature.toLowerCase().includes(plannerData.location.climateZone.toLowerCase())) {
          meetsAllHardCriteria = false;
        }
      } else if (plannerData.location?.climateZone) {
        meetsAllHardCriteria = false;
      }
      if (!meetsAllHardCriteria) { /* console.log(`Plant ${plant.id} (${plant.commonName}) failed climate zone: Plant has "${plant.climaticRequirements?.temperature}", user wants "${plannerData.location?.climateZone}"`); */ continue; }

      // 2. Light Requirements (Hard Filter using new plant.lightRequirement field)
      if (plannerData.sunlight && plant.lightRequirement) {
        let plannerSunlightNormalized = plannerData.sunlight.toLowerCase();
        if (plannerSunlightNormalized.includes('full')) plannerSunlightNormalized = 'full_sun';
        else if (plannerSunlightNormalized.includes('partial')) plannerSunlightNormalized = 'partial_shade';
        else if (plannerSunlightNormalized.includes('shade')) plannerSunlightNormalized = 'shade';

        if (plant.lightRequirement !== plannerSunlightNormalized && plant.lightRequirement !== 'adaptable') {
          meetsAllHardCriteria = false;
        }
      } else if (plannerData.sunlight && !plant.lightRequirement) {
         meetsAllHardCriteria = false;
      }
      if (!meetsAllHardCriteria) { /* console.log(`Plant ${plant.id} (${plant.commonName}) failed light requirement: Plant has "${plant.lightRequirement}", user wants "${plannerData.sunlight}"`); */ continue; }

      // 3. Experience Level (Hard Filter using new plant.experienceLevel field)
      if (plannerData.experience && plant.experienceLevel) {
        const userExp = plannerData.experience.toLowerCase();
        const plantExp = plant.experienceLevel.toLowerCase();

        if (userExp === 'beginner' && (plantExp === 'intermediate' || plantExp === 'expert')) {
          meetsAllHardCriteria = false;
        } else if (userExp === 'intermediate' && plantExp === 'expert') {
          meetsAllHardCriteria = false;
        }
      } else if (plannerData.experience && !plant.experienceLevel) {
        meetsAllHardCriteria = false;
      }
      if (!meetsAllHardCriteria) { /* console.log(`Plant ${plant.id} (${plant.commonName}) failed experience level: Plant is "${plant.experienceLevel}", user is "${plannerData.experience}"`); */ continue; }

      // 4. Planting Window (Soft Filter - improved)
      let plantingWindowMatch = false;
      if (plant.seasons && plant.seasons.length > 0) {
        const currentSeason = getCurrentSeason(currentMonth, hemisphere);
        if (plant.seasons.some(s => s.toLowerCase().includes(currentSeason.toLowerCase()))) {
            plantingWindowMatch = true;
        }
        // Fallback: check if any season is "year-round" or similar
        if (!plantingWindowMatch && plant.seasons.some(s => s.toLowerCase().includes('year-round') || s.toLowerCase().includes('all season'))) {
            plantingWindowMatch = true;
        }
      } else {
        plantingWindowMatch = true; // If no seasons specified, assume it's flexible or data missing
      }
      if (!plantingWindowMatch) { /* console.log(`Plant ${plant.id} (${plant.commonName}) failed planting window: Plant seasons "${plant.seasons?.join(', ')}", current season "${getCurrentSeason(currentMonth, hemisphere)}"`); */ continue; } // Made it a hard filter

      // 5. Space Suitability (Hard Filter using new plant.spaceSuitability array)
      if (plannerData.space && plant.spaceSuitability && plant.spaceSuitability.length > 0) {
        let userSpaceNormalized = '';
        const spaceLower = plannerData.space.toLowerCase();
        if (spaceLower.includes('balcony') || spaceLower.includes('pots') || spaceLower.includes('container')) {
            userSpaceNormalized = 'balcony_pots';
        } else if (spaceLower.includes('indoor') || spaceLower.includes('windowsill')) {
            userSpaceNormalized = 'indoor';
        } else if (spaceLower.includes('garden') || spaceLower.includes('outdoor') || spaceLower.includes('yard')) {
            userSpaceNormalized = 'garden';
        }

        if (userSpaceNormalized && !plant.spaceSuitability.includes(userSpaceNormalized as any)) {
          meetsAllHardCriteria = false;
        }
      } else if (plannerData.space && (!plant.spaceSuitability || plant.spaceSuitability.length === 0)) {
        meetsAllHardCriteria = false;
      }
      if (!meetsAllHardCriteria) { /* console.log(`Plant ${plant.id} (${plant.commonName}) failed space suitability: Plant allows "${plant.spaceSuitability?.join(', ')}", user wants "${plannerData.space}"`); */ continue; }

      if (meetsAllHardCriteria) {
        recommendedPlantIds.push(plant.id);
      }
    }

    console.log(`Found ${recommendedPlantIds.length} recommended plant IDs after filtering:`, recommendedPlantIds);
    return recommendedPlantIds.slice(0, 15);
  }
);

// Helper function to determine season based on month and hemisphere
function getCurrentSeason(month: number, hemisphere: 'N' | 'S'): string {
    if (hemisphere === 'N') {
        if (month >= 3 && month <= 5) return 'Spring';
        if (month >= 6 && month <= 8) return 'Summer';
        if (month >= 9 && month <= 11) return 'Autumn';
        return 'Winter'; // Dec, Jan, Feb
    } else { // Southern Hemisphere
        if (month >= 9 && month <= 11) return 'Spring';
        if (month === 12 || month <= 2) return 'Summer';
        if (month >= 3 && month <= 5) return 'Autumn';
        return 'Winter'; // June, July, August
    }
}
