'use server';
/**
 * @fileOverview Generates a single, concise agricultural tip or fun fact.
 *
 * - generateAgriTip - A function that returns a single agri tip.
 * - GenerateAgriTipOutput - The return type for the generateAgriTip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgriTipOutputSchema = z.object({
  tip: z.string().describe('A concise and interesting agricultural tip, fun fact about fruits/vegetables, or a gardening suggestion. The tip should be engaging and informative for a general audience. Aim for 1-2 sentences.'),
});
export type GenerateAgriTipOutput = z.infer<typeof GenerateAgriTipOutputSchema>;

export async function generateAgriTip(): Promise<GenerateAgriTipOutput> {
  return generateAgriTipFlow();
}

const prompt = ai.definePrompt({
  name: 'generateAgriTipPrompt',
  output: {schema: GenerateAgriTipOutputSchema},
  prompt: `You are a helpful assistant for an app called AgriPedia, which is an encyclopedia for fruits and vegetables.
Your task is to generate a single, concise, and interesting agricultural tip, a fun fact about fruits or vegetables, or a simple gardening suggestion.
The tip should be engaging and informative for a general audience.
Aim for 1-2 sentences.
Respond with a JSON object matching the defined output schema.
Example: "Did you know? Storing apples with potatoes can prevent the potatoes from sprouting!"
Another Example: "To keep your herbs fresh longer, trim the stems and place them in a glass of water like cut flowers."
`,
});

const generateAgriTipFlow = ai.defineFlow(
  {
    name: 'generateAgriTipFlow',
    outputSchema: GenerateAgriTipOutputSchema,
  },
  async () => {
    try {
      const {output} = await prompt({});
      // Ensure we always return an object with a tip string, even if empty or if output is nullish
      return output || { tip: "Keep exploring the fascinating world of produce!" };
    } catch (error) {
      console.error("Error in generateAgriTipFlow:", error);
      return { tip: "Did you know? Eating a variety of colorful fruits and vegetables is great for your health!" };
    }
  }
);
