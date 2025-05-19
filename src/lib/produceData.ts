
export interface ProduceInfo {
  id: string;
  commonName: string;
  scientificName: string;
  image: string; // placeholder URL
  description: string;
  origin: string;
  localNames: string[];
  regions: string[]; // Regions mostly grown
  seasons: string[]; // Added seasons
  nutrition: {
    calories: string;
    macronutrients: Array<{ name: string; value: number; unit: string }>; // Value as number for charts
    vitamins: Array<{ name: string; value: string; unit: string; rdi?: string }>;
    minerals: Array<{ name: string; value: string; unit: string; rdi?: string }>;
  };
  healthBenefits: string[];
  potentialAllergies: string[];
  cultivationProcess: string;
  growthDuration: string;
}

const produceDatabase: ProduceInfo[] = [
  {
    id: 'apple',
    commonName: 'Apple',
    scientificName: 'Malus domestica',
    image: 'https://placehold.co/600x400.png',
    description: 'A sweet, edible fruit produced by an apple tree.',
    origin: 'Central Asia',
    localNames: ['Manzana (Spanish)', 'Pomme (French)', 'Apfel (German)'],
    regions: ['China', 'United States', 'Turkey', 'Poland', 'India'],
    seasons: ['Autumn', 'Winter'],
    nutrition: {
      calories: '52 kcal per 100g',
      macronutrients: [
        { name: 'Protein', value: 0.3, unit: 'g' },
        { name: 'Carbohydrates', value: 14, unit: 'g' },
        { name: 'Fat', value: 0.2, unit: 'g' },
        { name: 'Fiber', value: 2.4, unit: 'g' },
      ],
      vitamins: [
        { name: 'Vitamin C', value: '4.6', unit: 'mg', rdi: '8%' },
        { name: 'Vitamin K', value: '2.2', unit: 'µg', rdi: '3%' },
      ],
      minerals: [
        { name: 'Potassium', value: '107', unit: 'mg', rdi: '3%' },
      ],
    },
    healthBenefits: [
      'Good source of Vitamin C and fiber.',
      'May help lower cholesterol levels.',
      'Linked to a lower risk of diabetes.',
    ],
    potentialAllergies: ['Oral allergy syndrome (birch pollen allergy)'],
    cultivationProcess: 'Grown from seeds or grafting. Requires well-drained soil and full sun. Regular pruning is important for fruit production.',
    growthDuration: '3-5 years to first fruit from sapling; fruits mature in 100-200 days depending on variety.',
  },
  {
    id: 'banana',
    commonName: 'Banana',
    scientificName: 'Musa spp.',
    image: 'https://placehold.co/600x400.png',
    description: 'An elongated, edible fruit – botanically a berry – produced by several kinds of large herbaceous flowering plants in the genus Musa.',
    origin: 'Southeast Asia and Australia',
    localNames: ['Plátano (Spanish)', 'Banane (French/German)'],
    regions: ['India', 'China', 'Indonesia', 'Brazil', 'Ecuador'],
    seasons: ['Year-round'],
    nutrition: {
      calories: '89 kcal per 100g',
      macronutrients: [
        { name: 'Protein', value: 1.1, unit: 'g' },
        { name: 'Carbohydrates', value: 23, unit: 'g' },
        { name: 'Fat', value: 0.3, unit: 'g' },
        { name: 'Fiber', value: 2.6, unit: 'g' },
      ],
      vitamins: [
        { name: 'Vitamin C', value: '8.7', unit: 'mg', rdi: '15%' },
        { name: 'Vitamin B6', value: '0.4', unit: 'mg', rdi: '20%' },
      ],
      minerals: [
        { name: 'Potassium', value: '358', unit: 'mg', rdi: '10%' },
        { name: 'Magnesium', value: '27', unit: 'mg', rdi: '7%' },
      ],
    },
    healthBenefits: [
      'Rich in potassium, important for heart health and blood pressure control.',
      'Good source of Vitamin B6.',
      'Provides natural energy due to carbohydrates.',
    ],
    potentialAllergies: ['Latex-fruit syndrome'],
    cultivationProcess: 'Propagated from suckers or corms. Thrives in tropical climates with high humidity and rainfall. Requires rich, well-drained soil.',
    growthDuration: '9-12 months from planting to harvest.',
  },
  {
    id: 'carrot',
    commonName: 'Carrot',
    scientificName: 'Daucus carota subsp. sativus',
    image: 'https://placehold.co/600x400.png',
    description: 'A root vegetable, typically orange in color, though purple, black, red, white, and yellow cultivars exist.',
    origin: 'Persia (modern-day Iran and Afghanistan)',
    localNames: ['Zanahoria (Spanish)', 'Carotte (French)', 'Möhre (German)'],
    regions: ['China', 'Uzbekistan', 'Russia', 'United States'],
    seasons: ['Spring', 'Autumn', 'Winter'],
    nutrition: {
      calories: '41 kcal per 100g',
      macronutrients: [
        { name: 'Protein', value: 0.9, unit: 'g' },
        { name: 'Carbohydrates', value: 10, unit: 'g' },
        { name: 'Fat', value: 0.2, unit: 'g' },
        { name: 'Fiber', value: 2.8, unit: 'g' },
      ],
      vitamins: [
        { name: 'Vitamin A (from Beta-carotene)', value: '835', unit: 'µg RAE', rdi: '93%' },
        { name: 'Vitamin K', value: '13.2', unit: 'µg', rdi: '16%' },
        { name: 'Vitamin B6', value: '0.1', unit: 'mg', rdi: '7%' },
      ],
      minerals: [
        { name: 'Potassium', value: '320', unit: 'mg', rdi: '9%' },
      ],
    },
    healthBenefits: [
      'Excellent source of Vitamin A (beta-carotene), crucial for vision.',
      'Good source of antioxidants.',
      'May reduce risk of cancer and cardiovascular disease.',
    ],
    potentialAllergies: ['Oral allergy syndrome (celery-mugwort-spice syndrome)'],
    cultivationProcess: 'Grown from seeds in loose, sandy soil. Prefers cool weather. Thinning is necessary for good root development.',
    growthDuration: '70-80 days from sowing to harvest.',
  },
];

