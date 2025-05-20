
'use server';
/**
 * @fileOverview Generates a random interesting tip or fun fact about fruits, vegetables, or agriculture.
 *
 * - generateAgriTip - A function that returns a single tip.
 * - GenerateAgriTipOutput - The return type for the generateAgriTip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// No input schema needed for a simple tip generator
// export type GenerateAgriTipInput = z.infer<typeof GenerateAgriTipInputSchema>;

const GenerateAgriTipOutputSchema = z.object({
  tip: z.string().describe('A concise and engaging tip or fun fact related to fruits, vegetables, or general agriculture. Should be 1-2 sentences long.'),
});
export type GenerateAgriTipOutput = z.infer<typeof GenerateAgriTipOutputSchema>;

export async function generateAgriTip(): Promise<GenerateAgriTipOutput> {
  return generateAgriTipFlow({}); // Pass empty object if no input schema
}

const prompt = ai.definePrompt({
  name: 'generateAgriTipPrompt',
  // input: {schema: NoInputSchema}, // No specific input needed
  output: {schema: GenerateAgriTipOutputSchema},
  prompt: `You are an agricultural expert and food enthusiast. Your goal is to provide a single, interesting, and concise tip or fun fact about fruits, vegetables, farming, or healthy eating. Make it engaging and easy to understand for a general audience.

Examples:
- "Did you know? Storing apples with potatoes can prevent the potatoes from sprouting!"
- "Tomatoes are botanically fruits, but legally vegetables in the US!"
- "Broccoli contains more Vitamin C per serving than an orange."
- "Carrots were originally purple before Dutch growers cultivated orange varieties in the 17th century."
- "Bananas are slightly radioactive due to their potassium content, but you'd need to eat millions to feel any effect."

Generate one such tip or fun fact. Respond with a JSON object.
  `,
});

const generateAgriTipFlow = ai.defineFlow(
  {
    name: 'generateAgriTipFlow',
    // inputSchema: NoInputSchema, // No specific input schema
    outputSchema: GenerateAgriTipOutputSchema,
  },
  async () => {
    const {output} = await prompt({}); // Call prompt with empty object
    return output || { tip: "Stay curious and keep exploring the world of produce!" }; // Fallback tip
  }
);
