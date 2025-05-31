import { defineFlow, AIFunction } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/googleai'; // Assuming geminiPro is the desired model
import * as z from 'zod';
import { ai } from '@/ai/genkit'; // Import the configured 'ai' instance

// Define Zod schema for the flow input
export const GeneratePlantTipInputSchema = z.object({
  plantName: z.string().min(1, "Plant name cannot be empty."),
});

// Define Zod schema for the flow output
export const GeneratePlantTipOutputSchema = z.object({
  tip: z.string(),
});

// Prompt template
const tipGenerationPrompt = (plantName: string) =>
  `Generate a concise gardening tip for growing "${plantName}", suitable for a beginner.
Focus on one key aspect such as watering, sunlight, soil, or common pest prevention.
The tip should be easy to understand and actionable. Maximum 2-3 sentences.`;

// Define the Genkit flow
export const generatePlantTipFlow: AIFunction<typeof GeneratePlantTipInputSchema, typeof GeneratePlantTipOutputSchema> = defineFlow(
  {
    name: 'generatePlantTipFlow',
    inputSchema: GeneratePlantTipInputSchema,
    outputSchema: GeneratePlantTipOutputSchema,
    // Potentially add other configurations like auth, middleware if needed in a real app
  },
  async (input) => {
    const { plantName } = input;

    console.log(`Generating tip for plant: ${plantName}`);

    const llmResponse = await ai.generate({
      model: geminiPro, // Using the specific model from Google AI plugin
      prompt: tipGenerationPrompt(plantName),
      // You can add other generation parameters here if needed, like temperature, maxOutputTokens etc.
      // For example:
      // config: {
      //   temperature: 0.7,
      // },
    });

    const tipText = llmResponse.text();

    if (!tipText) {
      // This case should ideally be handled by more robust error checking or retries
      console.error("No text returned from LLM for plant tip.");
      throw new Error("Failed to generate a tip. The model did not return any text.");
    }

    console.log(`Generated tip for ${plantName}: ${tipText}`);

    return {
      tip: tipText,
    };
  }
);
