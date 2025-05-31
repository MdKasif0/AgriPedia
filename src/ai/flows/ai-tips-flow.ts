import { defineFlow, runFlow } from 'genkit';
import { z } from 'zod';
import { ai } from '@/ai/genkit';

// Define input schema: User's current gardening context
const GardeningContextSchema = z.object({
  plants: z.array(z.object({
    name: z.string(),
    stage: z.string().optional().describe('e.g., seedling, flowering, fruiting'),
    health: z.string().optional().describe('e.g., "healthy", "yellowing leaves", "wilting"'),
  })).optional().describe('List of plants the user is currently growing'),
  location: z.string().optional().describe('General location or climate zone for weather-related tips'),
  recentInteractions: z.array(z.string()).optional().describe('Recent actions or observations by the user, e.g., "just watered tomatoes", "noticed aphids on roses"'),
  tipPreferences: z.array(z.string()).optional().describe('User preferences for types of tips, e.g., "organic pest control", "watering techniques", "fertilizing"')
});

// Define output schema: A single personalized tip
const AITipSchema = z.object({
  tip: z.string().describe('A personalized gardening tip'),
  category: z.string().optional().describe('Category of the tip, e.g., "Watering", "Pest Control", "Sunlight", "Nutrients"'),
  relevanceScore: z.number().min(0).max(1).optional().describe('Estimated relevance of the tip to the current context')
});

export const aiTipsFlow = defineFlow(
  {
    name: 'aiTipsFlow',
    inputSchema: GardeningContextSchema,
    outputSchema: AITipSchema,
    description: 'Generates a personalized gardening tip based on user context.',
  },
  async (context) => {
    const { plants, location, recentInteractions, tipPreferences } = context;

    let prompt = `
      You are an expert gardening advisor. Generate a single, concise, and actionable gardening tip that is highly relevant to the user's current situation.
      The tip should be beginner-friendly.
      Base the tip on the following user context:
    `;

    if (plants && plants.length > 0) {
      prompt += `
- Current Plants: ${plants.map(p => `${p.name} (Stage: ${p.stage || 'N/A'}, Health: ${p.health || 'N/A'})`).join('; ')}`;
    } else {
      prompt += `
- No specific plants reported. Consider general gardening tips for the season or location if provided.`;
    }

    if (location) {
      prompt += `
- Location/Climate: ${location}`;
    }

    if (recentInteractions && recentInteractions.length > 0) {
      prompt += `
- Recent Observations/Actions: ${recentInteractions.join(', ')}`;
    }

    if (tipPreferences && tipPreferences.length > 0) {
      prompt += `
- Tip Preferences: ${tipPreferences.join(', ')}`;
    }

    prompt += `

Consider the time of year (implicitly, if location is known and suggests a season), common plant needs, and potential issues.
      Prioritize tips that are proactive or address potential problems indicated by the context.
      Format your response as a JSON object with "tip", "category", and "relevanceScore".
      Example: {"tip": "Your basil may need more sunlight. Try moving it to a spot that gets at least 6 hours of direct sun daily.", "category": "Sunlight", "relevanceScore": 0.85}
      If the context is very limited, provide a general but useful gardening tip.
    `;

    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.0-flash',
      config: {
        temperature: 0.7, // Slightly higher temperature for more varied tips
      },
      output: {
        format: 'json',
        schema: AITipSchema
      }
    });

    const tipOutput = llmResponse.output();

    if (!tipOutput || !tipOutput.tip) {
      // Fallback tip if AI fails or returns empty content
      return {
        tip: "Remember to check your plants regularly for any signs of pests or diseases. Early detection is key!",
        category: "General Maintenance",
        relevanceScore: 0.5
      };
    }

    return tipOutput;
  }
);

// Example usage (for testing purposes)
export async function getAITip(context: z.infer<typeof GardeningContextSchema>) {
  return await runFlow(aiTipsFlow, context);
}
