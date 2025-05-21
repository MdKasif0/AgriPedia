
import fruitsData from './data/fruits-data.json';
import vegetablesData from './data/vegetables-data.json';

export interface ProduceInfo {
  id: string;
  commonName: string;
  scientificName: string;
  image: string; // placeholder URL
  description: string;
  origin: string;
  localNames: string[];
  regions: string[]; // Regions mostly grown
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
}

// Combine data from imported JSON files
const allProduceData: ProduceInfo[] = [...fruitsData, ...vegetablesData];

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

// Helper function to determine current season (Northern Hemisphere)
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

  if (limit) {
    // Optionally shuffle before slicing for variety, or just take the first few
    // For simplicity, we'll take the first `limit` items.
    return inSeasonItems.slice(0, limit);
  }
  return inSeasonItems;
}
