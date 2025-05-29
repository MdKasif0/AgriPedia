import fs from 'fs';
import path from 'path';

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

// Add 'category' to the ProduceInfo interface
export interface ProduceInfo {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;
  description: string;
  origin: string;
  localNames: string[];
  regions: string[];
  seasons: string[];
  category: string; // New field
  nutrition: {
    calories: string;
    macronutrients: Array<{ name: string; value: number; unit: string }>;
    vitamins: Array<{ name: string; value: number; unit: string; rdi?: string }>;
    minerals: Array<{ name: string; value: number; unit: string; rdi?: string }>;
  };
  healthBenefits: string[];
  potentialAllergies: Array<{
    name: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Common' | 'Rare' | 'Varies' | 'Harmless' | 'Low' | 'Low to Moderate' | 'Moderate to High' | 'Very Low';
    details?: string;
  }>;
  cultivationProcess: string;
  growthDuration: string;
  sustainabilityTips?: string[];
  carbonFootprintInfo?: string;
  staticRecipes?: Recipe[];
  // New agricultural fields
  uses?: string[];
  climaticRequirements?: {
    temperature?: string;
    rainfall?: string;
    altitude?: string;
  };
  soilPreferences?: string;
  irrigationWaterNeeds?: string;
  plantingHarvestCycles?: string;
  pestDiseaseManagement?: string;
  postHarvestHandling?: string;
  majorProducingCountries?: string[];
  marketValueGlobalDemand?: string;
}

function loadAllProduceData(): ProduceInfo[] {
  const allProduce: ProduceInfo[] = [];
  const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');

  try {
    const categories = fs.readdirSync(dataDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const category of categories) {
      const categoryDir = path.join(dataDir, category);
      try {
        const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.json'));

        for (const file of files) {
          const filePath = path.join(categoryDir, file);
          try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const produceData = JSON.parse(fileContent) as ProduceInfo;
            // Add the category to the produceData
            produceData.category = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Format category name
            allProduce.push(produceData);
          } catch (error) {
            console.error(`Error reading or parsing file ${filePath}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${categoryDir}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error reading base data directory ${dataDir}:`, error);
  }
  
  return allProduce;
}

const allProduceData: ProduceInfo[] = loadAllProduceData();

// Keep existing functions, they will now operate on the dynamically loaded data
export function getProduceByCommonName(name: string): ProduceInfo | undefined {
  const searchTerm = name.toLowerCase();
  return allProduceData.find(p => p.commonName.toLowerCase() === searchTerm || p.id.toLowerCase() === searchTerm);
}

export function searchProduce(
  query: string,
  filters: { region?: string; season?: string; category?: string } = {} // Added category filter
): ProduceInfo[] {
  const searchTerm = query.toLowerCase().trim();
  let results = allProduceData;

  if (searchTerm) {
    results = results.filter(p =>
      p.commonName.toLowerCase().includes(searchTerm) ||
      p.scientificName.toLowerCase().includes(searchTerm) ||
      p.localNames.some(ln => ln.toLowerCase().includes(searchTerm)) ||
      p.description.toLowerCase().includes(searchTerm) ||
      (p.category && p.category.toLowerCase().includes(searchTerm)) // Search by category
    );
  }

  if (filters.region && filters.region !== 'all') {
    results = results.filter(p => p.regions.includes(filters.region!));
  }

  if (filters.season && filters.season !== 'all') {
    results = results.filter(p => p.seasons.includes(filters.season!));
  }

  if (filters.category && filters.category !== 'all') { // Filter by category
    results = results.filter(p => p.category === filters.category);
  }

  return results;
}

export function getAllProduce(): ProduceInfo[] {
  return allProduceData;
}

export function getUniqueRegions(): string[] {
  const allRegions = allProduceData.flatMap(p => p.regions || []); // Handle potentially undefined regions
  return Array.from(new Set(allRegions)).sort();
}

export function getUniqueSeasons(): string[] {
  const allSeasons = allProduceData.flatMap(p => p.seasons || []); // Handle potentially undefined seasons
  return Array.from(new Set(allSeasons)).sort();
}

export function getUniqueCategories(): string[] { // New function
  const allCategories = allProduceData.map(p => p.category).filter(Boolean); // Filter out undefined/null categories
  return Array.from(new Set(allCategories)).sort();
}

function getCurrentSeasonName(): string {
  const month = new Date().getMonth(); // 0 (Jan) - 11 (Dec)
  if (month >= 2 && month <= 4) return 'Spring'; // Mar, Apr, May
  if (month >= 5 && month <= 7) return 'Summer'; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return 'Autumn'; // Sep, Oct, Nov
  return 'Winter'; // Dec, Jan, Feb
}

export function getInSeasonProduce(limit?: number): ProduceInfo[] {
  const currentSeason = getCurrentSeasonName();
  const inSeasonItems = allProduceData.filter(produce =>
    produce.seasons && produce.seasons.includes(currentSeason) // Handle potentially undefined seasons
  );

  if (limit && inSeasonItems.length > limit) {
    // Shuffle and slice if more items than limit
    for (let i = inSeasonItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [inSeasonItems[i], inSeasonItems[j]] = [inSeasonItems[j], inSeasonItems[i]];
    }
    return inSeasonItems.slice(0, limit);
  }
  if (limit) {
    return inSeasonItems.slice(0, limit); 
  }
  return inSeasonItems;
}

// Ensure all agricultural fields are optional in the interface for robustness
// as they might not be present in all old JSON files immediately.
// The `ProduceInfo` interface has already been updated to make these optional.
// The `loadAllProduceData` function will add `category` to each item.
// Old `fruits` and `vegetables` arrays are removed as `allProduceData` is now the single source of truth.
