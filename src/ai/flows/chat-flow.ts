'use server';
/**
 * @fileOverview A conversational AI flow for AgriPedia.
 *
 * - chatWithAgriBot - A function that handles the chat interaction.
 * - ChatInput - The input type for the chatWithAgriBot function.
 * - ChatOutput - The return type for the chatWithAgriBot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
  prompt: `You are AgriBot, a friendly, knowledgeable, and concise assistant for AgriPedia, an encyclopedia for fruits and vegetables.
Your primary goal is to provide helpful information about various produce items, their nutritional facts, cultivation, recipes, and health benefits.
You can also answer general questions related to agriculture and healthy eating.
Keep your responses focused and to the point. Avoid making up information if you don't know the answer; politely state that you don't have the specific information.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'agriPediaChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await chatPrompt.generate(input);
      if (output && output.response) {
        return output;
      }
      return { response: "I'm not sure how to respond to that. Could you try rephrasing?" };
    } catch (error) {
      console.error("Error in chatFlow with AgriBot:", error);
      return { response: "I encountered a small issue. Please try asking again in a moment." };
    }
  }
);
