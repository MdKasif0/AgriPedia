// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow that identifies a plant disease from an image.
 *
 * - identifyPlantDiseaseFromImage - A function that takes an image and returns information about any identified plant disease.
 * - IdentifyPlantDiseaseFromImageInput - The input type for the identifyPlantDiseaseFromImage function.
 * - IdentifyPlantDiseaseFromImageOutput - The output type for the identifyPlantDiseaseFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPlantDiseaseFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a plant part (leaf, stem, fruit, etc.), as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type IdentifyPlantDiseaseFromImageInput = z.infer<
  typeof IdentifyPlantDiseaseFromImageInputSchema
>;

const IdentifyPlantDiseaseFromImageOutputSchema = z.object({
  isPlantMaterial: z.boolean().describe('Whether the image appears to contain plant material (leaf, stem, fruit, etc.).'),
  hasDisease: z.boolean().describe('Whether a plant disease is confidently detected in the image.'),
  diseaseName: z.string().describe('The common name of the identified plant disease (e.g., "Powdery Mildew", "Rust", "Unknown" if no disease is detected or if unsure).'),
  plantPartAffected: z.string().describe('The part of the plant that appears to be affected (e.g., "Leaf", "Stem", "Fruit", "General", "Unknown").'),
  confidence: z.number().min(0).max(1).describe('A number, between 0 and 1 inclusive, indicating the confidence in the disease identification. If no disease is detected, this can be 0.'),
  briefDescription: z.string().describe('A brief description of the identified disease or observation.'),
  possibleCauses: z.string().describe('Common possible causes for the identified disease (e.g., "High humidity and poor air circulation", "Fungal spores spread by wind/water splash", "Nutrient deficiency"). Provide general causes if specific disease is unknown but symptoms are visible.'),
  initialRecommendations: z.string().describe('General initial recommendations for managing the issue (e.g., "Isolate the affected plant if possible to prevent spread.", "Improve air circulation around plants.", "Remove and destroy affected leaves.", "Consider applying an appropriate fungicide or organic treatment if the issue is widespread."). Provide general care tips if no disease is found.')
});
export type IdentifyPlantDiseaseFromImageOutput = z.infer<
  typeof IdentifyPlantDiseaseFromImageOutputSchema
>;

export async function identifyPlantDiseaseFromImage(
  input: IdentifyPlantDiseaseFromImageInput
): Promise<IdentifyPlantDiseaseFromImageOutput> {
  return identifyPlantDiseaseFromImageFlow(input);
}

const identifyPlantDiseaseFromImagePrompt = ai.definePrompt({
  name: 'identifyPlantDiseaseFromImagePrompt',
  input: {schema: IdentifyPlantDiseaseFromImageInputSchema},
  output: {schema: IdentifyPlantDiseaseFromImageOutputSchema},
  prompt: `You are an expert plant pathologist.
Analyze the provided image of a plant part (leaf, stem, fruit, etc.).
First, determine if the image clearly shows plant material. If not, set 'isPlantMaterial' to false and provide neutral/uninformative values for other fields.
If it is plant material, examine it for signs of common plant diseases or distress.
If a disease is identified with reasonable confidence, set 'hasDisease' to true and provide its common name, the plant part affected, a confidence score (0.0-1.0), a brief description of the disease, common possible causes, and general initial recommendations for management.
If no specific disease is confidently identified but the plant shows signs of stress, set 'hasDisease' to false (or true if general stress is considered a "disease" state for this context), 'diseaseName' to "General Stress" or "Unknown", and provide observations and general care tips.
If the plant material appears healthy, set 'hasDisease' to false, 'diseaseName' to "Healthy", and provide positive affirmation or general care tips.
Respond with a JSON object matching the defined output schema.
Ensure 'confidence' is 0 if 'hasDisease' is false or if 'isPlantMaterial' is false.
Here is the image: {{media url=photoDataUri}}
  `,
});

const identifyPlantDiseaseFromImageFlow = ai.defineFlow(
  {
    name: 'identifyPlantDiseaseFromImageFlow',
    inputSchema: IdentifyPlantDiseaseFromImageInputSchema,
    outputSchema: IdentifyPlantDiseaseFromImageOutputSchema,
  },
  async input => {
    const {output} = await identifyPlantDiseaseFromImagePrompt(input);
    // Ensure fallback for nullish output to prevent runtime errors
    if (!output) {
      return {
        isPlantMaterial: false,
        hasDisease: false,
        diseaseName: "Unknown",
        plantPartAffected: "Unknown",
        confidence: 0,
        briefDescription: "Could not analyze image or no plant material detected.",
        possibleCauses: "N/A",
        initialRecommendations: "Ensure the image is clear and shows a plant part."
      };
    }
    return output;
  }
);
