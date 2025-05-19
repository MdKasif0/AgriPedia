
'use server';

import { identifyFruitOrVegetableFromImage, IdentifyFruitOrVegetableFromImageOutput } from '@/ai/flows/identify-fruit-or-vegetable-from-image';
import { validateImageOfProduce, ValidateImageOfProduceOutput } from '@/ai/flows/validate-image-of-produce';
import { generateRecipes, GenerateRecipesOutput } from '@/ai/flows/generate-recipes-flow';

interface ProcessImageResult {
  success: boolean;
  message?: string;
  data?: IdentifyFruitOrVegetableFromImageOutput;
}

export async function processImageWithAI(photoDataUri: string): Promise<ProcessImageResult> {
  if (!photoDataUri || !photoDataUri.startsWith('data:image')) {
    return { success: false, message: 'Invalid image data provided.' };
  }

  try {
    const validationResult: ValidateImageOfProduceOutput = await validateImageOfProduce({ photoDataUri });

    if (!validationResult.isValid) {
      return { success: false, message: validationResult.reason || 'Image is not a valid fruit or vegetable.' };
    }

    const identificationResult: IdentifyFruitOrVegetableFromImageOutput = await identifyFruitOrVegetableFromImage({ photoDataUri });
    
    if (!identificationResult.isFruitOrVegetable) {
        return { success: false, message: 'Could not identify a fruit or vegetable in the image.' };
    }

    return { success: true, data: identificationResult };

  } catch (error) {
    console.error('AI processing error:', error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during AI processing.';
    return { success: false, message: `AI processing failed: ${errorMessage}` };
  }
}

export async function fetchRecipesForProduce(produceName: string): Promise<GenerateRecipesOutput | null> {
  if (!produceName) {
    console.error('Produce name is required to fetch recipes.');
    return null;
  }
  try {
    const result = await generateRecipes({ produceName });
    return result;
  } catch (error) {
    console.error(`Error fetching recipes for ${produceName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while fetching recipes.';
    // Optionally, you could throw a more specific error or return an error structure
    // For now, returning null to indicate failure to the client.
    return null; 
  }
}
