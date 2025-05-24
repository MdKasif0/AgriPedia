
import fs from 'fs';
import path from 'path';

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
}
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
  nutrition: {
    calories: string;
    macronutrients: Array<{ name: string; value: number; unit: string }>;
    vitamins: Array<{ name: string; value: number; unit: string; rdi?: string }>;
    minerals: Array<{ name: string; value: number; unit: string; rdi?: string }>;
  };
  healthBenefits: string[];
  potentialAllergies: Array<{
    name: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Common' | 'Rare' | 'Varies';
    details?: string;
  }>;
  cultivationProcess: string;
  growthDuration: string;
  sustainabilityTips?: string[];
  carbonFootprintInfo?: string;
  staticRecipes?: Recipe[]; // Added static recipes
}

const fruitsDir = path.join(__dirname, 'data', 'fruits');
const vegetablesDir = path.join(__dirname, 'data', 'vegetables');

function loadProduceFromDir(dirPath: string): ProduceInfo[] {
  const produceItems: ProduceInfo[] = [];
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dirPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        // Ensure .gitkeep files or other non-JSON content doesn't cause errors
        if (fileContent.trim() === "") {
          console.warn(`Skipping empty file: ${filePath}`);
          continue;
        }
        try {
          produceItems.push(JSON.parse(fileContent) as ProduceInfo);
        } catch (parseError) {
          console.error(`Error parsing JSON from file ${filePath}:`, parseError);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    // Depending on requirements, you might want to throw the error,
    // or return an empty array, or handle it differently.
    // For now, returning empty and logging error.
  }
  return produceItems;
}

const loadedFruits = loadProduceFromDir(fruitsDir);
const loadedVegetables = loadProduceFromDir(vegetablesDir);

const allProduceData: ProduceInfo[] = [...loadedFruits, ...loadedVegetables];

export function getProduceByCommonName(name: string): ProduceInfo | undefined {
  const searchTerm = name.toLowerCase();
  return allProduceData.find(p => p.commonName.toLowerCase() === searchTerm || p.id.toLowerCase() === searchTerm);
}

export function searchProduce(
  query: string,
  filters: { region?: string; season?: string } = {}
): ProduceInfo[] {
  const searchTerm = query.toLowerCase().trim();
  let results = allProduceData;

  if (searchTerm) {
    results = results.filter(p =>
      p.commonName.toLowerCase().includes(searchTerm) ||
      p.scientificName.toLowerCase().includes(searchTerm) ||
      p.localNames.some(ln => ln.toLowerCase().includes(searchTerm)) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.region && filters.region !== 'all') {
    results = results.filter(p => p.regions.includes(filters.region!));
  }

  if (filters.season && filters.season !== 'all') {
    results = results.filter(p => p.seasons.includes(filters.season!));
  }

  return results;
}

export function getAllProduce(): ProduceInfo[] {
  return allProduceData;
}

export function getUniqueRegions(): string[] {
  const allRegions = allProduceData.flatMap(p => p.regions);
  return Array.from(new Set(allRegions)).sort();
}

export function getUniqueSeasons(): string[] {
  const allSeasons = allProduceData.flatMap(p => p.seasons);
  return Array.from(new Set(allSeasons)).sort();
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
    produce.seasons.includes(currentSeason)
  );

  // Shuffle for variety if more items than limit
  if (limit && inSeasonItems.length > limit) {
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

