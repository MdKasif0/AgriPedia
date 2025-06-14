'use server';
/**
 * @fileOverview Generates recipes based on a given produce name.
 *
 * - generateRecipes - A function that takes a produce name and returns a list of recipe ideas.
 * - GenerateRecipesInput - The input type for the generateRecipes function.
 * - GenerateRecipesOutput - The return type for the generateRecipes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateRecipesInputSchema = z.object({
  produceName: z.string().describe('The name of the fruit or vegetable to generate recipes for.'),
});
export type GenerateRecipesInput = z.infer<typeof GenerateRecipesInputSchema>;

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  description: z.string().describe('A short, appealing description of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of main ingredients for the recipe. Include quantities if appropriate for a simple recipe idea.'),
  steps: z.array(z.string()).describe('Step-by-step instructions for preparing the recipe.'),
});

const GenerateRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('A list of 2-3 generated recipes.'),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  return generateRecipesFlow(input);
}

const prompt = ai.definePrompt({
  prompt: `You are a helpful culinary assistant. Your goal is to provide 2-3 simple, healthy, and distinct recipe ideas for a given fruit or vegetable.

For each recipe, please provide:
1.  A creative and appealing "name".
2.  A brief "description" (1-2 sentences).
3.  A list of key "ingredients" (e.g., "1 cup [produce], chopped", "1 tbsp olive oil", "Pinch of salt").
4.  A few concise "steps" for preparation.

Focus on recipes that highlight the produce and are generally considered healthy. Aim for variety in the types of recipes (e.g., a salad, a cooked dish, a beverage if appropriate).`,
});

const generateRecipesFlow = ai.defineFlow(
  {
    name: 'generateRecipesFlow',
    inputSchema: GenerateRecipesInputSchema,
    outputSchema: GenerateRecipesOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt.generate(input);
      if (output && output.recipes) {
        return output;
      }
      return { recipes: [] };
    } catch (error) {
      console.error("Error in generateRecipesFlow:", error);
      return { recipes: [] };
    }
  }
);
