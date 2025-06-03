// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow that identifies a fruit or vegetable from an image.
 *
 * - identifyFruitOrVegetableFromImage - A function that takes an image and returns the identified fruit or vegetable.
 * - IdentifyFruitOrVegetableFromImageInput - The input type for the identifyFruitOrVegetableFromImage function.
 * - IdentifyFruitOrVegetableFromImageOutput - The output type for the identifyFruitOrVegetableFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyFruitOrVegetableFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a fruit or vegetable, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type IdentifyFruitOrVegetableFromImageInput = z.infer<
  typeof IdentifyFruitOrVegetableFromImageInputSchema
>;

const IdentifyFruitOrVegetableFromImageOutputSchema = z.object({
  isFruitOrVegetable: z
    .boolean()
    .describe('Whether or not the input is a fruit or vegetable.'),
  commonName: z
    .string()
    .describe('The common name of the identified fruit or vegetable.'),
  scientificName: z
    .string()
    .describe('The scientific name of the identified fruit or vegetable.'),
  confidence: z
    .number()
    .min(0).max(1) // Ensure confidence is between 0 and 1
    .describe(
      'A number, between 0 and 1 inclusive, indicating the confidence in the identification.'
    ),
});
export type IdentifyFruitOrVegetableFromImageOutput = z.infer<
  typeof IdentifyFruitOrVegetableFromImageOutputSchema
>;

export async function identifyFruitOrVegetableFromImage(
  input: IdentifyFruitOrVegetableFromImageInput
): Promise<IdentifyFruitOrVegetableFromImageOutput> {
  return identifyFruitOrVegetableFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyFruitOrVegetableFromImagePrompt',
  input: {schema: IdentifyFruitOrVegetableFromImageInputSchema},
  output: {schema: IdentifyFruitOrVegetableFromImageOutputSchema},
  prompt: `You are an expert in identifying fruits and vegetables from images.
  Analyze the image provided.
  Determine if the image primarily contains a fruit or vegetable.
  If it is, provide its common name, scientific name, and a confidence score between 0.0 and 1.0 for your identification.
  If it is not a fruit or vegetable, or if you cannot identify it with reasonable confidence, set 'isFruitOrVegetable' to false and commonName/scientificName to empty strings or "Unknown".
  Respond with a JSON object matching the defined output schema.
  Here is the image: {{media url=photoDataUri}}
  `,
});

const identifyFruitOrVegetableFromImageFlow = ai.defineFlow(
  {
    name: 'identifyFruitOrVegetableFromImageFlow',
    inputSchema: IdentifyFruitOrVegetableFromImageInputSchema,
    outputSchema: IdentifyFruitOrVegetableFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure fallback for nullish output to prevent runtime errors
    if (!output) {
      return {
        isFruitOrVegetable: false,
        commonName: "Unknown",
        scientificName: "Unknown",
        confidence: 0
      };
    }
    return output;
  }
);
