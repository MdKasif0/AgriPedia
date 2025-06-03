import { Plant, PlantRecommendation, PlantRecommendationFilters } from '@/types/plant';

// Mock plant database - In a real app, this would be in a database
const plantDatabase: Plant[] = [
  {
    id: '1',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    description: 'Popular garden vegetable with many varieties',
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a', '10b'],
    lightRequirements: 'full',
    difficultyLevel: 'beginner',
    growingSeason: { start: 3, end: 9 }, // March to September
    spaceRequirements: {
      minHeight: 60,
      minWidth: 30,
      containerFriendly: true
    },
    careInstructions: {
      watering: 'Regular watering, keep soil moist',
      soil: 'Well-draining, rich in organic matter',
      temperature: '18-27°C',
      humidity: 'Moderate'
    },
    harvestTime: { min: 60, max: 90 },
    companionPlants: ['Basil', 'Marigold', 'Garlic'],
    imageUrl: '/images/plants/tomato.jpg'
  },
  // Add more plants here...
];

export async function getPlantRecommendations(filters: PlantRecommendationFilters): Promise<PlantRecommendation[]> {
  // In a real app, this would call an AI service API
  // For now, we'll implement a simple scoring system
  
  const recommendations: PlantRecommendation[] = plantDatabase
    .map(plant => {
      let matchScore = 0;
      const matchReasons: string[] = [];

      // Climate zone compatibility
      if (plant.climateZones.includes(filters.climateZone)) {
        matchScore += 25;
        matchReasons.push('Suitable for your climate zone');
      }

      // Light requirements
      if (plant.lightRequirements === filters.lightRequirements) {
        matchScore += 20;
        matchReasons.push('Matches your light conditions');
      }

      // Experience level
      if (plant.difficultyLevel === filters.experienceLevel) {
        matchScore += 15;
        matchReasons.push('Appropriate for your experience level');
      }

      // Growing season
      const isInSeason = isPlantInSeason(plant, filters.currentMonth, filters.hemisphere);
      if (isInSeason) {
        matchScore += 20;
        matchReasons.push('Currently in growing season');
      }

      // Space requirements
      if (filters.spaceConstraints.containerOnly && plant.spaceRequirements.containerFriendly) {
        matchScore += 10;
        matchReasons.push('Suitable for container growing');
      }

      if (filters.spaceConstraints.maxHeight && plant.spaceRequirements.minHeight <= filters.spaceConstraints.maxHeight) {
        matchScore += 5;
        matchReasons.push('Fits your space constraints');
      }

      return {
        plant,
        matchScore,
        matchReasons
      };
    })
    .filter(rec => rec.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return recommendations;
}

function isPlantInSeason(plant: Plant, currentMonth: number, hemisphere: 'north' | 'south'): boolean {
  const { start, end } = plant.growingSeason;
  
  if (hemisphere === 'north') {
    return currentMonth >= start && currentMonth <= end;
  } else {
    // For southern hemisphere, we need to adjust the months
    const adjustedMonth = ((currentMonth + 6) % 12) || 12;
    return adjustedMonth >= start && adjustedMonth <= end;
  }
}

// Helper function to get current month and hemisphere
export function getCurrentGrowingContext(): { month: number; hemisphere: 'north' | 'south' } {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months are 0-based
  
  // Simple hemisphere detection based on latitude
  // In a real app, this would use the user's actual location
  const hemisphere = 'north'; // Default to north
  
  return { month, hemisphere };
} 