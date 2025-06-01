import { defineFlow, runFlow } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/google-vertexai'; // Or whichever Gemini model is configured
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob'; // Ensure glob is available

// Assuming PlannerData is imported from a shared types location
// For this subtask, we'll define it inline for simplicity if not easily importable
// In a real scenario, this would be: import type { PlannerData } from '@/types/planner';
const PlannerDataSchema = z.object({
  userId: z.string(),
  location: z.object({
    lat: z.number().nullable(),
    lon: z.number().nullable(),
    address: z.string().optional(),
    climateZone: z.string(),
  }),
  space: z.string(),
  sunlight: z.string(),
  purpose: z.array(z.string()),
  experience: z.string(),
  timeCommitment: z.string(),
  createdAt: z.string(),
});
type PlannerData = z.infer<typeof PlannerDataSchema>;

const PlantRecommendationSchema = z.object({
  id: z.string(),
  commonName: z.string(),
  reasoning: z.string(),
});

const PlantRecommendationArraySchema = z.array(PlantRecommendationSchema);

interface PlantInfo {
  id: string;
  commonName: string;
  content: string; // Stringified JSON content of the plant
}

// Helper function to get all plant data
async function getAllPlantData(): Promise<PlantInfo[]> {
  const plantInfos: PlantInfo[] = [];
  const basePath = path.resolve(__dirname, '../../lib/data'); // path from this flow file to src/lib/data

  // console.log(`[Plant Recommendation Flow] Base path for plant data: ${basePath}`);

  try {
    const categoryDirs = await fs.readdir(basePath);
    // console.log(`[Plant Recommendation Flow] Found categories: ${categoryDirs.join(', ')}`);

    for (const category of categoryDirs) {
      const categoryPath = path.join(basePath, category);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        const jsonFiles = await glob(path.join(categoryPath, '*.json').replace(/\\/g, '/'));
        // console.log(`[Plant Recommendation Flow] Found ${jsonFiles.length} JSON files in ${category}`);
        for (const filePath of jsonFiles) {
          try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const jsonData = JSON.parse(fileContent);
            if (jsonData.id && jsonData.commonName) {
              plantInfos.push({
                id: jsonData.id,
                commonName: jsonData.commonName,
                content: fileContent, // Keep the full stringified content for the AI
              });
            }
          } catch (err: any) {
            console.warn(`[Plant Recommendation Flow] Error reading or parsing ${filePath}: ${err.message}`);
          }
        }
      }
    }
  } catch (err: any) {
     console.error(`[Plant Recommendation Flow] Error listing plant data categories or files: ${err.message}`);
     // If this is critical, you might want to throw the error or return an empty array
     // depending on how the flow should behave if plant data is inaccessible.
     // For now, log and continue, which might result in an empty plantInfos list.
  }
  // console.log(`[Plant Recommendation Flow] Total plant infos collected: ${plantInfos.length}`);
  return plantInfos;
}


