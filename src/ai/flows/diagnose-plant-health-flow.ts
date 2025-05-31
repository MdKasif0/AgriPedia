import { defineFlow, run, generate, definePrompt } from '@genkit-ai/ai';
import { geminiProVision } from '../genkit'; // Assuming geminiProVision for multimodal input
import * as z from 'zod';
import { logger } from '@genkit-ai/core/logging'; // For logging

// 1. Define Input Schema
export const DiagnosePlantHealthInputSchema = z.object({
  imageDataUri: z.string().describe('Base64 encoded image data URI of the plant.'),
});

// 2. Define Output Schema
export const DiagnosisSchema = z.object({
  problem: z.string().describe('Identified problem (e.g., "Powdery Mildew", "Aphids", "Nitrogen Deficiency", "Healthy").'),
  description: z.string().describe('A brief description of the problem or a statement of health.'),
  confidence: z.number().min(0).max(1).describe('Confidence score in the diagnosis (0.0 to 1.0).'),
});

export const TreatmentSchema = z.object({
  name: z.string().describe('Name of the treatment method or product.'),
  steps: z.string().describe('Application steps for the treatment.'),
  precautions: z.string().optional().describe('Important precautions if suggesting chemical treatments.'),
});

export const DiagnosePlantHealthOutputSchema = z.object({
  isHealthy: z.boolean().describe('True if the plant is diagnosed as healthy, false otherwise.'),
  diagnosis: DiagnosisSchema,
  organicTreatments: z.array(TreatmentSchema).optional().describe('Suggested organic treatment options.'),
  chemicalTreatments: z.array(TreatmentSchema).optional().describe('Suggested chemical treatment options.'),
});

// Define the prompt for the Gemini model
const diagnosePlantHealthPrompt = definePrompt(
    {
        name: 'diagnosePlantHealthPrompt',
        inputSchema: DiagnosePlantHealthInputSchema,
        outputSchema: DiagnosePlantHealthOutputSchema, // Optional: for type hinting if not using direct JSON output with schema
    },
    async (input) => {
        return {
            prompt: `You are an expert plant pathologist and botanist. Analyze the provided image of a plant.
Identify potential diseases, pests, or nutrient deficiencies.
If the plant appears healthy, clearly state that.
Provide a primary diagnosis including the problem, a description of it, and your confidence level (0.0 to 1.0).
Suggest 1-2 organic treatment options and, if applicable and severe, 1-2 chemical treatment options. For each treatment, provide the name and concise application steps.
If suggesting chemical treatments, include any important safety precautions.

Important: Respond in a valid JSON format according to the following structure:
{
  "isHealthy": boolean, // true if plant is healthy, false otherwise
  "diagnosis": {
    "problem": "string", // e.g., "Powdery Mildew", "Aphids", "Healthy"
    "description": "string",
    "confidence": number // 0.0 to 1.0
  },
  "organicTreatments": [ // Optional: include if not healthy
    { "name": "string", "steps": "string" }
  ],
  "chemicalTreatments": [ // Optional: include if not healthy and applicable
    { "name": "string", "steps": "string", "precautions": "string (optional)" }
  ]
}

Image: {{media url=${input.imageDataUri}}}
`,
            output: {
                format: 'json',
                // Optional: Pass the schema directly to the model if supported and configured for stricter output adherence.
                // schema: DiagnosePlantHealthOutputSchema
            }
        };
    }
);


// 3. Create the Genkit Flow
export const diagnosePlantHealthFlow = defineFlow(
  {
    name: 'diagnosePlantHealthFlow',
    inputSchema: DiagnosePlantHealthInputSchema,
    outputSchema: DiagnosePlantHealthOutputSchema,
  },
  async (input) => {
    logger.info('Starting plant health diagnosis flow for an image.');

    const llmResponse = await run("call-gemini-vision", async () =>
        generate({
            model: geminiProVision, // Use the vision model
            prompt: await diagnosePlantHealthPrompt.generate({input}),
            config: {
                temperature: 0.3, // Lower temperature for more factual diagnosis
            },
            // Ensure direct JSON output with schema is used if available for this model
            // This might require specific model configuration or wrapper.
            // If not, manual parsing of llmResponse.text() is the fallback.
             output: { // This might be redundant if specified in prompt, but good for clarity
                 format: 'json',
                 schema: DiagnosePlantHealthOutputSchema
             }
        })
    );

    let structuredResponse = llmResponse.output();

    if (!structuredResponse) {
        logger.warn("LLM output was null or undefined. Attempting to parse from text.");
        const textOutput = llmResponse.text();
        if (textOutput) {
            try {
                structuredResponse = JSON.parse(textOutput);
            } catch (e) {
                logger.error("Error parsing text output from LLM:", e);
                throw new Error("Failed to get valid diagnosis from the AI. The response was not valid JSON.");
            }
        } else {
            logger.error("No text output available from LLM to parse.");
            throw new Error('Failed to get a diagnosis from the AI. The output was empty.');
        }
    }

    const validationResult = DiagnosePlantHealthOutputSchema.safeParse(structuredResponse);
    if (!validationResult.success) {
        logger.error("AI response validation error:", validationResult.error.flatten());
        console.error("Invalid response structure:", JSON.stringify(structuredResponse, null, 2));
        throw new Error('AI response did not match the expected output schema.');
    }

    logger.info('Successfully diagnosed plant health.');
    return validationResult.data;
  }
);
