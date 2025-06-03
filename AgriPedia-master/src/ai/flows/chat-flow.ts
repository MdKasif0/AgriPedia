
'use server';
/**
 * @fileOverview A conversational AI flow for AgriPedia.
 *
 * - chatWithAgriBot - A function that handles the chat interaction.
 * - ChatInput - The input type for the chatWithAgriBot function.
 * - ChatOutput - The return type for the chatWithAgriBot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']).describe("The role of the message sender, either 'user' or 'model' (AI)."),
  content: z.string().describe("The content of the message."),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatInputSchema = z.object({
  message: z.string().describe("The user's current message to the AI."),
  history: z.array(ChatMessageSchema).optional().describe("Optional. The preceding chat messages to provide context. Should be an array of objects with 'role' and 'content'."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user's message."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAgriBot(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'agriPediaChatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are AgriBot, a friendly, knowledgeable, and concise assistant for AgriPedia, an encyclopedia for fruits and vegetables.
Your primary goal is to provide helpful information about various produce items, their nutritional facts, cultivation, recipes, and health benefits.
You can also answer general questions related to agriculture and healthy eating.
Keep your responses focused and to the point. Avoid making up information if you don't know the answer; politely state that you don't have the specific information.

{{#if history}}
Previous conversation:
{{#each history}}
{{#if (eq role "user")}}User: {{content}}{{/if}}
{{#if (eq role "model")}}AgriBot: {{content}}{{/if}}
{{/each}}
{{/if}}

User's current message: {{{message}}}
AgriBot:
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'agriPediaChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await chatPrompt(input);
      if (output && output.response) {
        return output;
      }
      // Fallback if the model returns nothing or an empty response
      return { response: "I'm not sure how to respond to that. Could you try rephrasing?" };
    } catch (error) {
      console.error("Error in chatFlow with AgriBot:", error);
      // Fallback for unexpected errors during flow execution
      return { response: "I encountered a small issue. Please try asking again in a moment." };
    }
  }
);
