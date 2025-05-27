import { defineFlow } from '@genkit-ai/flow';
import * as z from 'zod';

// Define the input schema for the chat flow
export const chatInputSchema = z.object({
  message: z.string(),
});

// Define the output schema for the chat flow
export const chatOutputSchema = z.object({
  response: z.string(),
});

// Define the chat assistant flow
export const chatAssistantFlow = defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: chatInputSchema,
    outputSchema: chatOutputSchema,
  },
  async (input: z.infer<typeof chatInputSchema>) => {
    console.log('Received message in chatAssistantFlow:', input.message);
    // Simulate AI processing
    const mockResponse = `This is a mock AI response to: "${input.message}"`;
    return { response: mockResponse };
  }
);

// Note: No default export needed if you're importing the specific flow by name.
// If a default export is desired for some reason, it would be:
// export default chatAssistantFlow;
// However, named exports are generally preferred for clarity with multiple flows.
