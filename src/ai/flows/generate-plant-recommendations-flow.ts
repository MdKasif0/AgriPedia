import { defineFlow, run, generate } from '@genkit-ai/ai';
import { geminiPro } from '../genkit'; // Assuming geminiPro is configured similarly to other flows
import * as z from 'zod';

// 1. Define Input Schema
export const PlantRecommendationsInputSchema = z.object({
  location: z.string().min(1, "Location is required."),
  space: z.string().min(1, "Space description is required (e.g., 'small balcony', 'large yard', 'indoor windowsill')."),
  sunlight: z.string().min(1, "Sunlight condition is required (e.g., 'full sun', 'partial shade', 'full shade')."),
  goals: z.string().min(1, "Gardening goals are required (e.g., 'vegetables for cooking', 'colorful flowers', 'low maintenance greenery')."),
  season: z.string().optional().describe("Current season, e.g., 'Spring', 'Summer', 'Autumn', 'Winter'"),
});

// 2. Define Output Schema
export const PlantRecommendationSchema = z.object({
  plantName: z.string().describe("The common name of the recommended plant."),
  reason: z.string().describe("A brief explanation of why this plant is suitable."),
  careHighlights: z.string().describe("2-3 key care highlights for the plant."),
});

export const PlantRecommendationsOutputSchema = z.object({
  recommendations: z.array(PlantRecommendationSchema).describe("A list of plant recommendations."),
});

// 3. Create the Genkit Flow
export const generatePlantRecommendationsFlow = defineFlow(
  {
    name: 'generatePlantRecommendationsFlow',
    inputSchema: PlantRecommendationsInputSchema,
    outputSchema: PlantRecommendationsOutputSchema,
  },
  async (input) => {
    const { location, space, sunlight, goals, season } = input;

    const prompt = `You are an expert horticulturist and gardening advisor. A user is looking for plant recommendations.

User Preferences:
- Location: ${location}
- Available Space: ${space}
- Sunlight Exposure: ${sunlight}
- Gardening Goals: ${goals}
${season ? `- Current Season: ${season}` : ''}

Based on these preferences, please suggest 3-5 plants that would thrive under these conditions.
For each plant, provide:
1. The common plant name.
2. A brief reason (1-2 sentences) why it's a good fit for the user's conditions and goals.
3. 2-3 concise key care highlights (e.g., "Water regularly, needs well-draining soil, fertilize monthly during growing season").

Format your response as a valid JSON object with a single key "recommendations". "recommendations" should be an array of objects, where each object contains "plantName", "reason", and "careHighlights".

Example of a single recommendation object:
{
  "plantName": "Tomato (Cherry variety)",
  "reason": "Cherry tomatoes are relatively easy to grow in containers on a sunny balcony and fit the goal of growing vegetables for cooking.",
  "careHighlights": "Requires at least 6-8 hours of full sun, water consistently, use a stake or cage for support."
}
`;

    const llmResponse = await run("call-gemini", async () =>
        generate({
            model: geminiPro,
            prompt: prompt,
            config: {
                temperature: 0.7, // Adjust for creativity vs. predictability
            },
            output: {
                format: 'json', // Request JSON output directly if supported and configured
                schema: PlantRecommendationsOutputSchema
            }
        })
    );

    // If direct JSON output with schema is working, response should already be structured.
    // Otherwise, manual parsing would be needed here.
    const structuredResponse = llmResponse.output();

    if (!structuredResponse || !structuredResponse.recommendations) {
        // Fallback or error handling if direct JSON output didn't work as expected
        // This might involve trying to parse llmResponse.text() if it's a string.
        // For now, we assume direct JSON output is configured and working.
        // If not, this part needs robust parsing and error handling.
        console.error("Error: AI response was not in the expected format or was empty.");
        // Try to parse from text if available and it's a string
        const textOutput = llmResponse.text();
        if (textOutput) {
            try {
                const parsedText = JSON.parse(textOutput);
                if (PlantRecommendationsOutputSchema.safeParse(parsedText).success) {
                    return parsedText;
                }
            } catch (e) {
                console.error("Error parsing text output from LLM:", e);
                throw new Error("Failed to get valid recommendations from the AI. The response was not valid JSON.");
            }
        }
        throw new Error('Failed to get valid recommendations from the AI. The output was empty or not in the expected format.');
    }

    // Validate the structured response against the Zod schema again, just to be sure.
    const validationResult = PlantRecommendationsOutputSchema.safeParse(structuredResponse);
    if (!validationResult.success) {
        console.error("AI response validation error:", validationResult.error.flatten());
        throw new Error('AI response did not match the expected output schema.');
    }

    return validationResult.data;
  }
);
