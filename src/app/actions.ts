
'use server';

import { identifyFruitOrVegetableFromImage, IdentifyFruitOrVegetableFromImageOutput } from '@/ai/flows/identify-fruit-or-vegetable-from-image';
import { validateImageOfProduce, ValidateImageOfProduceOutput } from '@/ai/flows/validate-image-of-produce';
import { generateRecipes, GenerateRecipesOutput } from '@/ai/flows/generate-recipes-flow';
import { generateAgriTip } from '@/ai/flows/generate-agri-tip-flow'; // Updated import

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
    
    if (!identificationResult.isFruitOrVegetable) {
        return { success: false, message: 'Could not identify a specific fruit or vegetable in the image. Please try a clearer image.' };
    }
    
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

export async function fetchDynamicAgriTip(): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const defaultTip = "Did you know? Eating a variety of colorful fruits and vegetables is key to a healthy diet!";

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
    console.warn("GOOGLE_API_KEY is not set or is a placeholder. AgriPedia Tip generation will likely fail or use fallbacks.");
    // Return a more generic error-like tip if key isn't set, but the Genkit flow itself has a fallback
    return "AgriPedia Tip: AI features may be limited. Please check server configuration.";
  }

  try {
    const result = await generateAgriTip();
    if (result && typeof result.tip === 'string' && result.tip.trim() !== '') {
      return result.tip;
    }
    // This case means the flow ran but returned an empty or invalid tip.
    console.warn("AI AgriTip flow returned an empty or invalid tip. Using default.");
    return defaultTip;
  } catch (error) {
    console.error('Error fetching AI agri tip:', error);
    // This catch block will handle errors from calling generateAgriTip() itself
    return `Oops! We couldn't fetch a new tip right now. Tip: ${defaultTip}`;
  }
}
    
