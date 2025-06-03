import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Create a model instance
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Create a chat instance
export const ai = {
  definePrompt: ({ prompt }: { prompt: string }) => ({
    async generate(input: any) {
      const chat = model.startChat({
        history: input.history?.map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })) || [],
      });

      const result = await chat.sendMessage(input.message);
      const response = await result.response;
      return {
        output: {
          response: response.text(),
        },
      };
    },
  }),
  defineFlow: (_: any, fn: Function) => fn,
};
