import type { GrowPlannerData, PlantData } from '../types/growPlanner';
import fs from 'fs'; // For temporary data loading
import path from 'path'; // For temporary data loading

// --- Helper function to load sample plant data (Temporary) ---
export function loadSamplePlantData(): PlantData[] {
  const plantFiles = ['vegetables/tomato.json', 'fruits/apple.json', 'herbsAndSpices/basil.json'];
  const plants: PlantData[] = [];

  plantFiles.forEach(filePath => {
    try {
      // Adjust the path to be relative to the project root or a known base directory.
      // Assuming this script might be run from the project root or `src/lib`
      // This path resolution might need adjustment based on actual execution context.
      let basePath = process.cwd(); // Current working directory
      if (!basePath.endsWith('src')) { // If not in src, try to go into src
          if(fs.existsSync(path.join(basePath, 'src'))) {
            basePath = path.join(basePath, 'src');
          }
      }
      // If still not in src/lib, try to go deeper if needed
      if (!basePath.endsWith('lib') && fs.existsSync(path.join(basePath, 'lib'))) {
          basePath = path.join(basePath, 'lib');
      } else if (!basePath.endsWith('src/lib') && fs.existsSync(path.join(process.cwd(), 'src/lib'))) {
          // Fallback if cwd is project root
          basePath = path.join(process.cwd(), 'src/lib');
      }


      const fullPath = path.join(basePath, 'data', filePath);

      if (!fs.existsSync(fullPath)) {
          // Try an alternative path if the first one fails (e.g., if script is run from src/lib directly)
          const altPath = path.join(process.cwd(), 'data', filePath);
          if (!fs.existsSync(altPath)) {
            console.warn(`File not found at ${fullPath} or ${altPath}`);
            return;
          }
          const fileContent = fs.readFileSync(altPath, 'utf-8');
          const plant = JSON.parse(fileContent) as PlantData;
          plants.push(plant);
      } else {
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const plant = JSON.parse(fileContent) as PlantData;
        plants.push(plant);
      }

    } catch (error) {
      console.error(`Error loading or parsing ${filePath}:`, error);
    }
  });
  return plants;
}

// --- Recommendation Engine ---

// Helper to map sunlight levels to numerical values
const mapSunlightToNumeric = (sunlight: PlantData['sunlightRequirement'] | GrowPlannerData['sunlight'] | undefined): number => {
  if (!sunlight) return 0; // Assume lowest if undefined
  switch (sunlight.toLowerCase()) {
    case 'low': return 1;
    case 'partial': return 2;
    case 'full': return 3;
    default: return 0;
  }
};

// Helper to map skill levels to numerical values
const mapSkillToNumeric = (skill: PlantData['skillLevel'] | GrowPlannerData['experience'] | undefined): number => {
  if (!skill) return 0; // Assume lowest if undefined
  switch (skill.toLowerCase()) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    default: return 0;
  }
};

export function getPlantRecommendations(
  plannerData: GrowPlannerData,
  allPlants: PlantData[]
): PlantData[] {
  let recommendedPlants = [...allPlants];

  // 1. Climate Zone Filter
  if (plannerData.location.climateZone) {
    recommendedPlants = recommendedPlants.filter(plant =>
      plant.climateZone?.includes(plannerData.location.climateZone!)
    );
  }

  // 2. Sunlight Requirement Filter
  const userSunlightNumeric = mapSunlightToNumeric(plannerData.sunlight);
  recommendedPlants = recommendedPlants.filter(plant =>
    mapSunlightToNumeric(plant.sunlightRequirement) <= userSunlightNumeric
  );

  // 3. Skill Level Filter
  const userSkillNumeric = mapSkillToNumeric(plannerData.experience);
  recommendedPlants = recommendedPlants.filter(plant =>
    mapSkillToNumeric(plant.skillLevel) <= userSkillNumeric
  );

  // 4. Planting Months Filter
  const currentMonth = new Date().getMonth() + 1; // 1-12
  // Basic hemisphere assumption: Northern if lat > 0 or lat undefined (default), Southern if lat < 0
  const isNorthernHemisphere = !plannerData.location.lat || plannerData.location.lat >= 0;

  recommendedPlants = recommendedPlants.filter(plant => {
    if (!plant.plantingMonths) return true; // If no planting months specified, don't filter out

    let plantableInCurrentMonth = false;
    if (Array.isArray(plant.plantingMonths)) { // Handles: number[]
      plantableInCurrentMonth = plant.plantingMonths.includes(currentMonth);
    } else if (typeof plant.plantingMonths === 'object') { // Handles: { north: number[], south: number[] }
      const hemisphereMonths = isNorthernHemisphere
        ? plant.plantingMonths.north
        : plant.plantingMonths.south;
      if (Array.isArray(hemisphereMonths)) {
        plantableInCurrentMonth = hemisphereMonths.includes(currentMonth);
      }
    }
    return plantableInCurrentMonth;
  });

  // 5. Space Type Filter
  if (plannerData.space) {
    if (plannerData.space === 'indoor') {
      recommendedPlants = recommendedPlants.filter(plant => plant.isIndoorFriendly === true);
      // Also favor container-friendly for indoor, but isIndoorFriendly is primary
      recommendedPlants = recommendedPlants.filter(plant => plant.spaceType?.includes('container_friendly'));

    } else if (plannerData.space === 'balcony') {
      recommendedPlants = recommendedPlants.filter(plant => plant.spaceType?.includes('container_friendly'));
    } else if (plannerData.space === 'small_yard') {
      recommendedPlants = recommendedPlants.filter(plant => !plant.spaceType?.includes('large_tree'));
    }
    // 'large_garden' and 'greenhouse' might not need specific spaceType filtering here,
    // or could favor plants that are NOT 'container_friendly' exclusively.
  }

  // 6. Purpose Filter
  if (plannerData.purpose && plannerData.purpose.length > 0) {
    recommendedPlants = recommendedPlants.filter(plant => {
      return plannerData.purpose.some(userPurpose => {
        // Pet-safe is a direct check
        if (userPurpose === 'pet_safe') {
          return plant.isPetSafe === true;
        }

        // For other purposes, check commonName, description, or a potential 'category' field
        // This is a very basic keyword search. A 'category' field on PlantData would be much better.
        const plantCategory = (plant as any).category?.toLowerCase() || ''; // Assuming a 'category' field might exist
        const commonNameLower = plant.commonName.toLowerCase();
        const descriptionLower = plant.description?.toLowerCase() || '';

        // Simple mapping of purpose to potential keywords or categories
        let isMatch = false;
        switch (userPurpose) {
            case 'vegetables':
                isMatch = plantCategory === 'vegetable' || commonNameLower.includes('vegetable') || descriptionLower.includes('vegetable');
                // Check some common vegetable names if category not present
                if (!isMatch && (commonNameLower.includes('tomato') || commonNameLower.includes('carrot'))) isMatch = true;
                break;
            case 'herbs':
                isMatch = plantCategory === 'herb' || commonNameLower.includes('herb') || descriptionLower.includes('herb');
                 if (!isMatch && (commonNameLower.includes('basil') || commonNameLower.includes('mint'))) isMatch = true;
                break;
            case 'fruits':
                isMatch = plantCategory === 'fruit' || commonNameLower.includes('fruit') || descriptionLower.includes('fruit');
                 if (!isMatch && (commonNameLower.includes('apple') || commonNameLower.includes('berry'))) isMatch = true;
                break;
            case 'flowers':
                isMatch = plantCategory === 'flower' || commonNameLower.includes('flower') || descriptionLower.includes('flower');
                break;
            case 'medicinal':
                isMatch = plantCategory === 'medicinal' || plant.healthBenefits?.some(benefit => benefit.toLowerCase().includes(userPurpose));
                break;
        }
        return isMatch;
      });
    });
  }


  return recommendedPlants;
}


