import { defineFlow, run, generate, definePrompt } from '@genkit-ai/ai';
import { geminiPro } from '../genkit'; // Assuming geminiPro for text-based tasks
import * as z from 'zod';
import { logger } from '@genkit-ai/core/logging';

// 1. Define Input Schema
export const PersonalizedPlantTipInputSchema = z.object({
  plantType: z.string().min(1, "Plant type is required."),
  recentLogs: z.string().min(1, "Recent observation/log is required."),
});

// 2. Define Output Schema
export const PersonalizedPlantTipOutputSchema = z.object({
  tip: z.string().describe("A concise, actionable gardening tip."),
});

// Define the prompt for the Gemini model
const personalizedPlantTipPrompt = definePrompt(
    {
        name: 'personalizedPlantTipPrompt',
        inputSchema: PersonalizedPlantTipInputSchema,
        // Output schema can be optionally defined here for type hinting
        // outputSchema: PersonalizedPlantTipOutputSchema,
    },
    async (input) => {
        return {
            prompt: `You are an AI gardening assistant providing helpful, concise advice.
The user is growing: ${input.plantType}.
Their recent observation or log entry is: "${input.recentLogs}".

Based on this information, provide a single, actionable tip.
- If the log indicates a specific issue or observation, tailor the tip to address that.
- If the log is very generic (e.g., "looking good", "no change"), provide a relevant general care tip for ${input.plantType}.
- The tip should be encouraging and easy to understand.

Format your response as a valid JSON object with a single key "tip".

Example 1 (specific log):
User log: "Leaves on my Fiddle Leaf Fig are browning at the edges."
Tip: "Brown edges on your Fiddle Leaf Fig could indicate inconsistent watering or low humidity. Try to water only when the top inch of soil is dry and consider misting the leaves or using a humidifier."

Example 2 (generic log):
User log: "My snake plant seems fine."
Tip: "Glad your snake plant is doing well! They thrive on neglect, so be sure not to overwater it – allow the soil to dry out completely between waterings."

Example 3 (positive log):
User log: "My basil is growing so fast!"
Tip: "That's great your basil is thriving! To encourage even bushier growth, pinch off the top sets of leaves regularly."
`,
            output: {
                format: 'json',
                // schema: PersonalizedPlantTipOutputSchema // Optional: For stricter model output adherence
            }
        };
    }
);

// 3. Create the Genkit Flow
export const generatePersonalizedPlantTipFlow = defineFlow(
  {
    name: 'generatePersonalizedPlantTipFlow',
    inputSchema: PersonalizedPlantTipInputSchema,
    outputSchema: PersonalizedPlantTipOutputSchema,
  },
  async (input) => {
    logger.info(`Generating personalized tip for plant: ${input.plantType}`);

    const llmResponse = await run("call-gemini-for-tip", async () =>
        generate({
            model: geminiPro,
            prompt: await personalizedPlantTipPrompt.generate({input}),
            config: {
                temperature: 0.75, // Allow for some creativity in tips
            },
            output: { // Ensure JSON output
                 format: 'json',
                 schema: PersonalizedPlantTipOutputSchema
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
                logger.error("Error parsing text output from LLM for tip:", e);
                throw new Error("Failed to get a valid tip from the AI. The response was not valid JSON.");
            }
        } else {
            logger.error("No text output available from LLM for tip.");
            throw new Error('Failed to get a tip from the AI. The output was empty.');
        }
    }

    const validationResult = PersonalizedPlantTipOutputSchema.safeParse(structuredResponse);
    if (!validationResult.success) {
        logger.error("AI tip response validation error:", validationResult.error.flatten());
        console.error("Invalid tip response structure:", JSON.stringify(structuredResponse, null, 2));
        throw new Error('AI tip response did not match the expected output schema.');
    }

    logger.info(`Successfully generated tip: ${validationResult.data.tip}`);
    return validationResult.data;
  }
);
