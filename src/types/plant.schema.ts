import * as z from 'zod';

// Define more specific sub-schemas if needed
const NutrientSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  rdi: z.string().optional(),
});

const AllergySchema = z.object({
  name: z.string(),
  severity: z.string(),
  details: z.string(),
});

const RecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
});

export const PlantDataSchema = z.object({
  id: z.string(),
  commonName: z.string(),
  scientificName: z.string(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  origin: z.string().optional(),
  localNames: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  seasons: z.array(z.string()).optional(),
  nutrition: z.object({
    calories: z.string().optional(),
    macronutrients: z.array(NutrientSchema).optional(),
    vitamins: z.array(NutrientSchema).optional(),
    minerals: z.array(NutrientSchema).optional(),
  }).optional(),
  healthBenefits: z.array(z.string()).optional(),
  potentialAllergies: z.array(AllergySchema).optional(),
  cultivationProcess: z.string().optional(),
  growthDuration: z.string().optional(),
  sustainabilityTips: z.array(z.string()).optional(),
  carbonFootprintInfo: z.string().optional(),
  uses: z.array(z.string()).optional(),
  climaticRequirements: z.object({
    temperature: z.string().optional(),
    rainfall: z.string().optional(),
    altitude: z.string().optional(),
  }).optional(),
  soilPreferences: z.string().optional(),
  irrigationAndWaterNeeds: z.string().optional(),
  plantingAndHarvestCycles: z.string().optional(),
  pestAndDiseaseManagement: z.string().optional(),
  postHarvestHandling: z.string().optional(),
  majorProducingCountriesOrRegions: z.array(z.string()).optional(),
  marketValueAndGlobalDemand: z.string().optional(),
  staticRecipes: z.array(RecipeSchema).optional(),
  // Add new fields for explicit filtering if Step 4 is done
  lightRequirement: z.enum(["full_sun", "partial_shade", "shade", "adaptable"]).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  spaceSuitability: z.array(z.enum(["garden", "balcony_pots", "indoor", "hanging_baskets"])).optional(),
});
