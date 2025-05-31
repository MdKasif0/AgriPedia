import { defineFlow, runFlow } from 'genkit';
import { z } from 'zod';
import { ai } from '@/ai/genkit'; // Assuming genkit setup is in src/ai/genkit.ts

// Define input schema: User's gardening profile
const GardeningProfileSchema = z.object({
  location: z.string().describe('Geographical location (e.g., city, state, or climate zone)'),
  goals: z.array(z.string()).describe('Gardening goals (e.g., "grow vegetables for cooking", "attract pollinators", "low maintenance")'),
  plantLogs: z.array(z.object({
    plantName: z.string(),
    status: z.string().describe('e.g., "thriving", "struggling", "harvested"'),
    notes: z.string().optional(),
  })).describe('Logs of currently or previously grown plants').optional(),
  preferences: z.array(z.string()).describe('Specific plant preferences or dislikes').optional(),
});

// Define output schema: Recommended plants
const RecommendedPlantSchema = z.object({
  plantName: z.string(),
  reasoning: z.string().describe('Why this plant is recommended based on the user profile'),
  careDifficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  notes: z.string().optional().describe('Additional tips or considerations for this plant'),
});

export const smartPlantRecommenderFlow = defineFlow(
  {
    name: 'smartPlantRecommenderFlow',
    inputSchema: GardeningProfileSchema,
    outputSchema: z.array(RecommendedPlantSchema),
    description: 'Recommends plants based on user location, goals, and planting history.',
  },
  async (profile) => {
    const { location, goals, plantLogs, preferences } = profile;

    const prompt = `
      You are an expert gardening assistant. Based on the following user profile, recommend 3-5 plants suitable for their needs.
      For each plant, provide a brief reasoning and optionally, its care difficulty and any important notes.

      User Profile:
      - Location: ${location}
      - Gardening Goals: ${goals.join(', ')}
      ${plantLogs && plantLogs.length > 0 ? `- Plant Logs: ${plantLogs.map(log => `${log.plantName} (${log.status})`).join('; ')}` : ''}
      ${preferences && preferences.length > 0 ? `- Preferences/Dislikes: ${preferences.join(', ')}` : ''}

      Consider factors like climate suitability for the location, alignment with gardening goals, and variety based on past logs (if available).
      If plant logs show struggles with certain types of plants, try to avoid similar ones or suggest easier alternatives.
      Format your response as a JSON array of objects, where each object has "plantName", "reasoning", "careDifficulty", and "notes".
      Example: [{"plantName": "Tomatoes", "reasoning": "Good for beginners in sunny locations, aligns with vegetable gardening goal.", "careDifficulty": "beginner", "notes": "Needs regular watering and support."}]
    `;

    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.0-flash', // Ensure this model is configured in genkit.ts
      config: {
        temperature: 0.6,
      },
      output: {
        format: 'json',
        schema: z.array(RecommendedPlantSchema)
      }
    });

    const recommendations = llmResponse.output();

    if (!recommendations) {
      throw new Error('Failed to generate plant recommendations.');
    }

    return recommendations;
  }
);

// Example usage (for testing purposes, can be removed or kept for local dev)
export async function getPlantRecommendations(profile: z.infer<typeof GardeningProfileSchema>) {
  return await runFlow(smartPlantRecommenderFlow, profile);
}
