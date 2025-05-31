import { defineFlow } from '@genkit-ai/flow';
import * as z from 'zod';

// Define the plant data structure
interface Plant {
  name: string;
  sunlight: 'Full Sun' | 'Partial Shade' | 'Full Shade';
  space: 'Balcony' | 'Yard' | 'Indoor';
  // Add other potential properties for future use
  notes?: string;
}

// Predefined list of plants
const allPlants: Plant[] = [
  { name: 'Tomato', sunlight: 'Full Sun', space: 'Yard', notes: 'Needs support like stakes or cages.' },
  { name: 'Bell Pepper', sunlight: 'Full Sun', space: 'Yard', notes: 'Prefers warm conditions.' },
  { name: 'Carrot', sunlight: 'Full Sun', space: 'Yard', notes: 'Needs deep, loose soil.' },
  { name: 'Lettuce', sunlight: 'Partial Shade', space: 'Balcony', notes: 'Can be grown in containers, prefers cooler weather.' },
  { name: 'Spinach', sunlight: 'Partial Shade', space: 'Balcony', notes: 'Tolerates shade, good for containers.' },
  { name: 'Kale', sunlight: 'Full Sun', space: 'Yard', notes: 'Hardy and productive.' }, // Also good for partial shade
  { name: 'Strawberry', sunlight: 'Full Sun', space: 'Balcony', notes: 'Can be grown in hanging baskets or pots.' },
  { name: 'Basil', sunlight: 'Full Sun', space: 'Indoor', notes: 'Needs a sunny windowsill.' },
  { name: 'Mint', sunlight: 'Partial Shade', space: 'Indoor', notes: 'Can be invasive in yards, best in pots.' },
  { name: 'Parsley', sunlight: 'Full Sun', space: 'Indoor', notes: 'Good for windowsills or containers.' }, // Also partial shade
  { name: 'Radish', sunlight: 'Full Sun', space: 'Balcony', notes: 'Grows quickly, good for small spaces.' }, // Also partial shade
  { name: 'Cucumber (bush type)', sunlight: 'Full Sun', space: 'Yard', notes: 'Compact varieties available for smaller yards.' },
  { name: 'Zucchini', sunlight: 'Full Sun', space: 'Yard', notes: 'Very productive, needs space.' },
  { name: 'Snake Plant', sunlight: 'Partial Shade', space: 'Indoor', notes: 'Very low maintenance, good for air purification.' },
  { name: 'Spider Plant', sunlight: 'Partial Shade', space: 'Indoor', notes: 'Easy to grow, produces plantlets.' },
];

// Define Zod schema for the flow input
export const SuggestPlantsInputSchema = z.object({
  location: z.string().optional(), // Optional for now
  space: z.enum(['Balcony', 'Yard', 'Indoor']),
  sunlight: z.enum(['Full Sun', 'Partial Shade', 'Full Shade']),
  goals: z.string().optional(), // Optional for now
});

// Define Zod schema for the flow output
export const SuggestPlantsOutputSchema = z.object({
  suggestions: z.array(z.string()),
  message: z.string().optional(), // For any additional messages, like if no plants match
});

// Placeholder for the actual flow definition - will complete in next step
export const suggestPlantsFlow = defineFlow(
  {
    name: 'suggestPlantsFlow',
    inputSchema: SuggestPlantsInputSchema,
    outputSchema: SuggestPlantsOutputSchema,
  },
  async (input) => {
    console.log('Suggest Plants Flow Input:', input); // Log for now

    const { space, sunlight, location, goals } = input;

    // Log location and goals (not used in filtering for this iteration)
    if (location) {
      console.log(`User location: ${location}`);
    }
    if (goals) {
      console.log(`User goals: ${goals}`);
    }

    const suggestedPlants = allPlants.filter(plant => {
      let matchesSunlight = false;
      let matchesSpace = false;

      // Sunlight matching logic (more lenient)
      if (plant.sunlight === sunlight) {
        matchesSunlight = true;
      } else if (sunlight === 'Partial Shade') {
        // Plants that like full sun can often tolerate partial shade
        // Plants that like full shade are less likely to thrive in partial shade if not specified
        matchesSunlight = plant.sunlight === 'Full Sun';
      } else if (sunlight === 'Full Sun' && plant.sunlight === 'Partial Shade') {
        // Some partial shade plants might tolerate full sun, but less common
        // For simplicity, we'll be strict here unless a plant is known for both
        // This could be refined with more plant data
      }
      // Full shade plants generally need full shade.

      // Space matching logic
      if (plant.space === space) {
        matchesSpace = true;
      } else if (space === 'Balcony' && plant.space === 'Indoor') {
        // Indoor plants can often be on a balcony
        matchesSpace = true;
      } else if (space === 'Indoor' && plant.space === 'Balcony') {
         // Balcony plants might be indoor if they are container friendly
        matchesSpace = true;
      }
      // Yard is generally specific.

      return matchesSunlight && matchesSpace;
    });

    const plantNames = suggestedPlants.map(plant => plant.name);
    let message;

    if (plantNames.length === 0) {
      message = "No specific plants match your exact criteria with our current list. Consider broadening your options or trying plants known for versatility.";
    } else if (plantNames.length < 3) {
      message = "Found a few potential matches! You might also explore similar plants or those adaptable to slightly different conditions.";
    }


    return {
      suggestions: plantNames,
      message: message,
    };
  }
);
