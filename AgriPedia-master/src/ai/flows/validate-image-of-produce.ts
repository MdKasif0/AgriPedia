//Validate if the image is a valid fruit or vegetable.
'use server';
/**
 * @fileOverview Validates if the image provided by the user is actually a valid image of a fruit or vegetable.
 *
 * - validateImageOfProduce - A function that validates if the image is a valid image of a fruit or vegetable.
 * - ValidateImageOfProduceInput - The input type for the validateImageOfProduce function.
 * - ValidateImageOfProduceOutput - The return type for the validateImageOfProduce function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateImageOfProduceInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a fruit or vegetable, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ValidateImageOfProduceInput = z.infer<typeof ValidateImageOfProduceInputSchema>;

const ValidateImageOfProduceOutputSchema = z.object({
  isValid: z.boolean().describe('Whether or not the image is a valid picture of a fruit or vegetable.'),
  reason: z.string().optional().describe('If the image is not valid, the reason why.'),
});
export type ValidateImageOfProduceOutput = z.infer<typeof ValidateImageOfProduceOutputSchema>;

export async function validateImageOfProduce(input: ValidateImageOfProduceInput): Promise<ValidateImageOfProduceOutput> {
  return validateImageOfProduceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateImageOfProducePrompt',
  input: {schema: ValidateImageOfProduceInputSchema},
  output: {schema: ValidateImageOfProduceOutputSchema},
  prompt: `You are an AI image analysis expert with a specific task: to validate whether an image primarily features a recognizable fruit or vegetable. Your reasoning should be based on visual evidence.
Critically assess the provided image.
- If the image clearly shows a fruit or vegetable, set 'isValid' to true.
- If the image does NOT clearly show a fruit or vegetable (e.g., it's a picture of a car, an animal, a landscape, or an abstract pattern), set 'isValid' to false and provide a concise 'reason' explaining why it's not a valid image of produce.
Respond with a JSON object.
Here is the image: {{media url=photoDataUri}}`,
});

const validateImageOfProduceFlow = ai.defineFlow(
  {
    name: 'validateImageOfProduceFlow',
    inputSchema: ValidateImageOfProduceInputSchema,
    outputSchema: ValidateImageOfProduceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