export function getProduceByCommonName(name: string): ProduceInfo | undefined {
  const searchTerm = name.toLowerCase();
  return produceDatabase.find(p => p.commonName.toLowerCase() === searchTerm || p.id.toLowerCase() === searchTerm);
}

export function searchProduce(
  query: string,
  filters: { region?: string; season?: string } = {}
): ProduceInfo[] {
  const searchTerm = query.toLowerCase().trim();
  let results = produceDatabase;

  if (searchTerm) {
    results = results.filter(p =>
      p.commonName.toLowerCase().includes(searchTerm) ||
      p.scientificName.toLowerCase().includes(searchTerm) ||
      p.localNames.some(ln => ln.toLowerCase().includes(searchTerm)) ||
      p.description.toLowerCase().includes(searchTerm) // Added description to searchable fields
    );
  }

  if (filters.region && filters.region !== 'all') {
    results = results.filter(p => p.regions.includes(filters.region!));
  }

  if (filters.season && filters.season !== 'all') {
    results = results.filter(p => p.seasons.includes(filters.season!));
  }
  
  // If no search term but filters are applied, return all items matching filters
  if (!searchTerm && ( (filters.region && filters.region !== 'all') || (filters.season && filters.season !== 'all') )) {
    // This block is implicitly handled by the structure above if results starts as produceDatabase
    // and then gets filtered. If query is empty, the first filter block is skipped.
  } else if (!searchTerm && (!filters.region || filters.region === 'all') && (!filters.season || filters.season === 'all')) {
    // No search term and no active filters, return empty or all based on desired behavior for empty query
    return []; // Current behavior: empty if no query or active filters.
  }


  return results;
}

export function getAllProduce(): ProduceInfo[] {
  return produceDatabase;
}

export function getUniqueRegions(): string[] {
  const allRegions = produceDatabase.flatMap(p => p.regions);
  return Array.from(new Set(allRegions)).sort();
}

export function getUniqueSeasons(): string[] {
  const allSeasons = produceDatabase.flatMap(p => p.seasons);
  return Array.from(new Set(allSeasons)).sort();
}
