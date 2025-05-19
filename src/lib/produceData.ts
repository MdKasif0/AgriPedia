
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
        { name: 'Vitamin C', value: 4.6, unit: 'mg', rdi: '8%' },
        { name: 'Vitamin K', value: 2.2, unit: 'µg', rdi: '3%' },
      ],
      minerals: [
        { name: 'Potassium', value: 107, unit: 'mg', rdi: '3%' },
      ],
    },
    healthBenefits: [
      'Rich in fiber, aiding digestion and promoting satiety, which can be beneficial for weight management.',
      'Contains antioxidants like quercetin, which may protect brain cells from oxidative stress.',
      'Soluble fiber (pectin) can help lower LDL (bad) cholesterol levels, supporting heart health.',
      'May help regulate blood sugar levels, potentially reducing the risk of type 2 diabetes.',
    ],
    potentialAllergies: [
      { name: 'Oral Allergy Syndrome (OAS)', severity: 'Mild', details: 'Often linked to birch pollen allergy. Symptoms include itching or swelling of the mouth, lips, tongue, and throat.'},
      { name: 'Pesticide Residues', severity: 'Varies', details: 'Conventionally grown apples can have pesticide residues. Opting for organic or thorough washing is recommended.'}
    ],
    cultivationProcess: `Step-by-Step Growing Guide:
1. Planting: Plant bare-root trees in early spring or container-grown trees anytime soil is workable. Choose a sunny location with good air circulation.
2. Soil: Apples prefer well-drained, loamy soil with a slightly acidic to neutral pH (6.0-7.0). Amend soil with compost before planting.
3. Watering: Water young trees regularly, especially during dry periods (1-2 inches per week). Mature trees are more drought-tolerant but benefit from deep watering during prolonged drought.
4. Fertilizing: Apply a balanced fertilizer in early spring before new growth begins. Avoid over-fertilizing, which can lead to excessive vegetative growth.
5. Pruning: Prune annually during dormancy (late winter/early spring) to maintain shape, remove dead/diseased wood, and encourage fruit production.
6. Pollination: Most apple varieties require cross-pollination from a different compatible apple variety. Ensure a suitable pollinator is nearby.
7. Pest & Disease Control: Monitor for common pests (e.g., codling moth, aphids) and diseases (e.g., apple scab, fire blight). Use appropriate organic or chemical controls as needed.

Ideal Conditions:
- Climate: Temperate climates with a distinct winter chilling period (specific hours vary by variety).
- Sunlight: Full sun (at least 6-8 hours per day).
- Soil: Well-drained loam.
- Water: Consistent moisture, especially for young trees.`,
    growthDuration: 'Typically 3-5 years for a young tree to bear its first significant fruit crop. Fruits mature in 100-200 days from bloom, depending on the variety and climate.',
    sustainabilityTips: [
        "Store in the fridge to prolong freshness, not in a fruit bowl.",
        "Compost apple cores or use them to make apple cider vinegar.",
        "Buy local apples in season to reduce food miles and support local farmers.",
        "Consider varieties that require less pesticide if buying conventional."
    ],
    carbonFootprintInfo: "Apples generally have a low carbon footprint (around 0.3-0.5 kg CO2e/kg), especially when sourced locally and in season. Long-distance transport and out-of-season cold storage significantly increase this impact. Choosing organic can also reduce footprint related to synthetic pesticide and fertilizer production.",
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
        { name: 'Vitamin C', value: 8.7, unit: 'mg', rdi: '15%' },
        { name: 'Vitamin B6', value: 0.4, unit: 'mg', rdi: '20%' },
      ],
      minerals: [
        { name: 'Potassium', value: 358, unit: 'mg', rdi: '10%' },
        { name: 'Magnesium', value: 27, unit: 'mg', rdi: '7%' },
      ],
    },
    healthBenefits: [
      'High potassium content supports healthy blood pressure levels and cardiovascular function.',
      'Provides readily available carbohydrates, making it a great natural energy booster for athletes.',
      'Contains pectin and resistant starch, which may moderate blood sugar levels and improve digestive health.',
      'Good source of Vitamin B6, important for brain development and function.',
    ],
    potentialAllergies: [
      { name: 'Latex-Fruit Syndrome', severity: 'Moderate', details: 'Individuals allergic to latex may also react to bananas. Symptoms can range from mild oral reactions to anaphylaxis in severe cases.' },
      { name: 'Tyramine Content', severity: 'Mild', details: 'Can trigger migraines in sensitive individuals, especially when overripe.' }
    ],
    cultivationProcess: `Step-by-Step Growing Guide:
1. Propagation: Bananas are typically grown from "pups" or suckers (side shoots from the main stem) or corms.
2. Site Selection: Choose a location with full sun, protection from strong winds, and excellent drainage.
3. Soil: Bananas thrive in rich, fertile, well-drained soil, high in organic matter. Ideal pH is 5.5-6.5.
4. Planting: Dig a large hole and amend with compost. Plant pups ensuring the corm is well-covered.
5. Watering: Bananas are heavy feeders and require consistent moisture, especially during warm weather. Water deeply and regularly, but avoid waterlogging.
6. Fertilizing: Apply a balanced fertilizer rich in potassium regularly (e.g., every 1-2 months during the growing season). Mulching helps retain moisture and suppress weeds.
7. De-suckering: Remove excess suckers, leaving only one or two strong ones to develop for the next crop.
8. Harvesting: The fruit bunch is harvested when the bananas are plump but still green. The main plant dies after fruiting, and the next generation grows from the suckers.

Ideal Conditions:
- Climate: Tropical or subtropical, warm and humid. Frost-sensitive.
- Sunlight: Full sun (at least 6 hours).
- Soil: Rich, well-drained, loamy soil with plenty of organic matter.
- Water: High water requirement; consistent moisture is key.`,
    growthDuration: 'Approximately 9-12 months from planting a pup to harvesting the first bunch of bananas. Each stem fruits only once.',
    sustainabilityTips: [
        "Store at room temperature. Separate from other fruits if you want to slow their ripening.",
        "Freeze overripe bananas (peeled) for smoothies or banana bread.",
        "Compost banana peels, or use them in the garden as they are rich in potassium.",
        "Choose Fair Trade or organic bananas to support sustainable farming and fair labor practices."
    ],
    carbonFootprintInfo: "Bananas often have a higher carbon footprint (around 0.5-0.8 kg CO2e/kg) due to long-distance refrigerated transport from tropical regions. Air-freighted bananas have a significantly higher footprint. Shipping by sea is more carbon-efficient. Choosing certified sustainable bananas can help mitigate environmental impact.",
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
        { name: 'Vitamin A (from Beta-carotene)', value: 835, unit: 'µg RAE', rdi: '93%' },
        { name: 'Vitamin K', value: 13.2, unit: 'µg', rdi: '16%' },
        { name: 'Vitamin B6', value: 0.1, unit: 'mg', rdi: '7%' },
      ],
      minerals: [
        { name: 'Potassium', value: 320, unit: 'mg', rdi: '9%' },
      ],
    },
    healthBenefits: [
      'Excellent source of beta-carotene, converted to Vitamin A, essential for good vision, immune function, and skin health.',
      'Rich in antioxidants, which help protect the body from free radical damage and may reduce cancer risk.',
      'Fiber content aids in digestive health and can help regulate blood sugar levels.',
      'Linked to lower cholesterol levels and improved heart health.',
    ],
    potentialAllergies: [
      { name: 'Oral Allergy Syndrome (OAS)', severity: 'Mild', details: 'Associated with celery-mugwort-birch pollen allergies. Symptoms are usually mild and localized to the mouth and throat.' },
      { name: 'Carotenemia', severity: 'Mild', details: 'Excessive consumption can lead to a harmless yellowing of the skin, particularly palms and soles.'}
    ],
    cultivationProcess: `Step-by-Step Growing Guide:
1. Soil Preparation: Carrots need loose, well-drained, sandy loam or loamy soil, free of stones and debris, to allow roots to grow straight. Work the soil deeply (12 inches).
2. Sowing Seeds: Sow seeds directly into the garden bed in early spring, about 2-3 weeks before the last expected frost, or in late summer for a fall harvest. Plant seeds 1/4 to 1/2 inch deep, in rows 1 foot apart.
3. Watering: Keep the soil consistently moist during germination (can take 1-3 weeks). Water regularly throughout the growing season, aiming for about 1 inch per week.
4. Thinning: Once seedlings are a few inches tall, thin them to stand 2-3 inches apart. This is crucial for proper root development.
5. Weeding: Keep the area weed-free, as carrots compete poorly with weeds. Mulch can help.
6. Fertilizing: Carrots are not heavy feeders. Too much nitrogen can cause hairy roots. A light application of a balanced fertilizer or compost worked into the soil before planting is usually sufficient.
7. Harvesting: Carrots are typically ready to harvest 60-80 days after sowing, depending on the variety. Harvest when roots reach desired size and color.

Ideal Conditions:
- Climate: Cool-weather crop. Best growth occurs when temperatures are between 60-70°F (15-21°C).
- Sunlight: Full sun (at least 6 hours), can tolerate light shade in hotter climates.
- Soil: Deep, loose, well-drained sandy loam. pH 6.0-6.8.
- Water: Consistent moisture, especially during root development.`,
    growthDuration: 'Generally 60-80 days from sowing seeds to harvest, depending on the variety and growing conditions.',
    sustainabilityTips: [
        "Store carrots in the crisper drawer of your refrigerator. If they have greens, remove them to prevent moisture loss from the root.",
        "Use carrot tops (greens) in pesto, salads, or stocks instead of discarding them.",
        "Choose 'ugly' or misshapen carrots to reduce food waste, as they are just as nutritious.",
        "Growing your own carrots is relatively easy and greatly reduces their carbon footprint."
    ],
    carbonFootprintInfo: "Carrots grown locally and in season have a very low carbon footprint (around 0.2-0.4 kg CO2e/kg). Processing (like baby carrots), packaging, and long-distance transport can increase this. Field-grown carrots are generally more sustainable than greenhouse-grown out of season.",
  },
  // Add more produce items here
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
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.region && filters.region !== 'all') {
    results = results.filter(p => p.regions.includes(filters.region!));
  }

  if (filters.season && filters.season !== 'all') {
    results = results.filter(p => p.seasons.includes(filters.season!));
  }
  
  if (!searchTerm && ( (filters.region && filters.region !== 'all') || (filters.season && filters.season !== 'all') )) {
    // This block is implicitly handled by the structure above if results starts as produceDatabase
    // and then gets filtered. If query is empty, the first filter block is skipped.
  } else if (!searchTerm && (!filters.region || filters.region === 'all') && (!filters.season || filters.season === 'all')) {
    return []; 
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

