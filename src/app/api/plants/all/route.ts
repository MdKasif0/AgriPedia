import { NextResponse } from 'next/server';
import { getAllPlantData } from '../../../../lib/produceData'; // Adjust path as necessary

export async function GET(request: Request) {
  try {
    const plants = await getAllPlantData();
    if (!plants) {
      // This case might happen if getAllPlantData itself can return null/undefined
      // or an empty array that you want to treat as an error or specific case.
      // For now, assuming it returns an array, possibly empty.
      // If it's empty and that's an issue, handle accordingly.
    }
    return NextResponse.json(plants);
  } catch (error) {
    console.error('Failed to load all plant data in API route:', error);
    return NextResponse.json({ error: 'Failed to load plant data' }, { status: 500 });
  }
}
