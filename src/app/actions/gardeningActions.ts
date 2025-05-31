'use server';

import { runFlow } from '@genkit-ai/flow';
import { suggestPlantsFlow, SuggestPlantsInputSchema } from '@/ai/flows/suggest-plants-flow';
import * as z from 'zod';

// Ensure Genkit environment is initialized (especially if not running via Genkit tools directly)
// This might involve importing from '@/ai/dev.ts' or a specific init file if needed,
// but often 'use server' actions can directly use imported flows if Genkit is configured project-wide.
// For now, we assume direct import works. If issues arise, check Genkit initialization for server-side execution.
import '@/ai/dev'; // This ensures flows are loaded when action is invoked.

export async function getPlantSuggestions(
  input: z.infer<typeof SuggestPlantsInputSchema>
) {
  // Validate input again at the server action boundary (optional but good practice)
  const parsedInput = SuggestPlantsInputSchema.safeParse(input);
  if (!parsedInput.success) {
    console.error('Server Action: Invalid input for getPlantSuggestions', parsedInput.error);
    // Return a more structured error or throw
    return { suggestions: [], error: 'Invalid input provided.', message: '' };
  }

  try {
    console.log('Server Action: Calling suggestPlantsFlow with input:', parsedInput.data);
    const flowResult = await runFlow(suggestPlantsFlow, parsedInput.data);
    console.log('Server Action: Received result from suggestPlantsFlow:', flowResult);

    return {
      suggestions: flowResult.suggestions,
      message: flowResult.message || '', // Ensure message is always a string
      error: null
    };
  } catch (e: any) {
    console.error('Server Action: Error calling suggestPlantsFlow:', e);
    return {
      suggestions: [],
      error: e.message || 'An unexpected error occurred while getting suggestions.',
      message: ''
    };
  }
}

// Server action for generating a plant tip
import { generatePlantTipFlow, GeneratePlantTipInputSchema } from '@/ai/flows/generate-plant-tip-flow';

export async function getPlantTip(
  input: z.infer<typeof GeneratePlantTipInputSchema>
) {
  const parsedInput = GeneratePlantTipInputSchema.safeParse(input);
  if (!parsedInput.success) {
    console.error('Server Action: Invalid input for getPlantTip', parsedInput.error);
    return { tip: null, error: 'Invalid input: Plant name cannot be empty.' };
  }

  try {
    console.log('Server Action: Calling generatePlantTipFlow with input:', parsedInput.data);
    const flowResult = await runFlow(generatePlantTipFlow, parsedInput.data);
    console.log('Server Action: Received result from generatePlantTipFlow:', flowResult);

    return {
      tip: flowResult.tip,
      error: null
    };
  } catch (e: any) {
    console.error('Server Action: Error calling generatePlantTipFlow:', e);
    return {
      tip: null,
      error: e.message || 'An unexpected error occurred while generating the tip.'
    };
  }
}