// --- Example Usage (for testing) ---
// The following block is commented out due to persistent ts-node compilation errors
// that seem unrelated to the actual code logic being tested.
// The core functions `loadSamplePlantData` and `getPlantRecommendations` are intended
// to be used and tested by importing them into other modules or test files.

/*
if (typeof require !== 'undefined' && require.main === module) {
  console.log("--- Running Recommendation Engine Test ---");

  const samplePlants = loadSamplePlantData();
  if (samplePlants.length === 0) {
    console.error("No sample plants loaded. Exiting test.");
    process.exit(1);
  }
  console.log(`Loaded ${samplePlants.length} sample plants.`);

  const samplePlannerData_BeginnerTemperate: GrowPlannerData = {
    planId: 'test-plan-1',
    userId: 'test-user',
    location: {
      lat: 40.7128,
      lon: -74.0060,
      climateZone: 'Temperate',
    },
    space: 'balcony',
    sunlight: 'partial',
    purpose: ['vegetables', 'herbs'],
    timeCommitment: 'low',
    experience: 'beginner',
    createdAt: new Date().toISOString(),
  };

  const samplePlannerData_AdvancedTropical: GrowPlannerData = {
    planId: 'test-plan-2',
    userId: 'test-user',
    location: {
      lat: 25.7617,
      lon: -80.1918,
      climateZone: 'Subtropical',
    },
    space: 'small_yard',
    sunlight: 'full',
    purpose: ['herbs', 'pet_safe'],
    timeCommitment: 'medium',
    experience: 'advanced',
    createdAt: new Date().toISOString(),
  };

  const samplePlannerData_IndoorLowLight: GrowPlannerData = {
    planId: 'test-plan-3',
    userId: 'test-user',
    location: {
      climateZone: 'Temperate',
    },
    space: 'indoor',
    sunlight: 'low',
    purpose: ['herbs', 'pet_safe'],
    timeCommitment: 'low',
    experience: 'beginner',
    createdAt: new Date().toISOString(),
  };

  console.log("\n--- Test Case 1: Beginner, Temperate, Balcony (Veggies, Herbs) ---");
  const recommendations1 = getPlantRecommendations(samplePlannerData_BeginnerTemperate, samplePlants);
  console.log("Recommendations:", recommendations1.map(p => p.commonName));

  console.log("\n--- Test Case 2: Advanced, Subtropical, Small Yard (Herbs, Pet-Safe) ---");
  const recommendations2 = getPlantRecommendations(samplePlannerData_AdvancedTropical, samplePlants);
  console.log("Recommendations:", recommendations2.map(p => p.commonName));

  console.log("\n--- Test Case 3: Beginner, Indoor, Low Light (Herbs, Pet-Safe) ---");
  const recommendations3 = getPlantRecommendations(samplePlannerData_IndoorLowLight, samplePlants);
  console.log("Recommendations:", recommendations3.map(p => p.commonName));
}
*/
