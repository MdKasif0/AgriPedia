import { ProduceInfo } from './produceData'; // Assuming ProduceInfo is in produceData.ts

interface StageTiming {
  stage: string;
  startDate: Date;
  endDate: Date;
}

export function calculateStageTimings(
  plantingDate: Date,
  growingGuide: ProduceInfo['growing_guide']
): StageTiming[] {
  if (!growingGuide || growingGuide.length === 0) {
    return [];
  }

  const timings: StageTiming[] = [];
  let currentStartDate = new Date(plantingDate);

  for (const stage of growingGuide) {
    const durationInMs = stage.duration_days * 24 * 60 * 60 * 1000;
    const currentEndDate = new Date(currentStartDate.getTime() + durationInMs);

    timings.push({
      stage: stage.stage,
      startDate: new Date(currentStartDate), // Store a new Date object
      endDate: currentEndDate,
    });

    currentStartDate = new Date(currentEndDate.getTime() + 24 * 60 * 60 * 1000); // Next stage starts the day after the previous one ends
  }

  return timings;
}

// Helper function to add days to a date, might be useful elsewhere
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
