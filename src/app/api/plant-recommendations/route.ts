import { NextResponse } from 'next/server';
import { getAllPlants, calculatePlantCompatibilityScore } from '@/lib/plantDataStore';

export async function POST(request: Request) {
  try {
    const plannerData = await request.json();
    const plants = await getAllPlants();

    // Calculate compatibility scores for each plant
    const plantsWithScores = plants.map(plant => ({
      plant,
      score: calculatePlantCompatibilityScore(plant, plannerData)
    }));

    // Sort plants by compatibility score
    const sortedPlants = plantsWithScores
      .sort((a, b) => b.score - a.score)
      .map(({ plant }) => plant);

    // Return top 5 recommendations
    return NextResponse.json({
      recommendations: sortedPlants.slice(0, 5)
    });
  } catch (error) {
    console.error('Error processing plant recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to process plant recommendations' },
      { status: 500 }
    );
  }
} 