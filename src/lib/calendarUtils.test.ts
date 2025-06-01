import { calculateStageTimings } from './calendarUtils';
import type { ProduceInfo } from './produceData'; // Assuming ProduceInfo and its sub-types are here

// Mock ProduceInfo['growing_guide'] type for testing if not easily available
type MockGrowingGuide = Array<{
  stage: string;
  duration_days: number;
  instructions: string[];
  // Add other optional fields from the actual type if needed for future tests
  micro_tips_warnings?: Array<{ type: string; content: string; collapsible?: boolean }>;
}>;


describe('calendarUtils - calculateStageTimings', () => {
  const baseDate = new Date('2024-01-01T00:00:00.000Z'); // Use a fixed date for consistent tests

  it('should calculate timings correctly for a typical growing guide', () => {
    const growingGuide: MockGrowingGuide = [
      { stage: 'Seedling', duration_days: 10, instructions: [] },
      { stage: 'Vegetative', duration_days: 20, instructions: [] },
      { stage: 'Fruiting', duration_days: 30, instructions: [] },
    ];
    const plantingDate = new Date(baseDate);
    const timings = calculateStageTimings(plantingDate, growingGuide);

    expect(timings).toHaveLength(3);

    // Stage 1: Seedling
    expect(timings[0].stage).toBe('Seedling');
    expect(timings[0].startDate.toISOString()).toBe(plantingDate.toISOString());
    const expectedEndDate1 = new Date(plantingDate);
    expectedEndDate1.setDate(plantingDate.getDate() + 10);
    expect(timings[0].endDate.toISOString()).toBe(expectedEndDate1.toISOString());

    // Stage 2: Vegetative
    expect(timings[1].stage).toBe('Vegetative');
    const expectedStartDate2 = new Date(expectedEndDate1);
    expectedStartDate2.setDate(expectedEndDate1.getDate() + 1); // Starts day after previous ends
    expect(timings[1].startDate.toISOString()).toBe(expectedStartDate2.toISOString());
    const expectedEndDate2 = new Date(expectedStartDate2);
    expectedEndDate2.setDate(expectedStartDate2.getDate() + 20);
    expect(timings[1].endDate.toISOString()).toBe(expectedEndDate2.toISOString());

    // Stage 3: Fruiting
    expect(timings[2].stage).toBe('Fruiting');
    const expectedStartDate3 = new Date(expectedEndDate2);
    expectedStartDate3.setDate(expectedEndDate2.getDate() + 1); // Starts day after previous ends
    expect(timings[2].startDate.toISOString()).toBe(expectedStartDate3.toISOString());
    const expectedEndDate3 = new Date(expectedStartDate3);
    expectedEndDate3.setDate(expectedStartDate3.getDate() + 30);
    expect(timings[2].endDate.toISOString()).toBe(expectedEndDate3.toISOString());
  });

  it('should return an empty array for an empty growing guide', () => {
    const growingGuide: MockGrowingGuide = [];
    const plantingDate = new Date(baseDate);
    const timings = calculateStageTimings(plantingDate, growingGuide);
    expect(timings).toEqual([]);
  });

  it('should handle a stage with zero duration_days', () => {
    const growingGuide: MockGrowingGuide = [
      { stage: 'Preparation', duration_days: 0, instructions: [] },
      { stage: 'Planting', duration_days: 5, instructions: [] },
    ];
    const plantingDate = new Date(baseDate);
    const timings = calculateStageTimings(plantingDate, growingGuide);

    expect(timings).toHaveLength(2);

    // Stage 1: Preparation (0 days)
    expect(timings[0].stage).toBe('Preparation');
    expect(timings[0].startDate.toISOString()).toBe(plantingDate.toISOString());
    const expectedEndDate1 = new Date(plantingDate); // End date is same as start date
    expect(timings[0].endDate.toISOString()).toBe(expectedEndDate1.toISOString());

    // Stage 2: Planting
    expect(timings[1].stage).toBe('Planting');
    const expectedStartDate2 = new Date(expectedEndDate1);
    expectedStartDate2.setDate(expectedEndDate1.getDate() + 1); // Starts day after previous ends
    expect(timings[1].startDate.toISOString()).toBe(expectedStartDate2.toISOString());
    const expectedEndDate2 = new Date(expectedStartDate2);
    expectedEndDate2.setDate(expectedStartDate2.getDate() + 5);
    expect(timings[1].endDate.toISOString()).toBe(expectedEndDate2.toISOString());
  });

  it('should correctly handle date cloning to avoid mutation issues', () => {
    const growingGuide: MockGrowingGuide = [
      { stage: 'Stage A', duration_days: 1, instructions: [] },
    ];
    const plantingDate = new Date(baseDate);
    const originalPlantingDateStr = plantingDate.toISOString();

    const timings = calculateStageTimings(plantingDate, growingGuide);

    // Ensure original plantingDate object was not modified
    expect(plantingDate.toISOString()).toBe(originalPlantingDateStr);
    expect(timings[0].startDate).not.toBe(plantingDate); // Check they are different objects
  });

  it('should calculate timings correctly across month and year boundaries', () => {
    const growingGuide: MockGrowingGuide = [
      { stage: 'Phase 1', duration_days: 15, instructions: [] }, // Will cross into Feb
      { stage: 'Phase 2', duration_days: 20, instructions: [] }, // Will stay in Feb
    ];
    // Start near end of month
    const plantingDate = new Date('2024-01-20T00:00:00.000Z');
    const timings = calculateStageTimings(plantingDate, growingGuide);

    expect(timings).toHaveLength(2);

    // Phase 1
    expect(timings[0].startDate.toISOString()).toBe('2024-01-20T00:00:00.000Z');
    // 20 Jan + 15 days = 4 Feb
    expect(timings[0].endDate.toISOString()).toBe('2024-02-04T00:00:00.000Z');

    // Phase 2
    // Starts 5 Feb
    expect(timings[1].startDate.toISOString()).toBe('2024-02-05T00:00:00.000Z');
    // 5 Feb + 20 days = 25 Feb
    expect(timings[1].endDate.toISOString()).toBe('2024-02-25T00:00:00.000Z');
  });
});
