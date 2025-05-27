import { defineFlow } from 'genkit'; // Corrected import path
import { ai } from '../genkit'; // Corrected import path for ai instance
import * as z from 'zod';

// Define the input schema for the chat flow
export const chatInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."), // User's message
});

// Define the output schema for the chat flow
export const chatOutputSchema = z.object({
  response: z.string(), // AI's response
});

// Define the Genkit flow for conversational AI
export const chatWithAgriAI = defineFlow(
  {
    name: 'chatWithAgriAI',
    inputSchema: chatInputSchema,
    outputSchema: chatOutputSchema,
    description: 'A conversational AI flow for AgriPedia to answer user queries related to agriculture or general topics.',
  },
  async (input) => {
    const { message } = input;

    // Construct a prompt for the AI model
    const prompt = `User query: "${message}". Provide a helpful and concise response. If the query is related to agriculture (e.g., farming, crops, pests, soil, agricultural technology, etc.), focus on providing accurate agricultural information. If the query is not related to agriculture, provide a general helpful response.`;

    // Generate a response using the configured AI model
    const llmResponse = await ai.generate({
      prompt: prompt,
      // The model is implicitly taken from the 'ai' instance configuration in src/ai/genkit.ts
      // which is 'googleai/gemini-2.0-flash'
    });

    const responseText = llmResponse.text();
    if (!responseText) {
        throw new Error("Failed to generate a response from the AI model.");
    }

    return {
      response: responseText,
    };
  }
);

// Export the flow (already done by using 'export const chatWithAgriAI')
// To make it discoverable by the Genkit CLI for `genkit flow list`,
// we can also export it as part of a default object if needed,
// but for direct import into dev.ts, named export is sufficient.
// For example, some setups might prefer:
// export default { chatWithAgriAI };
// However, the current pattern in dev.ts seems to use named imports.
// So, 'export const chatWithAgriAI' is fine.
