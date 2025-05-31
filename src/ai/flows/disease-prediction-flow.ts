import { defineFlow, runFlow } from 'genkit';
import { z } from 'zod';
import { ai } from '@/ai/genkit'; // Assuming genkit setup is in src/ai/genkit.ts
// Removed: import { media } from 'genkit/media';

// Define input schema: Image of a plant part
const PlantImageInputSchema = z.object({
  imageDataUrl: z.string().url().describe('Image of a plant leaf or soil, encoded as a data URL.'),
  context: z.string().optional().describe('Optional context, e.g., "tomato plant leaf", "sandy soil sample"'),
});

// Define output schema: Detected issues
const DetectedIssueSchema = z.object({
  issueType: z.enum(['disease', 'pest', 'deficiency', 'unknown']).describe('Type of issue detected'),
  name: z.string().describe('Name of the disease, pest, or deficiency (e.g., "Powdery Mildew", "Aphids", "Nitrogen Deficiency")'),
  description: z.string().describe('Brief description of the issue and its common symptoms.'),
  confidenceScore: z.number().min(0).max(1).describe('Confidence score for the detection (0 to 1)'),
  recommendedAction: z.string().optional().describe('Brief suggestion for addressing the issue'),
});

export const diseasePredictionFlow = defineFlow(
  {
    name: 'diseasePredictionFlow',
    inputSchema: PlantImageInputSchema,
    outputSchema: z.array(DetectedIssueSchema),
    description: 'Analyzes an image of a plant leaf or soil to detect pests, diseases, or nutrient deficiencies.',
  },
  async ({ imageDataUrl, context }) => { // Updated signature
    // const { image, context } = input; // Old destructuring

    if (!imageDataUrl) { // Updated check
      // This check is a bit simplistic. Genkit media helper might store it differently.
      // In a real scenario, you'd ensure the image data is accessible to the model.
      // For Gemini, it expects a `url` (data URL or GCS) or `mediaType` and `data`.
      throw new Error('Image Data URL is missing or image data is not in the expected format.');
    }

    const prompt = [
      { text: `
        You are an expert plant pathologist and soil scientist.
        Analyze the provided image of a plant part (leaf, stem, fruit, or soil sample).
        Identify potential diseases, pests, or nutrient deficiencies.
        For each identified issue, provide its type (disease, pest, deficiency), name, a brief description, a confidence score (0.0 to 1.0), and a short recommended action.
        If multiple issues are present, list them all. If no specific issue is confidently identified, you can return an empty array or an "unknown" issue with a low confidence.
        ${context ? `Additional context for the image: ${context}` : ''}
        Format your response as a JSON array of objects, where each object has "issueType", "name", "description", "confidenceScore", and "recommendedAction".
        Example: [{"issueType": "disease", "name": "Early Blight", "description": "Fungal disease causing dark lesions on leaves.", "confidenceScore": 0.85, "recommendedAction": "Apply fungicide and improve air circulation."}]
      `},
      { media: { url: imageDataUrl } } // Updated media part
    ];

    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.0-flash', // Ensure this model supports image input
      config: {
        temperature: 0.5, // Lower temperature for more factual/less creative responses
      },
      output: {
        format: 'json',
        schema: z.array(DetectedIssueSchema)
      }
    });

    const issues = llmResponse.output();

    if (!issues) {
      // Return empty array if AI gives no output, rather than throwing error,
      // as it might legitimately find no issues.
      return [];
    }

    return issues;
  }
);

// Example usage (for testing purposes)
export async function getDiseasePrediction(imageDataUrl: string, context?: string) { // Updated signature
  return await runFlow(diseasePredictionFlow, { imageDataUrl, context });
}
