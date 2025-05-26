
'use server';

import { identifyFruitOrVegetableFromImage, IdentifyFruitOrVegetableFromImageOutput } from '@/ai/flows/identify-fruit-or-vegetable-from-image';
import { validateImageOfProduce, ValidateImageOfProduceOutput } from '@/ai/flows/validate-image-of-produce';
import { generateRecipes, GenerateRecipesOutput } from '@/ai/flows/generate-recipes-flow';
import { getRandomAgriTip } from '@/lib/tipUtils'; // Updated import

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
    if (!identificationResult.commonName || identificationResult.commonName.trim() === "" || identificationResult.commonName.toLowerCase() === "unknown") {
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
    if (result && Array.isArray(result.recipes)) {
        return result;
    }
    console.warn(`Unexpected recipe generation result for ${produceName}:`, result);
    return { recipes: [] }; 
  } catch (error) {
    console.error(`Error fetching recipes for ${produceName}:`, error);
    return null; 
  }
}

export async function fetchDynamicAgriTip(): Promise<string | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn("GOOGLE_API_KEY is not set or is a placeholder. AgriPedia Tip will use local static tips.");
    // Fallback to local tips if API key isn't properly configured for other AI features
    // This specific action now *only* uses local tips.
  }

  try {
    const tip = getRandomAgriTip(); // Now gets a tip from local JSON
    if (tip) {
      return tip;
    }
    // This fallback might be redundant now given getRandomAgriTip has its own, but good for safety.
    return "Keep exploring the fascinating world of produce!";
  } catch (error) {
    console.error('Error fetching agri tip (from local store):', error);
    // If local fetching fails for some reason (e.g., JSON parse error, though unlikely with this setup)
    return "Could not load a tip right now. Check back soon!"; 
  }
}
    