export const recommendPlantsFlow = defineFlow(
  {
    name: 'recommendPlantsFlow',
    inputSchema: PlannerDataSchema,
    outputSchema: PlantRecommendationArraySchema,
  },
  async (plannerData: PlannerData): Promise<PlantRecommendation[]> => {
    console.log('[Plant Recommendation Flow] Received planner data:', plannerData);

    const allPlants = await getAllPlantData();
    if (allPlants.length === 0) {
      console.log('[Plant Recommendation Flow] No plant data found. Returning empty recommendations.');
      return [];
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    let hemisphere = 'Equatorial';
    if (plannerData.location.lat !== null) {
      if (plannerData.location.lat > 0) {
        hemisphere = 'Northern';
      } else if (plannerData.location.lat < 0) {
        hemisphere = 'Southern';
      }
    }

    console.log(`[Plant Recommendation Flow] Current month: ${currentMonth}, Hemisphere: ${hemisphere}`);
    console.log(`[Plant Recommendation Flow] Number of plants for AI context: ${allPlants.length}`);

    const plantDataForPrompt = allPlants.map(p => p.content).join('\n\n---\n\n'); // Join JSON strings

    const prompt = `
You are an expert horticulturalist and garden planner. Your goal is to help users find the perfect plants to grow based on their specific situation and preferences.

You will be provided with the user's planner data:
${JSON.stringify(plannerData, null, 2)}

You will also be provided with a list of available plants, each as a JSON object string:
${plantDataForPrompt}

The current month is ${currentMonth} and the user is in the ${hemisphere} Hemisphere.

Analyze the user's planner data and the provided plant information. Recommend up to 5-7 plants that are the best match for the user.

Filtering Criteria:
-   **Climate Zone Compatibility**: Match the plant's climatic needs (especially temperature tolerance, frost sensitivity) with the user's \`location.climateZone\`.
-   **Sunlight Requirements**: Match the plant's sunlight needs (e.g., 'full sun', 'partial shade') with the user's \`sunlight\` preference.
-   **Experience Level**: Consider the user's \`experience\` level. Recommend plants with simpler cultivation for 'beginners'.
-   **Planting Window**: Using the current month ('${currentMonth}') and hemisphere ('${hemisphere}'), evaluate if it's a suitable time to plant according to the plant's 'seasons' or 'plantingAndHarvestCycles'.
-   **Space Suitability**: Consider the user's \`space\` (e.g., 'balcony', 'indoor', 'garden'). For 'balcony' or 'indoor', prioritize plants suitable for pots or smaller spaces.
-   **Purpose**: Align recommendations with the user's \`purpose\` (e.g., 'vegetables', 'herbs').
-   **Time Commitment**: Factor in the user's \`timeCommitment\`.

Output Format:
For each recommended plant, provide:
1.  \`id\`: The unique ID of the plant from its JSON data.
2.  \`commonName\`: The common name of the plant.
3.  \`reasoning\`: A concise explanation (1-2 sentences) of why this plant is a good match, specifically mentioning which user criteria it meets.

Return the recommendations as a valid JSON array of objects, where each object has "id", "commonName", and "reasoning" keys.
If no plants are a good match, return an empty JSON array [].
Do not include any introductory text or pleasantries in your response, only the JSON array.
Ensure the output is a single, valid JSON array.
`;

    try {
      const llmResponse = await geminiPro.generate({
        prompt: prompt,
        output: { schema: PlantRecommendationArraySchema }, // Request structured output
        // Consider adding safety settings if needed
      });

      const recommendations = llmResponse.output();
      // console.log('[Plant Recommendation Flow] Raw LLM Output:', JSON.stringify(recommendations, null, 2));


      if (!recommendations) {
        console.log('[Plant Recommendation Flow] LLM returned no recommendations.');
        return [];
      }

      // Additional validation if schema validation isn't perfect from LLM
      if (!Array.isArray(recommendations)) {
        console.error('[Plant Recommendation Flow] LLM output was not an array. Output:', recommendations);
        // Attempt to parse if it's a stringified array, otherwise return empty
        try {
            const parsed = JSON.parse(recommendations as any);
            if (Array.isArray(parsed)) return parsed.filter(rec => PlantRecommendationSchema.safeParse(rec).success);
        } catch (e) {
            console.error('[Plant Recommendation Flow] Failed to parse non-array output from LLM.');
            return [];
        }
        return [];
      }

      const validatedRecommendations = recommendations.filter(rec => PlantRecommendationSchema.safeParse(rec).success);
      console.log('[Plant Recommendation Flow] Successfully generated and validated recommendations:', validatedRecommendations);
      return validatedRecommendations;

    } catch (error) {
      console.error('[Plant Recommendation Flow] Error generating recommendations:', error);
      return []; // Return empty array on error
    }
  }
);

// Optional: Add a simple way to test the flow if possible (e.g., an exported main function)
// This might be complex in a subtask environment without running a Genkit dev server.
