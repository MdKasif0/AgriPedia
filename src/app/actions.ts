
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
    return { success: false, message: 'Invalid image data provided. Please ensure it is a data URI.' };
  }

  try {
    // Step 1: Validate if the image appears to be of produce
    const validationResult: ValidateImageOfProduceOutput = await validateImageOfProduce({ photoDataUri });

    if (!validationResult.isValid) {
      return { success: false, message: validationResult.reason || 'Image does not appear to be a valid fruit or vegetable.' };
    }

    // Step 2: Identify the specific fruit or vegetable
    const identificationResult: IdentifyFruitOrVegetableFromImageOutput = await identifyFruitOrVegetableFromImage({ photoDataUri });
    
    // Check if the AI confidently identified it as a fruit or vegetable
    if (!identificationResult.isFruitOrVegetable) {
        return { success: false, message: 'Could not identify a specific fruit or vegetable in the image. Please try a clearer image.' };
    }
    
    // Check if a common name was actually returned
    if (!identificationResult.commonName || identificationResult.commonName.trim() === "") {
        return { success: false, message: 'AI could not determine a common name for the item. Please try again.' };
    }

    return { success: true, data: identificationResult };

  } catch (error) {
    console.error('AI processing error in processImageWithAI:', error);
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
    // Ensure the output structure is as expected, even if recipes array is empty
    if (result && Array.isArray(result.recipes)) {
        return result;
    }
    // If the structure is not as expected, treat it as an error or no recipes found
    console.warn(`Unexpected recipe generation result for ${produceName}:`, result);
    return { recipes: [] }; // Return empty recipes array to prevent client errors
  } catch (error) {
    console.error(`Error fetching recipes for ${produceName}:`, error);
    // const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while fetching recipes.';
    return null; // Indicate failure to the client
  }
}

    